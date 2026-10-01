import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { PauseIcon, PlayIcon } from "../../utils/icons.js";
import ui from "../../utils/ui.module.css";
import classes from "./VideoHeading.module.css";

interface HeroVideoProps {
  src: string;
  mimeType?: string;
  posterUrl?: string;
}

/**
 * Muted background video of the hero (RGAA 4.10 and 13.8): it starts only when JavaScript runs and
 * the visitor has not asked for reduced motion, and a visible button pauses and restarts it.
 * The button follows the video's own play and pause events, so it always tells its real state.
 * The video is decorative: the hero's text carries the information.
 */
export default function HeroVideo({ src, mimeType, posterUrl }: HeroVideoProps) {
  const { t } = useTranslation("js-media-gallery");
  const video = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setReady(true);
    const element = video.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    element.muted = true;
    // A refused start leaves the video paused; its state is read from the events below.
    element.play().catch(() => undefined);
  }, []);

  const toggle = () => {
    const element = video.current;
    if (!element) return;
    if (element.paused) element.play().catch(() => undefined);
    else element.pause();
  };

  return (
    <>
      <video
        ref={video}
        className={classes.video}
        muted
        loop
        playsInline
        preload="metadata"
        poster={posterUrl}
        aria-hidden="true"
        tabIndex={-1}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        <source src={src} type={mimeType} />
      </video>
      {ready && (
        <button
          type="button"
          className={`${ui.control} ${ui.iconButton} ${classes.toggle}`}
          onClick={toggle}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
          <span className={ui.visuallyHidden}>
            {playing ? t("mediaGallery.hero.pause") : t("mediaGallery.hero.play")}
          </span>
        </button>
      )}
    </>
  );
}
