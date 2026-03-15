import type {
	BulletinDetail,
	BulletinListResponse,
	Member,
	TemplateItem,
} from "@/types/bulletin.ts";

export async function fetchBulletins(): Promise<BulletinListResponse> {
	const res = await fetch("/api/bulletin");
	if (!res.ok) throw new Error("Failed to fetch bulletins");
	return res.json() as Promise<BulletinListResponse>;
}

export async function fetchBulletin(id: string): Promise<BulletinDetail> {
	const res = await fetch(`/api/bulletin/${id}`);
	if (!res.ok) throw new Error("Failed to fetch bulletin");
	return res.json() as Promise<BulletinDetail>;
}

export async function fetchTemplate(): Promise<TemplateItem[]> {
	const res = await fetch("/api/bulletin-template");
	if (!res.ok) return [];
	return res.json() as Promise<TemplateItem[]>;
}

export async function fetchMembers(): Promise<Member[]> {
	const res = await fetch("/api/members");
	if (!res.ok) return [];
	return res.json() as Promise<Member[]>;
}
