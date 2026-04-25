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
	| "text-block";

export const SECTION_TYPES: SectionType[] = [
	"worship-program",
	"announcements",
	"assignments",
	"weekly-verse",
	"monthly-song",
	"text-block",
];

export function defaultConfigFor(type: SectionType): SectionTemplate["config"] {
	if (type === "worship-program") return { items: [] };
	if (type === "announcements") return { subHeadings: [] };
	if (type === "weekly-verse") return {};
	if (type === "monthly-song") return {};
	if (type === "text-block") return {};
	return { roles: [] };
}
