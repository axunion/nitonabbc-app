import type {
  AnySection,
  AttendanceSectionData,
  AttendanceSectionTemplate,
  FinancialSummarySectionData,
  FinancialSummarySectionTemplate,
  Member,
  MonthlySongSectionData,
  ScriptureQuotesSectionData,
  SectionTemplate,
  ServiceMetaSectionData,
  ServiceMetaSectionTemplate,
  TemplateItem,
  TextBlockSectionData,
  WeeklyPrayerSectionData,
  WeeklyVerseSectionData,
  WorshipProgramSectionData,
} from "@/types/bulletin.ts";
import { SERVICE_ROLES } from "@/types/bulletin.ts";

export function progressPercent(filled: number, total: number): number {
  if (total === 0) return 100;
  return Math.round((filled / total) * 100);
}

export function getTemplateItem(
  template: TemplateItem[] | undefined,
  type: string,
): TemplateItem | undefined {
  return template?.find((t) => t.type === type);
}

export function getMemberName(
  members: Member[] | undefined,
  id: number | null | undefined,
): string | null {
  if (id == null) return null;
  const m = members?.find((m) => m.id === id);
  return m?.name ?? null;
}

export function findSectionTemplate(
  template: SectionTemplate[],
  sectionId: string,
): SectionTemplate | undefined {
  return template.find((s) => s.id === sectionId);
}

export function filterMembersByRole(
  members: Member[] | undefined,
  role: string | undefined,
): Member[] {
  const all = members ?? [];
  if (!role || !(SERVICE_ROLES as readonly string[]).includes(role)) return all;
  return all.filter((m) => m.serviceRoles.includes(role));
}

export function getWorshipProgramSections(
  sections: AnySection[],
): WorshipProgramSectionData[] {
  return sections.filter(
    (s): s is WorshipProgramSectionData => s.type === "worship-program",
  );
}

// Returns true when a section's View component would render visible content.
// Mirrors each SectionView's <Show> condition — keep in sync when adding section types.
export function hasSectionViewContent(
  section: AnySection,
  template: SectionTemplate[],
): boolean {
  if (section.type === "worship-program") {
    return (section as WorshipProgramSectionData).data.length > 0;
  }
  if (section.type === "announcements") {
    return (section.data as unknown[]).length > 0;
  }
  if (section.type === "assignments") {
    return Object.values(section.data as Record<string, string>).some((v) => v);
  }
  if (section.type === "weekly-verse") {
    const wv = section as WeeklyVerseSectionData;
    return !!(wv.data.text || wv.data.reference);
  }
  if (section.type === "monthly-song") {
    return !!(section as MonthlySongSectionData).data.title;
  }
  if (section.type === "text-block") {
    const tb = section as TextBlockSectionData;
    return !!(tb.data.heading || tb.data.body);
  }
  if (section.type === "weekly-prayer") {
    const wp = section as WeeklyPrayerSectionData;
    return Object.values(wp.data).some((v) =>
      Array.isArray(v) ? v.some((t) => t.trim()) : !!(v as string),
    );
  }
  if (section.type === "upcoming-events") {
    return (section.data as unknown[]).length > 0;
  }
  if (section.type === "birthdays") {
    return (section.data as unknown[]).length > 0;
  }
  if (section.type === "scripture-quotes") {
    return (section as ScriptureQuotesSectionData).data.length > 0;
  }
  if (section.type === "attendance") {
    const att = section as AttendanceSectionData;
    const tmpl = findSectionTemplate(template, section.id);
    if (tmpl?.type !== "attendance") return false;
    return (tmpl as AttendanceSectionTemplate).config.meetings.some((m) =>
      att.data[m.key]?.adults.trim(),
    );
  }
  if (section.type === "service-meta") {
    const sm = section as ServiceMetaSectionData;
    const tmpl = findSectionTemplate(template, section.id);
    if (tmpl?.type !== "service-meta") return false;
    return (tmpl as ServiceMetaSectionTemplate).config.fieldDefs.some((def) =>
      sm.data.fieldValues[def.key]?.trim(),
    );
  }
  if (section.type === "financial-summary") {
    const fs = section as FinancialSummarySectionData;
    const tmpl = findSectionTemplate(template, section.id);
    if (tmpl?.type !== "financial-summary") return false;
    return (tmpl as FinancialSummarySectionTemplate).config.items.some((item) =>
      fs.data[item.key]?.amount.trim(),
    );
  }
  return false;
}
