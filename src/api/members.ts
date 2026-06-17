import type { Member } from "@/types/bulletin.ts";

export type AdminMember = {
  id: number;
  name: string;
  role: "admin" | "member";
  serviceRoles: string[];
  lineUserId: string | null;
  inviteToken: string;
  inviteUsed: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function fetchMembers(): Promise<Member[]> {
  const res = await fetch("/api/members");
  if (!res.ok) return [];
  return res.json() as Promise<Member[]>;
}

export async function fetchAdminMembers(): Promise<AdminMember[]> {
  const res = await fetch("/api/admin/members");
  if (!res.ok) throw new Error("Failed to fetch members");
  return res.json() as Promise<AdminMember[]>;
}

export async function createMember(payload: {
  name: string;
  role: "admin" | "member";
  serviceRoles: string[];
}): Promise<void> {
  await fetch("/api/admin/members", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updateMember(
  id: number,
  payload: { name: string; role: "admin" | "member"; serviceRoles: string[] },
): Promise<void> {
  await fetch(`/api/admin/members/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function deactivateMember(id: number): Promise<void> {
  await fetch(`/api/admin/members/${id}`, { method: "DELETE" });
}

export async function reinviteMember(id: number): Promise<void> {
  await fetch(`/api/admin/members/${id}/reinvite`, { method: "POST" });
}
