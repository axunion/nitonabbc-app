// Shared bulletin section types used by server routes and the drizzle schema.

export type WorshipItemData = {
	type: string;
	label: string;
	details?: string;
	fieldValues?: Record<string, string>;
	assigneeId?: number | null;
};

export type TemplateField = {
	key: string;
	label: string;
	inputType: string;
};

export type TemplateItem = {
	type: string;
	label: string;
	inputType?: string;
	fields?: TemplateField[];
};

export type SectionTemplate =
	| {
			id: string;
			type: "worship-program";
			label: string;
			visible?: boolean;
			config: { items: TemplateItem[] };
	  }
	| {
			id: string;
			type: "announcements";
			label: string;
			visible?: boolean;
			config: { subHeadings?: string[] };
	  }
	| {
			id: string;
			type: "assignments";
			label: string;
			visible?: boolean;
			config: { roles: string[] };
	  }
	| {
			id: string;
			type: "weekly-verse";
			label: string;
			visible?: boolean;
			config: Record<never, never>;
	  }
	| {
			id: string;
			type: "monthly-song";
			label: string;
			visible?: boolean;
			config: Record<never, never>;
	  }
	| {
			id: string;
			type: "text-block";
			label: string;
			visible?: boolean;
			config: Record<never, never>;
	  }
	| {
			id: string;
			type: "weekly-prayer";
			label: string;
			visible?: boolean;
			config: Record<never, never>;
	  }
	| {
			id: string;
			type: "upcoming-events";
			label: string;
			visible?: boolean;
			config: Record<never, never>;
	  }
	| {
			id: string;
			type: "birthdays";
			label: string;
			visible?: boolean;
			config: Record<never, never>;
	  }
	| {
			id: string;
			type: "scripture-quotes";
			label: string;
			visible?: boolean;
			config: Record<never, never>;
	  }
	| {
			id: string;
			type: "attendance";
			label: string;
			visible?: boolean;
			config: { meetings: { key: string; label: string }[] };
	  }
	| {
			id: string;
			type: "service-meta";
			label: string;
			visible?: boolean;
			config: {
				fieldDefs: { key: string; label: string; inputType: string }[];
			};
	  }
	| {
			id: string;
			type: "financial-summary";
			label: string;
			visible?: boolean;
			config: { items: { key: string; label: string; unit?: string }[] };
	  };

export type SectionData =
	| {
			id: string;
			type: "worship-program";
			label: string;
			data: WorshipItemData[];
	  }
	| {
			id: string;
			type: "announcements";
			label: string;
			data: { heading?: string; content: string }[];
	  }
	| {
			id: string;
			type: "assignments";
			label: string;
			data: Record<string, string>;
	  }
	| {
			id: string;
			type: "weekly-verse";
			label: string;
			data: { reference: string; text: string };
	  }
	| {
			id: string;
			type: "monthly-song";
			label: string;
			data: { title: string; keywords: string[] };
	  }
	| {
			id: string;
			type: "text-block";
			label: string;
			data: { heading: string; body: string };
	  }
	| {
			id: string;
			type: "weekly-prayer";
			label: string;
			data: Record<string, string>;
	  }
	| {
			id: string;
			type: "upcoming-events";
			label: string;
			data: { date: string; description: string }[];
	  }
	| {
			id: string;
			type: "birthdays";
			label: string;
			data: { day: string; name: string }[];
	  }
	| {
			id: string;
			type: "scripture-quotes";
			label: string;
			data: { reference: string; text: string }[];
	  }
	| {
			id: string;
			type: "attendance";
			label: string;
			data: Record<
				string,
				{ adults: string; children?: string; note?: string }
			>;
	  }
	| {
			id: string;
			type: "service-meta";
			label: string;
			data: { fieldValues: Record<string, string> };
	  }
	| {
			id: string;
			type: "financial-summary";
			label: string;
			data: Record<string, { amount: string; note?: string }>;
	  };
