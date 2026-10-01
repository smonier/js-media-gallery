import { useState } from "react";
import { useTranslation } from "react-i18next";
import { textValues } from "../../utils/i18n.js";
import VideoDialog from "../../utils/VideoDialog.js";
import { PlayIcon } from "../../utils/icons.js";
import useThumbnail from "../../utils/useThumbnail.js";
import { fallbackHref, type VideoData } from "../../utils/video.js";
import ui from "../../utils/ui.module.css";
import classes from "./VideoGallery.module.css";

interface VideoModalProps {
  videos: VideoData[];
  /** Level of the card titles. */
  headingLevel: number;
}

interface VideoCardProps {
  video: VideoData;
  headingLevel: number;
  onOpen: () => void;
}

function VideoCard({ video, headingLevel, onOpen }: VideoCardProps) {
  const { t } = useTranslation("js-media-gallery");
  const thumbnail = useThumbnail(video);
  const href = fallbackHref(video);
  const title = video.title || t("mediaGallery.video.untitled");
  const Heading = `h${Math.min(6, Math.max(2, headingLevel))}` as "h3";
  const label =
    video.videoService === "storylane"
      ? t("mediaGallery.video.openDemo", textValues({ title }))
      : t("mediaGallery.video.play", textValues({ title }));
  return (
    <li className={classes.gridVideoCard}>
      <a
        href={href}
        className={`${ui.control} ${classes.thumbLink}`}
        onClick={(event) => {
          event.preventDefault();
          onOpen();
        }}
      >
        <span className={classes.thumbFrame}>
          {thumbnail && (
            <img src={thumbnail} alt="" className={classes.thumbImage} loading="lazy" />
          )}
          <span className={classes.playBadge} aria-hidden="true">
            <PlayIcon />
          </span>
        </span>
        <span className={ui.visuallyHidden}>{label}</span>
      </a>
      <div className={classes.cardBody}>
        <Heading className={classes.cardTitle}>{title}</Heading>
        {video.description && <p className={classes.cardText}>{video.description}</p>}
      </div>
    </li>
  );
}

/** Grid of video cards; a card opens its video in a modal player. */
export default function VideoModal({ videos, headingLevel }: VideoModalProps) {
  const [selected, setSelected] = useState<VideoData | undefined>(undefined);
  return (
    <>
      <ul className={classes.videoGrid}>
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            headingLevel={headingLevel}
            onOpen={() => setSelected(video)}
          />
        ))}
      </ul>
      <VideoDialog video={selected} onClose={() => setSelected(undefined)} />
    </>
  );
}
