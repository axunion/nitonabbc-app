import type { ja } from "./ja.ts";

export type Dictionary = typeof ja;

export type Locale = "ja" | "en";

export const LOCALES: Locale[] = ["ja", "en"];
