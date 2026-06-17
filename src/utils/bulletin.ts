import type {
  AnySection,
  Member,
  SectionTemplate,
  TemplateItem,
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
