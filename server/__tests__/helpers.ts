import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { Hono } from "hono";
import { vi } from "vitest";
import * as schema from "../db/schema.ts";
import type { AppEnv } from "../types.ts";

export function createMockKV(
	initial: Record<string, string> = {},
): KVNamespace {
	const store = new Map(Object.entries(initial));
	return {
		get: vi.fn((key: string) => Promise.resolve(store.get(key) ?? null)),
		put: vi.fn((key: string, value: string) => {
			store.set(key, value);
			return Promise.resolve();
		}),
		delete: vi.fn((key: string) => {
			store.delete(key);
			return Promise.resolve();
		}),
		list: vi.fn(() =>
			Promise.resolve({
				keys: [],
				list_complete: true,
				cursor: "",
				cacheStatus: null,
			}),
		),
		getWithMetadata: vi.fn(() =>
			Promise.resolve({ value: null, metadata: null, cacheStatus: null }),
		),
	} as unknown as KVNamespace;
}

export function createEnv(
	overrides: Partial<AppEnv["Bindings"]> = {},
): AppEnv["Bindings"] {
	return {
		DB: {} as D1Database, // not used directly; db is injected via wrapWithDb
		SESSION_KV: createMockKV(),
		LINE_CHANNEL_ID: "test_channel_id",
		LINE_CHANNEL_SECRET: "test_channel_secret",
		...overrides,
	};
}

export type TestDb = ReturnType<typeof createTestDb>;

/** Create an in-memory SQLite database with migrations applied. */
export function createTestDb() {
	const sqlite = new Database(":memory:");
	const db = drizzle(sqlite, { schema });
	const migrationsFolder = fileURLToPath(
		new URL("../../drizzle", import.meta.url).href,
	);
	migrate(db, { migrationsFolder });
	return db;
}

/**
 * Wrap a Hono app with a middleware that injects the test db into the context.
 * The real dbMiddleware is idempotent and will skip if db is already set.
 */
export function wrapWithDb<T extends Hono<AppEnv>>(
	app: T,
	db: TestDb,
): Hono<AppEnv> {
	const wrapper = new Hono<AppEnv>();
	wrapper.use("*", (c, next) => {
		c.set("db", db);
		return next();
	});
	wrapper.route("/", app);
	return wrapper;
}
