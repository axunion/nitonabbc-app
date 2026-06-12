import type { SectionTemplate, TemplateItem } from "../db/types.ts";

const MORNING_WORSHIP_ITEMS: TemplateItem[] = [
	{ type: "prelude", label: "前奏", inputType: "none" },
	{ type: "hymn", label: "賛美歌", inputType: "text" },
	{ type: "prayer", label: "祈り", inputType: "member" },
	{ type: "reading", label: "聖書朗読", inputType: "text" },
	{
		type: "sermon",
		label: "説教",
		fields: [
			{ key: "title", label: "タイトル", inputType: "text" },
			{ key: "preacher", label: "説教者", inputType: "member" },
			{ key: "scripture", label: "聖書箇所", inputType: "text" },
		],
	},
	{ type: "offering", label: "献金", inputType: "none" },
	{ type: "hymn2", label: "賛美歌", inputType: "text" },
	{ type: "doxology", label: "頌栄", inputType: "none" },
	{ type: "benediction", label: "祝祷", inputType: "none" },
];

const AFTERNOON_WORSHIP_ITEMS: TemplateItem[] = [
	{ type: "hymn", label: "賛美歌", inputType: "text" },
	{ type: "prayer", label: "祈り", inputType: "member" },
	{ type: "reading", label: "聖書朗読", inputType: "text" },
	{
		type: "sermon",
		label: "説教",
		fields: [
			{ key: "title", label: "タイトル", inputType: "text" },
			{ key: "preacher", label: "説教者", inputType: "member" },
			{ key: "scripture", label: "聖書箇所", inputType: "text" },
		],
	},
	{ type: "hymn2", label: "賛美歌", inputType: "text" },
	{ type: "benediction", label: "祝祷", inputType: "none" },
];

// Fixed section structure matching the church's standard bulletin.
// Sections can no longer be added or removed from the admin UI, so any
// section type meant to be usable must be present here.
// service-meta is intentionally excluded: it duplicates the assignments section.
export const DEFAULT_TEMPLATE: SectionTemplate[] = [
	{
		id: "morning",
		type: "worship-program",
		label: "午前礼拝",
		visible: true,
		config: { items: MORNING_WORSHIP_ITEMS },
	},
	{
		id: "afternoon",
		type: "worship-program",
		label: "午後集会",
		visible: true,
		config: { items: AFTERNOON_WORSHIP_ITEMS },
	},
	{
		id: "news",
		type: "announcements",
		label: "報告・お知らせ",
		visible: true,
		config: { subHeadings: ["報告", "お知らせ"] },
	},
	{
		id: "assignments-this",
		type: "assignments",
		label: "今週の奉仕",
		visible: true,
		config: { roles: ["司会", "奏楽", "特賛", "受付"] },
	},
	{
		id: "assignments-next",
		type: "assignments",
		label: "次週の奉仕",
		visible: true,
		config: { roles: ["司会", "奏楽", "特賛", "受付"] },
	},
	{
		id: "attendance",
		type: "attendance",
		label: "出席人数",
		visible: true,
		config: {
			meetings: [
				{ key: "morning", label: "朝礼拝" },
				{ key: "afternoon", label: "午後集会" },
				{ key: "cs", label: "CS" },
				{ key: "prayer", label: "祈祷会" },
			],
		},
	},
	{
		id: "weekly-prayer",
		type: "weekly-prayer",
		label: "曜日別祈りの課題",
		visible: true,
		config: {},
	},
	{
		id: "upcoming-events",
		type: "upcoming-events",
		label: "今後の予定",
		visible: true,
		config: {},
	},
	{
		id: "weekly-verse",
		type: "weekly-verse",
		label: "今週のみことば",
		visible: true,
		config: {},
	},
	{
		id: "monthly-song",
		type: "monthly-song",
		label: "今月の歌",
		visible: true,
		config: {},
	},
	{
		id: "birthdays",
		type: "birthdays",
		label: "今月の誕生日",
		visible: true,
		config: {},
	},
	{
		id: "financial-summary",
		type: "financial-summary",
		label: "財務報告",
		visible: true,
		config: {
			items: [{ key: "hall_fund", label: "会堂献金積立", unit: "円" }],
		},
	},
	{
		id: "scripture-quotes",
		type: "scripture-quotes",
		label: "引用聖句",
		visible: true,
		config: {},
	},
	{
		id: "text-block",
		type: "text-block",
		label: "自由記述",
		visible: true,
		config: {},
	},
];
