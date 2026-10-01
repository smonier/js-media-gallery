import { useState } from "react";
import { useTranslation } from "react-i18next";
import { textValues } from "../../utils/i18n.js";
import VideoDialog from "../../utils/VideoDialog.js";
import VideoFrame from "../../utils/VideoFrame.js";
import { PlayIcon } from "../../utils/icons.js";
import useThumbnail from "../../utils/useThumbnail.js";
import { fallbackHref, type VideoData } from "../../utils/video.js";
import ui from "../../utils/ui.module.css";
import classes from "./ExternalVideo.module.css";

interface ExternalVideoPlayerProps {
  video: VideoData;
}

/**
 * An external video. Its thumbnail is a link to the video on the provider's site, so it works
 * without JavaScript; with JavaScript a click loads the player in place and starts it (a Storylane
 * demo opens in a modal dialog). Until then no third-party player is loaded.
 */
export default function ExternalVideoPlayer({ video }: ExternalVideoPlayerProps) {
  const { t } = useTranslation("js-media-gallery");
  const [playing, setPlaying] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [opener, setOpener] = useState<HTMLElement | null>(null);
  const thumbnail = useThumbnail(video);
  const isDemo = video.videoService === "storylane";
  const title = video.title || t("mediaGallery.video.untitled");

  if (playing && !isDemo) {
    return (
      <div className={ui.playerFrame}>
        <VideoFrame video={video} autoplay focusOnMount className={ui.player} />
      </div>
    );
  }

  return (
    <>
      <a
        href={fallbackHref(video)}
        className={`${ui.control} ${classes.preview}`}
        onClick={(event) => {
          event.preventDefault();
          if (isDemo) {
            setOpener(event.currentTarget);
            setDialogOpen(true);
          } else setPlaying(true);
        }}
      >
        {thumbnail && <img src={thumbnail} alt="" className={classes.thumbnailImage} />}
        <span className={classes.playButton} aria-hidden="true">
          <PlayIcon />
        </span>
        <span className={ui.visuallyHidden}>
          {isDemo
            ? t("mediaGallery.video.openDemo", textValues({ title }))
            : t("mediaGallery.video.play", textValues({ title }))}
        </span>
      </a>
      {isDemo && (
        <VideoDialog
          video={dialogOpen ? video : undefined}
          onClose={() => setDialogOpen(false)}
          opener={opener}
        />
      )}
    </>
  );
}
