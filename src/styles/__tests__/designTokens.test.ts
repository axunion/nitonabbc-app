import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { lint } from "@google/design.md/linter";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

/*
 * Keeps the YAML front matter of DESIGN.md and the CSS custom properties in
 * tokens.css / admin-tokens.css identical, in both directions.
 *
 * Each YAML group maps to a CSS custom-property prefix: `colors.gray-50`
 * <-> `--color-gray-50`. A value that is exactly one token reference
 * (`"{colors.gray-900}"`) corresponds to `var(--color-gray-900)` in CSS.
 * The `desktop` group holds the overrides in `@media (min-width: 900px)`.
 */

const root = resolve(import.meta.dirname, "../../..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

const GROUP_PREFIX: Record<string, string> = {
  colors: "color-",
  "color-rgb": "color-",
  rounded: "radius-",
  spacing: "space-",
  text: "text-",
  leading: "leading-",
  font: "font-",
  tracking: "tracking-",
  shadow: "shadow-",
  glass: "glass-",
  input: "input-",
  mesh: "mesh-",
  focus: "focus-",
  duration: "duration-",
  ease: "ease-",
  z: "z-",
  layout: "",
  icon: "icon-",
  admin: "admin-",
};
const DESKTOP_GROUP = "desktop";
const DESKTOP_MEDIA = "(min-width: 900px)";
// Top-level keys that are DESIGN.md metadata or composite styles, not CSS variables
const NON_TOKEN_KEYS = new Set([
  "version",
  "name",
  "description",
  "omitted",
  "typography",
]);

const normalize = (value: string) =>
  value
    .replace(/\s+/g, " ")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\s+,/g, ",")
    .trim();

type VarMap = Map<string, string>;

function parseCss(css: string): { base: VarMap; media: Map<string, VarMap> } {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const declarations = (body: string): VarMap =>
    new Map(
      [...body.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)].map(([, n, v]) => [
        n,
        normalize(v),
      ]),
    );
  const media = new Map<string, VarMap>();
  const withoutMedia = source.replace(
    /@media\s*([^{]+)\{\s*:root\s*\{([^}]*)\}\s*\}/g,
    (_, condition: string, body: string) => {
      media.set(normalize(condition), declarations(body));
      return "";
    },
  );
  const base: VarMap = new Map();
  for (const [, body] of withoutMedia.matchAll(/:root\s*\{([^}]*)\}/g)) {
    for (const [n, v] of declarations(body)) base.set(n, v);
  }
  return { base, media };
}

function frontMatter(markdown: string): Record<string, unknown> {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) throw new Error("DESIGN.md has no YAML front matter");
  return parse(match[1]);
}

const varName = (group: string, key: string) =>
  `${group === DESKTOP_GROUP ? "" : GROUP_PREFIX[group]}${key}`;

function toCssValue(value: unknown): string {
  const text = normalize(String(value));
  const ref = text.match(/^\{([\w-]+)\.([\w-]+)\}$/);
  return ref ? `var(--${varName(ref[1], ref[2])})` : text;
}

function yamlVars(tokens: Record<string, unknown>, group: string): VarMap {
  const entries = Object.entries(
    (tokens[group] ?? {}) as Record<string, unknown>,
  );
  return new Map(entries.map(([k, v]) => [varName(group, k), toCssValue(v)]));
}

const designMd = read("DESIGN.md");
const tokens = frontMatter(designMd);
const memberCss = parseCss(read("src/styles/tokens.css"));
const adminCss = parseCss(read("src/styles/admin-tokens.css"));

describe("DESIGN.md", () => {
  it("passes the DESIGN.md linter without errors", () => {
    const errors = lint(designMd).findings.filter(
      (f) => f.severity === "error",
    );
    expect(errors).toEqual([]);
  });

  it("maps every top-level token group to a CSS prefix", () => {
    const unmapped = Object.keys(tokens).filter(
      (k) =>
        !NON_TOKEN_KEYS.has(k) && k !== DESKTOP_GROUP && !(k in GROUP_PREFIX),
    );
    expect(unmapped).toEqual([]);
  });

  it("matches the :root custom properties in tokens.css and admin-tokens.css", () => {
    const fromYaml: VarMap = new Map(
      Object.keys(GROUP_PREFIX).flatMap((g) => [...yamlVars(tokens, g)]),
    );
    const fromCss: VarMap = new Map([...memberCss.base, ...adminCss.base]);
    expect(Object.fromEntries(fromYaml)).toEqual(Object.fromEntries(fromCss));
  });

  it(`matches the ${DESKTOP_MEDIA} overrides in tokens.css`, () => {
    expect([...memberCss.media.keys(), ...adminCss.media.keys()]).toEqual([
      DESKTOP_MEDIA,
    ]);
    expect(Object.fromEntries(yamlVars(tokens, DESKTOP_GROUP))).toEqual(
      Object.fromEntries(memberCss.media.get(DESKTOP_MEDIA) ?? []),
    );
  });

  it("uses only defined font weights in typography styles", () => {
    const weights = new Set(
      Object.values(tokens.font as Record<string, unknown>).filter(
        (v) => typeof v === "number",
      ),
    );
    const styles = Object.entries(
      tokens.typography as Record<string, { fontWeight?: number }>,
    );
    const invalid = styles.filter(
      ([, s]) => s.fontWeight !== undefined && !weights.has(s.fontWeight),
    );
    expect(invalid.map(([name]) => name)).toEqual([]);
  });
});
