import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { SectionData } from "./types.ts";

export const users = sqliteTable(
	"users",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		name: text("name").notNull(),
		role: text("role", { enum: ["admin", "member"] as const })
			.notNull()
			.default("member"),
		lineUserId: text("line_user_id").unique(),
		inviteToken: text("invite_token").unique().notNull(),
		inviteUsed: integer("invite_used", { mode: "boolean" })
			.notNull()
			.default(false),
		isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
		createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
		updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
	},
	(table) => [
		index("idx_users_line_user_id").on(table.lineUserId),
		index("idx_users_invite_token").on(table.inviteToken),
	],
);

export const bulletins = sqliteTable(
	"bulletins",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		serviceDate: text("service_date").unique().notNull(),
		sections: text("sections", { mode: "json" })
			.$type<SectionData[]>()
			.notNull()
			.default(sql`'[]'`),
		createdBy: integer("created_by")
			.notNull()
			.references(() => users.id),
		updatedBy: integer("updated_by")
			.notNull()
			.references(() => users.id),
		createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
		updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
	},
	(table) => [index("idx_bulletins_service_date").on(table.serviceDate)],
);

export const settings = sqliteTable("settings", {
	key: text("key").primaryKey(),
	value: text("value").notNull(),
	updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});
