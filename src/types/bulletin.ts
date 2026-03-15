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
	content: string;
};

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
	worship: WorshipItem[];
	announcements: Announcement[];
	assignments: Record<string, string>;
};

export type BulletinListResponse = {
	bulletins: BulletinSummary[];
	nextSunday: string;
};

export type Member = {
	id: number;
	name: string;
};
