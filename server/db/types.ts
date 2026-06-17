// Shared bulletin section types used by server routes and the drizzle schema.

// Service roles that can be assigned to members for filtering candidates
export const SERVICE_ROLES = ["司会", "奏楽", "説教", "受付"] as const;
export type ServiceRole = (typeof SERVICE_ROLES)[number];

export type WorshipItemData = {
  type: string;
  label: string;
  details?: string;
  fieldValues?: Record<string, string>;
};

export type TemplateField = {
  key: string;
  label: string;
  inputType: string;
  // When inputType is "member", filter candidates to members with this service role.
  // Omit to show all members.
  role?: string;
};

export type TemplateItem = {
  type: string;
  label: string;
  inputType?: string;
  fields?: TemplateField[];
  // When inputType is "member", filter candidates to members with this service role.
  role?: string;
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
      config: { days: WeeklyPrayerDay[] };
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
      data: { title: string; lyrics: string };
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
      data: Record<string, string[]>;
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
