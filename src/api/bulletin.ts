import type { ApiError, CreatedResource } from "@/types/api.ts";
import type {
	Announcement,
	BulletinDetail,
	BulletinListResponse,
	TemplateItem,
	WorshipItem,
} from "@/types/bulletin.ts";

export { fetchMembers } from "@/api/members.ts";

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

export async function saveTemplate(items: TemplateItem[]): Promise<ApiError> {
	const res = await fetch("/api/bulletin-template", {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(items),
	});
	if (!res.ok) return res.json() as Promise<ApiError>;
	return {};
}

type BulletinPayload = {
	serviceDate: string;
	worship: WorshipItem[];
	announcements: Announcement[];
	assignments: Record<string, string>;
};

export async function saveBulletin(
	id: string | undefined,
	body: BulletinPayload,
): Promise<{ ok: boolean; id?: number; error?: string }> {
	const url = id ? `/api/bulletin/${id}` : "/api/bulletin";
	const method = id ? "PUT" : "POST";
	const res = await fetch(url, {
		method,
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	if (!res.ok) {
		const data = (await res.json()) as ApiError;
		return { ok: false, error: data.error };
	}
	const result = (await res.json()) as CreatedResource;
	return { ok: true, id: result.id };
}
