import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { getEmbedUrl, SERVICE_NAMES, type VideoData } from "./video.js";
import ui from "./ui.module.css";

interface VideoFrameProps {
  video: VideoData;
  /** Start playing at once: only after a visitor action. */
  autoplay?: boolean;
  /** Move the keyboard focus to the player once it is shown (after a click on "play"). */
  focusOnMount?: boolean;
  className?: string;
}

/**
 * The player of a video: the provider's player in a frame, or a <video> element with the native
 * controls (keyboard operable) and the captions track when there is one.
 */
export default function VideoFrame({
  video,
  autoplay = false,
  focusOnMount = false,
  className,
}: VideoFrameProps) {
  const { t } = useTranslation("js-media-gallery");
  const frameRef = useRef<HTMLIFrameElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (focusOnMount) (frameRef.current ?? videoRef.current)?.focus();
  }, [focusOnMount]);
  const title = video.title || t("mediaGallery.video.untitled");

  if (video.isExternal) {
    if (!video.videoService || !video.videoId) return null;
    const src = getEmbedUrl(video.videoService, video.videoId, {
      autoplay,
      hash: video.videoHash,
    });
    if (!src) return null;
    const frameTitle =
      video.videoService === "storylane"
        ? t("mediaGallery.video.demoFrameTitle", { title })
        : t("mediaGallery.video.frameTitle", { service: SERVICE_NAMES[video.videoService], title });
    return (
      <iframe
        ref={frameRef}
        src={src}
        className={className}
        title={frameTitle}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox allow-forms"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
      />
    );
  }

  if (!video.videoUrl) return null;
  return (
    <video
      ref={videoRef}
      className={className}
      controls
      preload="metadata"
      poster={video.posterUrl}
      autoPlay={autoplay}
      aria-label={title}
    >
      <source src={video.videoUrl} type={video.mimeType} />
      {video.captionsUrl && (
        <track
          kind="captions"
          src={video.captionsUrl}
          srcLang={video.captionsLang}
          label={t("mediaGallery.video.captions")}
          default
        />
      )}
      <p className={ui.dialogText}>
        {t("mediaGallery.video.unsupported")}{" "}
        <a href={video.videoUrl}>{t("mediaGallery.video.download")}</a>
      </p>
    </video>
  );
}
