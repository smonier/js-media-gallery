import { describe, expect, it } from "vitest";

// Every visitor-facing locale file must carry the keys of en.json, in the same order, and keep
// the interpolation placeholders ({{name}} or {name}) of the English text.
type Tree = { [key: string]: string | Tree };

// Vite inlines the files at test time: no Node typings needed.
const files = (
  import.meta as unknown as {
    glob: (pattern: string, options: { eager: true; import: "default" }) => Record<string, Tree>;
  }
).glob("../settings/locales/*.json", { eager: true, import: "default" });

const locales = new Map<string, Tree>(
  Object.entries(files).map(([path, tree]) => [path.slice(path.lastIndexOf("/") + 1), tree]),
);

const read = (file: string): Tree => locales.get(file) ?? {};

const flatten = (tree: Tree, prefix = ""): Array<[string, string]> =>
  Object.entries(tree).flatMap(([key, value]) =>
    typeof value === "string"
      ? [[`${prefix}${key}`, value] as [string, string]]
      : flatten(value, `${prefix}${key}.`),
  );

const placeholders = (text: string): string[] =>
  (text.match(/\{\{?\w+\}?\}/g) ?? []).sort((a, b) => a.localeCompare(b));

// A language may need other plural forms than English (_many in French), so the plural suffix
// is ignored when comparing the key lists; pt.json is also checked against the exact key list.
const withoutPlural = (keys: string[]): string[] => [
  ...new Set(keys.map((key) => key.replace(/_(zero|one|two|few|many|other)$/, ""))),
];

const english = flatten(read("en.json"));
const others = [...locales.keys()]
  .filter((file) => file !== "en.json")
  .sort((a, b) => a.localeCompare(b));

describe("locale files", () => {
  it("include European Portuguese", () => {
    expect(others).toContain("pt.json");
  });

  it("pt.json has exactly the keys of en.json, plural forms included", () => {
    expect(flatten(read("pt.json")).map(([key]) => key)).toEqual(english.map(([key]) => key));
  });

  for (const file of others) {
    describe(file, () => {
      const translated = flatten(read(file));

      it("has the keys of en.json, in the same order", () => {
        expect(withoutPlural(translated.map(([key]) => key))).toEqual(
          withoutPlural(english.map(([key]) => key)),
        );
      });

      it("keeps the placeholders of en.json", () => {
        const byKey = new Map(translated);
        for (const [key, text] of english) {
          expect(placeholders(byKey.get(key) ?? ""), key).toEqual(placeholders(text));
        }
      });

      it("has no empty value", () => {
        for (const [key, text] of translated) expect(text.trim(), key).not.toBe("");
      });
    });
  }
});
