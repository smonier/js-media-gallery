import { useTranslation } from "react-i18next";
import RichText from "./RichText.js";
import { sanitizeRichText } from "./sanitize.js";
import ui from "./ui.module.css";

interface TranscriptProps {
  html?: unknown;
  /** Title of the video, added to the summary when several transcripts follow each other. */
  videoTitle?: string;
  headingLevel?: number;
  /** Identifier of the video node, when it is not the node being rendered. */
  owner?: string;
}

/** Transcript of a video in a collapsible section (RGAA 4.1). Server views only. */
export default function Transcript({ html, videoTitle, headingLevel = 4, owner }: TranscriptProps) {
  const { t } = useTranslation("js-media-gallery");
  if (typeof html !== "string" || !sanitizeRichText(html).trim()) return null;
  return (
    <details className={ui.transcript}>
      <summary className={ui.control}>
        {t("mediaGallery.video.transcript")}
        {videoTitle ? `: ${videoTitle}` : ""}
      </summary>
      <RichText
        html={html}
        className={ui.transcriptBody}
        headingLevel={headingLevel}
        owner={owner}
      />
    </details>
  );
}
