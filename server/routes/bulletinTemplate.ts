import { eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import type { SectionTemplate } from "../db/index.ts";
import { settings } from "../db/schema.ts";
import { adminMiddleware } from "../middleware/admin.ts";
import { authMiddleware } from "../middleware/auth.ts";
import type { AppEnv } from "../types.ts";
import { DEFAULT_TEMPLATE } from "./bulletinTemplateDefaults.ts";

type TemplateField = {
  key: string;
  label: string;
  inputType: string;
};

type TemplateItem = {
  type: string;
  label: string;
  inputType?: string;
  fields?: TemplateField[];
};

const VALID_INPUT_TYPES = ["text", "number", "member", "scripture", "none"];
const VALID_SECTION_TYPES = [
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

function isValidField(field: unknown): field is TemplateField {
  if (typeof field !== "object" || field === null) return false;
  const f = field as Record<string, unknown>;
  return (
    typeof f.key === "string" &&
    f.key.length > 0 &&
    typeof f.label === "string" &&
    f.label.length > 0 &&
    typeof f.inputType === "string" &&
    VALID_INPUT_TYPES.includes(f.inputType)
  );
}

function isValidWorshipConfig(config: unknown): boolean {
  if (typeof config !== "object" || config === null) return false;
  const c = config as Record<string, unknown>;
  if (!Array.isArray(c.items) || c.items.length === 0) return false;
  return c.items.every((item: unknown) => {
    if (typeof item !== "object" || item === null) return false;
    const t = item as Record<string, unknown>;
    if (
      typeof t.type !== "string" ||
      t.type.length === 0 ||
      typeof t.label !== "string" ||
      t.label.length === 0
    )
      return false;
    if (
      t.inputType !== undefined &&
      !VALID_INPUT_TYPES.includes(t.inputType as string)
    )
      return false;
    if (t.fields !== undefined) {
      if (!Array.isArray(t.fields) || t.fields.length === 0) return false;
      if (!t.fields.every(isValidField)) return false;
    }
    return true;
  });
}

function isValidAnnouncementsConfig(config: unknown): boolean {
  if (typeof config !== "object" || config === null) return false;
  const c = config as Record<string, unknown>;
  if (c.subHeadings !== undefined) {
    if (!Array.isArray(c.subHeadings)) return false;
    if (!c.subHeadings.every((s: unknown) => typeof s === "string"))
      return false;
  }
  return true;
}

function isValidAssignmentsConfig(config: unknown): boolean {
  if (typeof config !== "object" || config === null) return false;
  const c = config as Record<string, unknown>;
  if (!Array.isArray(c.roles) || c.roles.length === 0) return false;
  return c.roles.every(
    (r: unknown) => typeof r === "string" && (r as string).length > 0,
  );
}

function isValidEmptyConfig(config: unknown): boolean {
  return (
    typeof config === "object" && config !== null && !Array.isArray(config)
  );
}

function isValidAttendanceConfig(config: unknown): boolean {
  if (typeof config !== "object" || config === null) return false;
  const c = config as Record<string, unknown>;
  if (!Array.isArray(c.meetings)) return false;
  return c.meetings.every(
    (m: unknown) =>
      typeof m === "object" &&
      m !== null &&
      typeof (m as Record<string, unknown>).key === "string" &&
      typeof (m as Record<string, unknown>).label === "string",
  );
}

function isValidServiceMetaConfig(config: unknown): boolean {
  if (typeof config !== "object" || config === null) return false;
  const c = config as Record<string, unknown>;
  if (!Array.isArray(c.fieldDefs)) return false;
  const validInputTypes = ["text", "member", "time"];
  return c.fieldDefs.every(
    (f: unknown) =>
      typeof f === "object" &&
      f !== null &&
      typeof (f as Record<string, unknown>).key === "string" &&
      (f as Record<string, unknown>).key !== "" &&
      typeof (f as Record<string, unknown>).label === "string" &&
      (f as Record<string, unknown>).label !== "" &&
      validInputTypes.includes(
        (f as Record<string, unknown>).inputType as string,
      ),
  );
}

function isValidFinancialSummaryConfig(config: unknown): boolean {
  if (typeof config !== "object" || config === null) return false;
  const c = config as Record<string, unknown>;
  if (!Array.isArray(c.items)) return false;
  return c.items.every(
    (item: unknown) =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as Record<string, unknown>).key === "string" &&
      (item as Record<string, unknown>).key !== "" &&
      typeof (item as Record<string, unknown>).label === "string" &&
      (item as Record<string, unknown>).label !== "",
  );
}

function isValidSection(section: unknown): section is SectionTemplate {
  if (typeof section !== "object" || section === null) return false;
  const s = section as Record<string, unknown>;
  if (typeof s.id !== "string" || s.id.length === 0) return false;
  if (typeof s.type !== "string" || !VALID_SECTION_TYPES.includes(s.type))
    return false;
  if (typeof s.label !== "string" || s.label.length === 0) return false;
  if (s.visible !== undefined && typeof s.visible !== "boolean") return false;
  if (s.type === "worship-program") return isValidWorshipConfig(s.config);
  if (s.type === "announcements") return isValidAnnouncementsConfig(s.config);
  if (s.type === "assignments") return isValidAssignmentsConfig(s.config);
  if (
    s.type === "weekly-verse" ||
    s.type === "monthly-song" ||
    s.type === "text-block" ||
    s.type === "weekly-prayer" ||
    s.type === "upcoming-events" ||
    s.type === "birthdays" ||
    s.type === "scripture-quotes"
  )
    return isValidEmptyConfig(s.config);
  if (s.type === "attendance") return isValidAttendanceConfig(s.config);
  if (s.type === "service-meta") return isValidServiceMetaConfig(s.config);
  if (s.type === "financial-summary")
    return isValidFinancialSummaryConfig(s.config);
  return false;
}

function isValidTemplate(body: unknown): body is SectionTemplate[] {
  if (!Array.isArray(body) || body.length === 0) return false;
  if (!body.every(isValidSection)) return false;
  const ids = body.map((s) => (s as Record<string, unknown>).id);
  return new Set(ids).size === ids.length;
}

// "number" and "scripture" were once selectable; they now mean plain text
const LEGACY_TEXT_INPUT_TYPES = ["number", "scripture"];

function normalizeInputType(inputType: string): string {
  return LEGACY_TEXT_INPUT_TYPES.includes(inputType) ? "text" : inputType;
}

function sanitizeWorshipItems(items: TemplateItem[]): TemplateItem[] {
  return items.map((item) => {
    const sanitized: TemplateItem = { type: item.type, label: item.label };
    if (item.fields && item.fields.length > 0) {
      sanitized.fields = item.fields.map((f) => ({
        key: f.key,
        label: f.label,
        inputType: normalizeInputType(f.inputType),
      }));
    } else if (item.inputType) {
      sanitized.inputType = normalizeInputType(item.inputType);
    }
    return sanitized;
  });
}

function normalizeTemplate(sections: SectionTemplate[]): SectionTemplate[] {
  return sections.map((s) =>
    s.type === "worship-program"
      ? { ...s, config: { items: sanitizeWorshipItems(s.config.items) } }
      : s,
  );
}

function sanitizeTemplate(sections: SectionTemplate[]): SectionTemplate[] {
  return sections.map((s) => {
    const base = {
      id: s.id,
      type: s.type,
      label: s.label,
      visible: s.visible ?? true,
    };
    if (s.type === "worship-program") {
      return {
        ...base,
        type: "worship-program" as const,
        config: { items: sanitizeWorshipItems(s.config.items) },
      };
    }
    if (s.type === "announcements") {
      return {
        ...base,
        type: "announcements" as const,
        config: { subHeadings: s.config.subHeadings ?? [] },
      };
    }
    if (s.type === "weekly-verse") {
      return { ...base, type: "weekly-verse" as const, config: {} };
    }
    if (s.type === "monthly-song") {
      return { ...base, type: "monthly-song" as const, config: {} };
    }
    if (s.type === "text-block") {
      return { ...base, type: "text-block" as const, config: {} };
    }
    if (s.type === "weekly-prayer") {
      return {
        ...base,
        type: "weekly-prayer" as const,
        config: {
          days: (s.config.days ?? []).map((d) => ({
            key: d.key,
            label: d.label,
            defaults: Array.isArray(d.defaults) ? d.defaults : [],
          })),
        },
      };
    }
    if (s.type === "upcoming-events") {
      return { ...base, type: "upcoming-events" as const, config: {} };
    }
    if (s.type === "birthdays") {
      return { ...base, type: "birthdays" as const, config: {} };
    }
    if (s.type === "scripture-quotes") {
      return { ...base, type: "scripture-quotes" as const, config: {} };
    }
    if (s.type === "attendance") {
      return {
        ...base,
        type: "attendance" as const,
        config: {
          meetings: s.config.meetings.map((m) => ({
            key: m.key,
            label: m.label,
          })),
        },
      };
    }
    if (s.type === "service-meta") {
      return {
        ...base,
        type: "service-meta" as const,
        config: {
          fieldDefs: s.config.fieldDefs.map((f) => ({
            key: f.key,
            label: f.label,
            inputType: f.inputType,
          })),
        },
      };
    }
    if (s.type === "financial-summary") {
      return {
        ...base,
        type: "financial-summary" as const,
        config: {
          items: s.config.items.map((item) => ({
            key: item.key,
            label: item.label,
            ...(item.unit !== undefined ? { unit: item.unit } : {}),
          })),
        },
      };
    }
    return {
      ...base,
      type: "assignments" as const,
      config: { roles: s.config.roles },
    };
  });
}

// Migrate old TemplateItem[] (worship_template) into SectionTemplate[] format
function migrateOldTemplate(oldValue: string): SectionTemplate[] {
  try {
    const items = JSON.parse(oldValue) as TemplateItem[];
    if (!Array.isArray(items)) return DEFAULT_TEMPLATE;
    return [
      {
        id: "worship",
        type: "worship-program",
        label: "礼拝プログラム",
        visible: true,
        config: { items },
      },
    ];
  } catch {
    return DEFAULT_TEMPLATE;
  }
}

export const bulletinTemplateRoute = new Hono<AppEnv>();

// GET — any authenticated user can read the template
bulletinTemplateRoute.get("/", authMiddleware, async (c) => {
  const db = c.get("db");
  const row = await db.query.settings.findFirst({
    where: eq(settings.key, "bulletin_template"),
  });
  if (row) {
    return c.json(normalizeTemplate(JSON.parse(row.value)));
  }

  // Migrate legacy worship_template key if bulletin_template is missing
  const legacyRow = await db.query.settings.findFirst({
    where: eq(settings.key, "worship_template"),
  });
  if (legacyRow) {
    const migrated = normalizeTemplate(migrateOldTemplate(legacyRow.value));
    await db
      .insert(settings)
      .values({
        key: "bulletin_template",
        value: JSON.stringify(migrated),
        updatedAt: sql`(datetime('now'))`,
      })
      .onConflictDoUpdate({
        target: settings.key,
        set: {
          value: JSON.stringify(migrated),
          updatedAt: sql`(datetime('now'))`,
        },
      });
    await db.delete(settings).where(eq(settings.key, "worship_template"));
    return c.json(migrated);
  }

  return c.json(DEFAULT_TEMPLATE);
});

// PUT — admin only
bulletinTemplateRoute.put("/", authMiddleware, adminMiddleware, async (c) => {
  const db = c.get("db");
  const body = await c.req.json();

  if (!isValidTemplate(body)) {
    return c.json(
      {
        error:
          "Template must be a non-empty array of valid sections with unique ids",
      },
      400,
    );
  }

  const sections = sanitizeTemplate(body);

  await db
    .insert(settings)
    .values({
      key: "bulletin_template",
      value: JSON.stringify(sections),
      updatedAt: sql`(datetime('now'))`,
    })
    .onConflictDoUpdate({
      target: settings.key,
      set: {
        value: JSON.stringify(sections),
        updatedAt: sql`(datetime('now'))`,
      },
    });

  return c.json({ ok: true });
});

// DELETE — admin only; removes the stored template and returns the default,
// so the client can reset in a single round trip
bulletinTemplateRoute.delete(
  "/",
  authMiddleware,
  adminMiddleware,
  async (c) => {
    const db = c.get("db");
    await db.delete(settings).where(eq(settings.key, "bulletin_template"));
    return c.json(DEFAULT_TEMPLATE);
  },
);
