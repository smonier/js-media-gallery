import { useTranslation } from "react-i18next";
import { headingTag } from "../../utils/jcr.js";
import Transcript from "../../utils/Transcript.js";
import type { GalleryVideos } from "./collect.js";
import classes from "./VideoGallery.module.css";

/**
 * Transcripts of the videos of a grid or featured gallery, after it, under a heading of their
 * own at the level of the video titles (so they never sit under the last video's title).
 */
export default function Transcripts({
  transcripts,
  level,
}: {
  transcripts: GalleryVideos["transcripts"];
  /** Level of the video titles of the gallery. */
  level: number;
}) {
  const { t } = useTranslation("js-media-gallery");
  if (transcripts.length === 0) return null;
  const Heading = headingTag(level);
  return (
    <div className={classes.transcripts}>
      <Heading className={classes.transcriptsTitle}>{t("mediaGallery.video.transcripts")}</Heading>
      {transcripts.map((item) => (
        <Transcript
          key={item.id}
          html={item.html}
          videoTitle={item.title}
          headingLevel={level + 1}
          owner={item.id}
        />
      ))}
    </div>
  );
}
