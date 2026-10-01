import { useServerContext } from "@jahia/javascript-modules-library";
import { useTranslation } from "react-i18next";
import { sanitizeRichTextWithReport } from "./sanitize.js";
import ui from "./ui.module.css";

interface RichTextProps {
  html?: unknown;
  className?: string;
  /** Level of the first heading inside the text (one below the component's heading). */
  headingLevel?: number;
  /** Identifier of the node the text belongs to, when it is not the node being rendered. */
  owner?: string;
}

/**
 * Rich text written by editors in the Jahia rich-text editor. Every component renders rich text
 * through this one component, and the value always goes through the allow-list filter of
 * sanitize.ts first. Server views only.
 *
 * Ids the editor wrote are prefixed with the owner node's identifier, so two blocks on a page
 * never share one. In edit mode, an image without a text alternative is flagged.
 */
export default function RichText({ html, className, headingLevel, owner }: RichTextProps) {
  const { t } = useTranslation("js-media-gallery");
  const { renderContext, currentNode } = useServerContext();
  const id = (owner ?? currentNode.getIdentifier()).replace(/[^a-z0-9]/gi, "").slice(0, 8);
  const { html: clean, imageWithoutAlt } = sanitizeRichTextWithReport(html, {
    headingLevel,
    idPrefix: `jsmg-rt-${id}-`,
  });
  if (!clean.trim()) return null;
  return (
    <>
      <div
        className={className}
        // eslint-disable-next-line @eslint-react/dom/no-dangerously-set-innerhtml -- filtered just above (sanitize.ts)
        dangerouslySetInnerHTML={{ __html: clean }}
      />
      {renderContext.isEditMode() && imageWithoutAlt && (
        <p className={ui.editHint}>{t("mediaGallery.richText.imageWithoutAlt")}</p>
      )}
    </>
  );
}
