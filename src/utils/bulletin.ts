import type {
	AnySection,
	Member,
	SectionTemplate,
	TemplateItem,
	WorshipProgramSectionData,
} from "@/types/bulletin.ts";

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

export function getWorshipProgramSections(
	sections: AnySection[],
): WorshipProgramSectionData[] {
	return sections.filter(
		(s): s is WorshipProgramSectionData => s.type === "worship-program",
	);
}

export function hasMyUnfilledWorshipItems(
	sections: AnySection[],
	template: SectionTemplate[],
	userId: number,
): boolean {
	for (const section of getWorshipProgramSections(sections)) {
		const tmpl = findSectionTemplate(template, section.id);
		const items = tmpl?.type === "worship-program" ? tmpl.config.items : [];
		for (const item of section.data) {
			if (item.assigneeId !== userId) continue;
			const tmplItem = items.find((t) => t.type === item.type);
			if (tmplItem?.fields && tmplItem.fields.length > 0) {
				const hasUnfilled = tmplItem.fields.some(
					(f) => f.inputType !== "none" && !item.fieldValues?.[f.key]?.trim(),
				);
				if (hasUnfilled) return true;
			} else if (tmplItem?.inputType !== "none") {
				if (!item.details?.trim()) return true;
			}
		}
	}
	return false;
}
