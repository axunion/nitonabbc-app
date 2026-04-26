import type { InputType, SectionTemplate } from "@/types/bulletin.ts";

export const INPUT_TYPES: InputType[] = [
	"text",
	"number",
	"member",
	"scripture",
	"none",
];

export type SectionType =
	| "worship-program"
	| "announcements"
	| "assignments"
	| "weekly-verse"
	| "monthly-song"
	| "text-block"
	| "weekly-prayer"
	| "upcoming-events"
	| "birthdays"
	| "scripture-quotes"
	| "attendance"
	| "service-meta"
	| "financial-summary";

export const SECTION_TYPES: SectionType[] = [
	"worship-program",
	"announcements",
	"assignments",
	"weekly-verse",
	"monthly-song",
	"text-block",
	"weekly-prayer",
	"upcoming-events",
	"birthdays",
	"scripture-quotes",
	"attendance",
	"service-meta",
	"financial-summary",
];

export function defaultConfigFor(type: SectionType): SectionTemplate["config"] {
	if (type === "worship-program") return { items: [] };
	if (type === "announcements") return { subHeadings: [] };
	if (type === "weekly-verse") return {};
	if (type === "monthly-song") return {};
	if (type === "text-block") return {};
	if (type === "weekly-prayer") return {};
	if (type === "upcoming-events") return {};
	if (type === "birthdays") return {};
	if (type === "scripture-quotes") return {};
	if (type === "attendance") return { meetings: [] };
	if (type === "service-meta") return { fieldDefs: [] };
	if (type === "financial-summary") return { items: [] };
	return { roles: [] };
}
