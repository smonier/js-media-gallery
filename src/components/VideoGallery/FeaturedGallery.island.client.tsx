import { useState } from "react";
import { useTranslation } from "react-i18next";
import VideoFrame from "../../utils/VideoFrame.js";
import { PlayIcon } from "../../utils/icons.js";
import useThumbnail from "../../utils/useThumbnail.js";
import type { VideoData } from "../../utils/video.js";
import ui from "../../utils/ui.module.css";
import classes from "./VideoGallery.module.css";

interface FeaturedGalleryProps {
  videos: VideoData[];
  /** Level of the title of the video shown. */
  headingLevel: number;
}

interface ThumbnailProps {
  video: VideoData;
  active: boolean;
  onSelect: () => void;
}

function Thumbnail({ video, active, onSelect }: ThumbnailProps) {
  const { t } = useTranslation("js-media-gallery");
  const thumbnail = useThumbnail(video);
  return (
    <li className={classes.stripItem}>
      <button
        type="button"
        className={`${ui.control} ${classes.stripButton}`}
        onClick={onSelect}
        aria-pressed={active}
      >
        <span className={classes.thumbFrame}>
          {thumbnail && (
            <img src={thumbnail} alt="" className={classes.thumbImage} loading="lazy" />
          )}
          <span className={classes.playBadge} aria-hidden="true">
            <PlayIcon />
          </span>
        </span>
        <span className={classes.stripTitle}>
          {video.title || t("mediaGallery.video.untitled")}
        </span>
      </button>
    </li>
  );
}

/** A featured player with the title and text of its video, and a strip of the other videos. */
export default function FeaturedGallery({ videos, headingLevel }: FeaturedGalleryProps) {
  const { t } = useTranslation("js-media-gallery");
  const [activeIndex, setActiveIndex] = useState(0);
  const [chosen, setChosen] = useState(false);
  const active = videos[activeIndex] ?? videos[0];
  if (!active) return null;
  const Heading = `h${Math.min(6, Math.max(2, headingLevel))}` as "h3";
  const title = active.title || t("mediaGallery.video.untitled");

  return (
    <div className={classes.featuredLayout}>
      <div className={classes.featuredMain}>
        <div className={ui.playerFrame}>
          <VideoFrame key={active.id} video={active} className={ui.player} />
        </div>
      </div>
      <div className={classes.featuredDescription}>
        <Heading className={classes.cardTitle}>{title}</Heading>
        {active.description && <p className={classes.cardText}>{active.description}</p>}
        <p className={ui.visuallyHidden} aria-live="polite">
          {chosen ? t("mediaGallery.video.nowPlaying", { title }) : ""}
        </p>
      </div>
      {videos.length > 1 && (
        <ul className={classes.strip}>
          {videos.map((video, index) => (
            <Thumbnail
              key={video.id}
              video={video}
              active={index === activeIndex}
              onSelect={() => {
                setActiveIndex(index);
                setChosen(true);
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
