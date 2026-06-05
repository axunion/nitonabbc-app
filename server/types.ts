import type { Db } from "./db/index.ts";

export type UserRole = "admin" | "member";

export type User = {
	id: number;
	name: string;
	role: UserRole;
	lineUserId: string;
	isActive: boolean;
};

export type SessionData = {
	userId: number;
	lineUserId: string;
	role: UserRole;
};

export type AppEnv = {
	Bindings: {
		DB: D1Database;
		SESSION_KV: KVNamespace;
		LINE_CHANNEL_ID: string;
		LINE_CHANNEL_SECRET: string;
		DEV_AUTH?: string;
	};
	Variables: {
		user: User;
		db: Db;
	};
};
