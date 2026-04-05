import type { Member, TemplateItem } from "@/types/bulletin.ts";

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
