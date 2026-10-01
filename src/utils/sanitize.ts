/**
 * Allow-list filter for rich text written by editors (banner text, video captions).
 *
 * The module never relies on platform-side HTML filtering, which is a site setting. The filter is
 * plain TypeScript with no DOM, so it runs in the server renderer. It reads the input once, left to
 * right, and writes a new document: only the elements and attributes below are written back, and
 * every text and attribute value is escaped again. Input that is not understood becomes text.
 *
 * Kept: paragraphs, line breaks, emphasis, lists (definition lists too), quotes, code, headings,
 * links, images, simple tables, and the `lang` / `dir` of any element (RGAA 8.7).
 * Dropped with their content: script, style, frames, forms, embedded objects, SVG and MathML.
 * Dropped, content kept: any other element. Link targets and titles are dropped (RGAA 13.2 and
 * 6.1). Link and image addresses keep only http(s), mailto, tel, relative paths, anchors and the
 * Jahia link placeholders that the render chain rewrites.
 *
 * Headings are renumbered from `headingLevel` down, without gaps, so that the block's headings
 * sit under the heading of the component that shows it (RGAA 9.1).
 */

const TEXT_ATTRS = ["lang", "dir"];
const ALLOWED: Record<string, string[]> = {
  p: [],
  br: [],
  hr: [],
  div: [],
  span: [],
  strong: [],
  b: [],
  em: [],
  i: [],
  u: [],
  s: [],
  sub: [],
  sup: [],
  small: [],
  mark: [],
  h1: [],
  h2: [],
  h3: [],
  h4: [],
  h5: [],
  h6: [],
  ul: [],
  ol: ["start", "reversed"],
  li: [],
  dl: [],
  dt: [],
  dd: [],
  blockquote: ["cite"],
  q: ["cite"],
  cite: [],
  abbr: ["title"],
  code: [],
  pre: [],
  kbd: [],
  a: ["href", "hreflang"],
  img: ["src", "alt", "width", "height"],
  figure: [],
  figcaption: [],
  table: [],
  caption: [],
  thead: [],
  tbody: [],
  tfoot: [],
  tr: [],
  th: ["scope", "colspan", "rowspan"],
  td: ["colspan", "rowspan"],
};
const VOID = new Set(["br", "hr", "img"]);
/** Elements dropped together with everything up to their closing tag. */
const DROP_WITH_CONTENT = new Set([
  "script",
  "style",
  "template",
  "iframe",
  "frame",
  "frameset",
  "object",
  "embed",
  "applet",
  "noscript",
  "noembed",
  "noframes",
  "xmp",
  "textarea",
  "title",
  "select",
  "svg",
  "math",
  "head",
]);

const LANG = /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{1,8}){0,4}$/;
const NUMBER = /^\d{1,4}$/;
const SCHEME = /^([A-Za-z][A-Za-z0-9+.-]{0,20}):/;
const SAFE_SCHEMES = new Set(["http", "https", "mailto", "tel"]);

type Token =
  | { kind: "text"; value: string }
  | { kind: "open"; name: string; attrs: [string, string][] }
  | { kind: "close"; name: string };

const escapeText = (value: string) => value.replace(/</g, "&lt;").replace(/>/g, "&gt;");

const escapeAttr = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const NAMED: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

/** Decodes character references, so that a value is checked as the browser will read it. */
const decodeEntities = (value: string) =>
  value.replace(/&(#x[0-9a-fA-F]{1,6}|#\d{1,7}|[a-zA-Z]{2,8});?/g, (match, ref: string) => {
    if (ref[0] === "#") {
      const code =
        ref[1] === "x" || ref[1] === "X" ? parseInt(ref.slice(2), 16) : parseInt(ref.slice(1), 10);
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : "";
    }
    return NAMED[ref.toLowerCase()] ?? match;
  });

