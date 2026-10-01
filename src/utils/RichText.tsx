import { sanitizeHtml } from "./sanitize.js";

interface RichTextProps {
  html?: string;
  className?: string;
  /** Level of the first heading inside the text (one below the component's heading). */
  headingLevel?: number;
}

/**
 * Rich text written by editors. This is the module's only raw-HTML sink: the value always goes
 * through the allow-list filter of sanitize.ts first.
 */
export default function RichText({ html, className, headingLevel }: RichTextProps) {
  const clean = sanitizeHtml(html, { headingLevel });
  if (!clean.trim()) return null;
  return <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
}
