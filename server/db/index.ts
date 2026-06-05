import { drizzle } from "drizzle-orm/d1";
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import * as schema from "./schema.ts";

export type { SectionData, SectionTemplate } from "./types.ts";
export { schema };

export const createDb = (d1: D1Database) => drizzle(d1, { schema });

// Common base type for both D1 (production) and better-sqlite3 (tests) adapters.
// Avoids D1-specific APIs (e.g. db.batch()) leaking into route handlers.
export type Db = BaseSQLiteDatabase<"async" | "sync", unknown, typeof schema>;