/** Returns the address when it is safe to keep, else undefined. */
const safeUrl = (raw: string): string | undefined => {
  // Browsers ignore control characters and spaces in a scheme ("java\tscript:"): remove them first.
  // eslint-disable-next-line no-control-regex
  const value = decodeEntities(raw).replace(/[\u0000- \u007f-\u009f]/g, "");
  if (!value) return undefined;
  if (value.startsWith("##cms-context##") || value.startsWith("##doc-context##")) return value;
  if (value.startsWith("//")) return undefined;
  const scheme = SCHEME.exec(value);
  if (scheme) return SAFE_SCHEMES.has(scheme[1].toLowerCase()) ? value : undefined;
  // A relative address: nothing before its first "/", "?" or "#" may read as a scheme.
  const head = value.split(/[/?#]/, 1)[0];
  return head.includes(":") || head.includes("&") ? undefined : value;
};

const isNameStart = (ch: string) => (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z");
const isSpace = (ch: string) =>
  ch === " " || ch === "\n" || ch === "\t" || ch === "\r" || ch === "\f";

/** Splits the input into text, start tags and end tags. One pass, no backtracking. */
const tokenize = (html: string): Token[] => {
  const tokens: Token[] = [];
  const length = html.length;
  /** Position of the end tag `</name` from `from` on, any letter case; -1 when there is none. */
  const findEndTag = (name: string, from: number) => {
    for (let at = html.indexOf("</", from); at !== -1; at = html.indexOf("</", at + 2)) {
      if (html.slice(at + 2, at + 2 + name.length).toLowerCase() === name) return at;
    }
    return -1;
  };
  let i = 0;
  while (i < length) {
    const lt = html.indexOf("<", i);
    if (lt === -1) {
      tokens.push({ kind: "text", value: html.slice(i) });
      break;
    }
    if (lt > i) tokens.push({ kind: "text", value: html.slice(i, lt) });
    i = lt;
    if (html.startsWith("<!--", i)) {
      const end = html.indexOf("-->", i + 4);
      i = end === -1 ? length : end + 3;
      continue;
    }
    const next = html[i + 1] ?? "";
    if (next === "!" || next === "?") {
      const end = html.indexOf(">", i);
      i = end === -1 ? length : end + 1;
      continue;
    }
    const closing = next === "/";
    let j = closing ? i + 2 : i + 1;
    if (!isNameStart(html[j] ?? "")) {
      tokens.push({ kind: "text", value: "<" });
      i += 1;
      continue;
    }
    const nameStart = j;
    while (j < length && /[A-Za-z0-9-]/.test(html[j])) j++;
    const name = html.slice(nameStart, j).toLowerCase();
    // Attributes, up to the end of the tag.
    const attrs: [string, string][] = [];
    while (j < length && html[j] !== ">") {
      if (isSpace(html[j]) || html[j] === "/") {
        j++;
        continue;
      }
      const attrStart = j;
      while (
        j < length &&
        !isSpace(html[j]) &&
        html[j] !== "=" &&
        html[j] !== ">" &&
        html[j] !== "/"
      )
        j++;
      const attrName = html.slice(attrStart, j).toLowerCase();
      if (attrStart === j) {
        j++;
        continue;
      }
      while (j < length && isSpace(html[j])) j++;
      let value = "";
      if (html[j] === "=") {
        j++;
        while (j < length && isSpace(html[j])) j++;
        const quote = html[j];
        if (quote === '"' || quote === "'") {
          const end = html.indexOf(quote, j + 1);
          const stop = end === -1 ? length : end;
          value = html.slice(j + 1, stop);
          j = stop + 1;
        } else {
          const valueStart = j;
          while (j < length && !isSpace(html[j]) && html[j] !== ">") j++;
          value = html.slice(valueStart, j);
        }
      }
      attrs.push([attrName, value]);
    }
    i = j + 1;
    if (closing) {
      tokens.push({ kind: "close", name });
      continue;
    }
    if (DROP_WITH_CONTENT.has(name)) {
      const end = findEndTag(name, i);
      if (end === -1) break;
      const close = html.indexOf(">", end);
      i = close === -1 ? length : close + 1;
      continue;
    }
    tokens.push({ kind: "open", name, attrs });
  }
  return tokens;
};

const cleanAttrs = (name: string, attrs: [string, string][]): string => {
  const allowed = [...(ALLOWED[name] ?? []), ...TEXT_ATTRS];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const [attr, raw] of attrs) {
    if (!allowed.includes(attr) || seen.has(attr)) continue;
    let value: string | undefined = decodeEntities(raw).trim();
    switch (attr) {
      case "href":
      case "src":
      case "cite":
        value = safeUrl(raw);
        break;
      case "lang":
      case "hreflang":
        value = LANG.test(value) ? value : undefined;
        break;
      case "dir":
        value = ["ltr", "rtl", "auto"].includes(value.toLowerCase())
          ? value.toLowerCase()
          : undefined;
        break;
      case "start":
      case "colspan":
      case "rowspan":
      case "width":
      case "height":
        value = NUMBER.test(value) ? value : undefined;
        break;
      case "reversed":
        value = "";
        break;
      case "scope":
        value = ["row", "col", "rowgroup", "colgroup"].includes(value) ? value : undefined;
        break;
    }
    if (value === undefined) continue;
    seen.add(attr);
    out.push(value === "" && attr === "reversed" ? " reversed" : ` ${attr}="${escapeAttr(value)}"`);
  }
  // An image needs a text alternative: a missing one becomes empty (decorative).
  if (name === "img" && !seen.has("alt")) out.push(' alt=""');
  return out.join("");
};

/** Maps the heading levels used in the block to consecutive levels from `base`. */
const headingMap = (tokens: Token[], base: number): Map<string, string> => {
  const used = [
    ...new Set(
      tokens
        .filter(
          (t): t is Extract<Token, { kind: "open" }> =>
            t.kind === "open" && /^h[1-6]$/.test(t.name),
        )
        .map((t) => t.name),
    ),
  ].sort();
  return new Map(used.map((tag, index) => [tag, `h${Math.min(6, base + index)}`]));
};

export interface SanitizeOptions {
  /** Level of the first heading of the block (2 to 6). Defaults to 3. */
  headingLevel?: number;
}

/** Returns HTML that keeps only the allowed markup of `html`. */
export function sanitizeHtml(html: unknown, options: SanitizeOptions = {}): string {
  if (typeof html !== "string" || !html) return "";
  const tokens = tokenize(html);
  const base = Math.min(6, Math.max(2, Math.trunc(options.headingLevel ?? 3)));
  const headings = headingMap(tokens, base);
  const stack: string[] = [];
  let out = "";
  for (const token of tokens) {
    if (token.kind === "text") {
      out += escapeText(token.value);
      continue;
    }
    const name = headings.get(token.name) ?? token.name;
    if (!(token.name in ALLOWED)) continue;
    if (token.kind === "open") {
      if (token.name === "a" && stack.includes("a")) continue;
      if (
        token.name === "img" &&
        !token.attrs.some(([attr, value]) => attr === "src" && safeUrl(value))
      )
        continue;
      out += `<${name}${cleanAttrs(token.name, token.attrs)}>`;
      if (!VOID.has(token.name)) stack.push(name);
      continue;
    }
    if (VOID.has(token.name)) continue;
    const index = stack.lastIndexOf(name);
    if (index === -1) continue;
    while (stack.length > index) out += `</${stack.pop()}>`;
  }
  while (stack.length) out += `</${stack.pop()}>`;
  return out;
}
