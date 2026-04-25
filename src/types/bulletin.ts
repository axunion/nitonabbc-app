export type InputType = "text" | "number" | "member" | "scripture" | "none";

export type TemplateField = {
	key: string;
	label: string;
	inputType: InputType;
};

export type TemplateItem = {
	type: string;
	label: string;
	inputType?: InputType;
	fields?: TemplateField[];
};

export type WorshipItem = {
	type: string;
	label: string;
	details?: string;
	fieldValues?: Record<string, string>;
	assigneeId?: number | null;
};

export type Announcement = {
	heading?: string;
	content: string;
};

// Section template types (structure)

export type WorshipProgramSectionTemplate = {
	id: string;
	type: "worship-program";
	label: string;
	visible?: boolean;
	config: { items: TemplateItem[] };
};

export type AnnouncementsSectionTemplate = {
	id: string;
	type: "announcements";
	label: string;
	visible?: boolean;
	config: { subHeadings?: string[] };
};

export type AssignmentsSectionTemplate = {
	id: string;
	type: "assignments";
	label: string;
	visible?: boolean;
	config: { roles: string[] };
};

export type WeeklyVerseSectionTemplate = {
	id: string;
	type: "weekly-verse";
	label: string;
	visible?: boolean;
	config: Record<never, never>;
};

export type MonthlySongSectionTemplate = {
	id: string;
	type: "monthly-song";
	label: string;
	visible?: boolean;
	config: Record<never, never>;
};

export type TextBlockSectionTemplate = {
	id: string;
	type: "text-block";
	label: string;
	visible?: boolean;
	config: Record<never, never>;
};

export type SectionTemplate =
	| WorshipProgramSectionTemplate
	| AnnouncementsSectionTemplate
	| AssignmentsSectionTemplate
	| WeeklyVerseSectionTemplate
	| MonthlySongSectionTemplate
	| TextBlockSectionTemplate;

// Section data types (values)

export type WorshipProgramSectionData = {
	id: string;
	type: "worship-program";
	label: string;
	data: WorshipItem[];
};

export type AnnouncementsSectionData = {
	id: string;
	type: "announcements";
	label: string;
	data: Announcement[];
};

export type AssignmentsSectionData = {
	id: string;
	type: "assignments";
	label: string;
	data: Record<string, string>;
};

export type WeeklyVerseSectionData = {
	id: string;
	type: "weekly-verse";
	label: string;
	data: { reference: string; text: string };
};

export type MonthlySongSectionData = {
	id: string;
	type: "monthly-song";
	label: string;
	data: { title: string; keywords: string[] };
};

export type TextBlockSectionData = {
	id: string;
	type: "text-block";
	label: string;
	data: { heading: string; body: string };
};

export type SectionData =
	| WorshipProgramSectionData
	| AnnouncementsSectionData
	| AssignmentsSectionData
	| WeeklyVerseSectionData
	| MonthlySongSectionData
	| TextBlockSectionData;

// Forward-compat: unknown section types are passed through without crashing
export type UnknownSection = {
	id: string;
	type: string;
	label: string;
	data?: unknown;
};

export type AnySection = SectionData | UnknownSection;

export type BulletinSummary = {
	id: number;
	serviceDate: string;
	createdBy: number;
	updatedBy: number;
	createdAt: string;
	updatedAt: string;
	totalItems: number;
	filledItems: number;
};

export type BulletinDetail = BulletinSummary & {
	sections: AnySection[];
};

export type BulletinListResponse = {
	bulletins: BulletinSummary[];
	nextSunday: string;
};

export type Member = {
	id: number;
	name: string;
};
