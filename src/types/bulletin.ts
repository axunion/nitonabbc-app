// Service roles that can be assigned to members for filtering assignment candidates
export const SERVICE_ROLES = ["司会", "奏楽", "説教", "受付"] as const;
export type ServiceRole = (typeof SERVICE_ROLES)[number];

export type InputType = "text" | "member" | "none";

export type TemplateField = {
  key: string;
  label: string;
  inputType: InputType;
  // When inputType is "member", filter candidates to members with this service role.
  // Omit to show all members.
  role?: string;
};

export type TemplateItem = {
  type: string;
  label: string;
  inputType?: InputType;
  fields?: TemplateField[];
  // When inputType is "member", filter candidates to members with this service role.
  role?: string;
};

export type WorshipItem = {
  type: string;
  label: string;
  details?: string;
  fieldValues?: Record<string, string>;
};

export type Announcement = {
  heading?: string;
  content: string;
};

export type WeeklyPrayerDay = {
  key: string;
  label: string;
  defaults: string[];
};

export const DEFAULT_WEEKLY_PRAYER_DAYS: WeeklyPrayerDay[] = [
  { key: "日", label: "日曜日", defaults: [] },
  { key: "月", label: "月曜日", defaults: [] },
  { key: "火", label: "火曜日", defaults: [] },
  { key: "水", label: "水曜日", defaults: [] },
  { key: "木", label: "木曜日", defaults: [] },
  { key: "金", label: "金曜日", defaults: [] },
  { key: "土", label: "土曜日", defaults: [] },
];

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

export type WeeklyPrayerSectionTemplate = {
  id: string;
  type: "weekly-prayer";
  label: string;
  visible?: boolean;
  config: { days: WeeklyPrayerDay[] };
};

export type UpcomingEventsSectionTemplate = {
  id: string;
  type: "upcoming-events";
  label: string;
  visible?: boolean;
  config: Record<never, never>;
};

export type BirthdaysSectionTemplate = {
  id: string;
  type: "birthdays";
  label: string;
  visible?: boolean;
  config: Record<never, never>;
};

export type ScriptureQuotesSectionTemplate = {
  id: string;
  type: "scripture-quotes";
  label: string;
  visible?: boolean;
  config: Record<never, never>;
};

export type AttendanceSectionTemplate = {
  id: string;
  type: "attendance";
  label: string;
  visible?: boolean;
  config: { meetings: { key: string; label: string }[] };
};

export type ServiceMetaFieldDef = {
  key: string;
  label: string;
  inputType: "text" | "member" | "time";
};

export type ServiceMetaSectionTemplate = {
  id: string;
  type: "service-meta";
  label: string;
  visible?: boolean;
  config: { fieldDefs: ServiceMetaFieldDef[] };
};

export type FinancialSummaryItem = {
  key: string;
  label: string;
  unit?: string;
};

export type FinancialSummarySectionTemplate = {
  id: string;
  type: "financial-summary";
  label: string;
  visible?: boolean;
  config: { items: FinancialSummaryItem[] };
};

export type SectionTemplate =
  | WorshipProgramSectionTemplate
  | AnnouncementsSectionTemplate
  | AssignmentsSectionTemplate
  | WeeklyVerseSectionTemplate
  | MonthlySongSectionTemplate
  | TextBlockSectionTemplate
  | WeeklyPrayerSectionTemplate
  | UpcomingEventsSectionTemplate
  | BirthdaysSectionTemplate
  | ScriptureQuotesSectionTemplate
  | AttendanceSectionTemplate
  | ServiceMetaSectionTemplate
  | FinancialSummarySectionTemplate;

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
  data: { title: string; lyrics: string };
};

export type TextBlockSectionData = {
  id: string;
  type: "text-block";
  label: string;
  data: { heading: string; body: string };
};

export type WeeklyPrayerSectionData = {
  id: string;
  type: "weekly-prayer";
  label: string;
  data: Record<string, string[]>;
};

export type UpcomingEvent = {
  date: string;
  description: string;
};

export type UpcomingEventsSectionData = {
  id: string;
  type: "upcoming-events";
  label: string;
  data: UpcomingEvent[];
};

export type Birthday = {
  day: string;
  name: string;
};

export type BirthdaysSectionData = {
  id: string;
  type: "birthdays";
  label: string;
  data: Birthday[];
};

export type ScriptureQuote = {
  reference: string;
  text: string;
};

export type ScriptureQuotesSectionData = {
  id: string;
  type: "scripture-quotes";
  label: string;
  data: ScriptureQuote[];
};

export type AttendanceSectionData = {
  id: string;
  type: "attendance";
  label: string;
  data: Record<string, { adults: string; children?: string; note?: string }>;
};

export type ServiceMetaSectionData = {
  id: string;
  type: "service-meta";
  label: string;
  data: { fieldValues: Record<string, string> };
};

export type FinancialSummarySectionData = {
  id: string;
  type: "financial-summary";
  label: string;
  data: Record<string, { amount: string; note?: string }>;
};

export type SectionData =
  | WorshipProgramSectionData
  | AnnouncementsSectionData
  | AssignmentsSectionData
  | WeeklyVerseSectionData
  | MonthlySongSectionData
  | TextBlockSectionData
  | WeeklyPrayerSectionData
  | UpcomingEventsSectionData
  | BirthdaysSectionData
  | ScriptureQuotesSectionData
  | AttendanceSectionData
  | ServiceMetaSectionData
  | FinancialSummarySectionData;

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
  serviceRoles: string[];
};
