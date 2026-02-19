import { vi } from "vitest";
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
			Promise.resolve({ keys: [], list_complete: true, cursor: "", cacheStatus: null }),
		),
		getWithMetadata: vi.fn(() =>
			Promise.resolve({ value: null, metadata: null, cacheStatus: null }),
		),
	} as unknown as KVNamespace;
}

type D1Row = Record<string, unknown>;

export function createMockD1(rows: D1Row[] = []): D1Database {
	const stmt = {
		bind: vi.fn().mockReturnThis(),
		first: vi.fn(() => Promise.resolve(rows[0] ?? null)),
		all: vi.fn(() =>
			Promise.resolve({ results: rows, success: true, meta: {} }),
		),
		run: vi.fn(() =>
			Promise.resolve({ success: true, meta: {}, results: [] }),
		),
	};
	return {
		prepare: vi.fn(() => stmt),
		batch: vi.fn(),
		exec: vi.fn(),
		dump: vi.fn(),
	} as unknown as D1Database;
}

export function createEnv(
	overrides: Partial<AppEnv["Bindings"]> = {},
): AppEnv["Bindings"] {
	return {
		DB: createMockD1(),
		SESSION_KV: createMockKV(),
		LINE_CHANNEL_ID: "test_channel_id",
		LINE_CHANNEL_SECRET: "test_channel_secret",
		...overrides,
	};
}
