import { useTranslation } from "react-i18next";
import RichText from "./RichText.js";
import { sanitizeHtml } from "./sanitize.js";
import ui from "./ui.module.css";

interface TranscriptProps {
  html?: unknown;
  /** Title of the video, added to the summary when several transcripts follow each other. */
  videoTitle?: string;
  headingLevel?: number;
}

/** Transcript of a video in a collapsible section (RGAA 4.1). Server views only. */
export default function Transcript({ html, videoTitle, headingLevel = 4 }: TranscriptProps) {
  const { t } = useTranslation("js-media-gallery");
  if (typeof html !== "string" || !sanitizeHtml(html).trim()) return null;
  return (
    <details className={ui.transcript}>
      <summary className={ui.control}>
        {t("mediaGallery.video.transcript")}
        {videoTitle ? `: ${videoTitle}` : ""}
      </summary>
      <RichText html={html} className={ui.transcriptBody} headingLevel={headingLevel} />
    </details>
  );
}
