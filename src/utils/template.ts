import type { InputType } from "@/types/bulletin.ts";

export const INPUT_TYPES: InputType[] = ["text", "member", "none"];

/** Internal key for a new template row. Admins never see or edit keys, since bulletin data is matched on them. */
export function newTemplateKey(): string {
  return `k${crypto.randomUUID().slice(0, 8)}`;
}
