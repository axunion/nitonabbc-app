export type WorshipItem = {
	type: string;
	label: string;
	details?: string;
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
};

export type BulletinDetail = BulletinSummary & {
	worship: WorshipItem[];
	announcements: Announcement[];
	assignments: Record<string, string>;
};
