import { createResource } from "solid-js";

export type AuthUser = {
  id: number;
  name: string;
  role: "admin" | "member";
  lineUserId: string;
};

async function fetchMe(): Promise<AuthUser | null> {
  const res = await fetch("/api/auth/me");
  if (res.status === 401) return null;
  if (!res.ok) throw new Error("Failed to fetch user");
  const contentType = res.headers.get("content-type");
  if (!contentType?.includes("application/json")) return null;
  return res.json() as Promise<AuthUser>;
}

export function createAuthStore() {
  const [user, { refetch }] = createResource<AuthUser | null>(fetchMe);
  return { user, refetch };
}
