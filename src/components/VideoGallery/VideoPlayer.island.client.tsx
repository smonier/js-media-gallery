import { useState, useRef, useEffect } from "react";
import type { VideoPlayerProps, VideoItem } from "./types";
import classes from "./VideoGallery.module.css";

// Video thumbnail extraction utilities
const getYouTubeThumbnail = (videoId: string) =>
  `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

const getVimeoThumbnail = async (videoId: string): Promise<string | null> => {
  try {
    const response = await fetch(`https://vimeo.com/api/v2/video/${videoId}.json`);
    const data = await response.json();
    return data[0]?.thumbnail_large || null;
  } catch {
    return null;
  }
};

const getWistiaThumbnail = (videoId: string) =>
  `https://fast.wistia.com/embed/medias/${videoId}/swatch`;

const getDailymotionThumbnail = (videoId: string) =>
  `https://www.dailymotion.com/thumbnail/video/${videoId}`;

const getStorylaneThumbnail = (videoId: string) =>
  `https://app.storylane.io/share/${videoId}/thumbnail.png`;

// Embed URL generators
const getYouTubeEmbed = (videoId: string, autoplay: boolean) =>
  `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&rel=0`;

const getVimeoEmbed = (videoId: string, autoplay: boolean) =>
  `https://player.vimeo.com/video/${videoId}?autoplay=${autoplay ? 1 : 0}`;

const getWistiaEmbed = (videoId: string, autoplay: boolean) =>
  `https://fast.wistia.net/embed/iframe/${videoId}?autoPlay=${autoplay ? "true" : "false"}`;

const getDailymotionEmbed = (videoId: string, autoplay: boolean) =>
  `https://www.dailymotion.com/embed/video/${videoId}?autoplay=${autoplay ? 1 : 0}`;

const getStorylaneEmbed = (videoId: string, autoplay: boolean) =>
  `https://app.storylane.io/share/${videoId}${autoplay ? "?autoplay=1" : ""}`;

export default function VideoPlayer({
  video,
  autoplay = false,
  controls = true,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const loadThumbnail = async () => {
      if (video.videoPoster?.url) {
        setThumbnailUrl(video.videoPoster.url);
        return;
      }

      // Auto-fetch thumbnails for external services
      if (video.videoService && video.videoId) {
        switch (video.videoService) {
          case "youtube":
            setThumbnailUrl(getYouTubeThumbnail(video.videoId));
            break;
          case "vimeo": {
            const vimeoThumb = await getVimeoThumbnail(video.videoId);
            if (vimeoThumb) setThumbnailUrl(vimeoThumb);
            break;
          }
          case "wistia":
            setThumbnailUrl(getWistiaThumbnail(video.videoId));
            break;
          case "dailymotion":
            setThumbnailUrl(getDailymotionThumbnail(video.videoId));
            break;
          case "storylane":
            setThumbnailUrl(getStorylaneThumbnail(video.videoId));
            break;
        }
      }
    };

    loadThumbnail();
  }, [video]);

  const handlePlay = () => {
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const renderInternalVideo = () => {
    if (!video.video?.url) return null;

    return (
      <video
        ref={videoRef}
        className={classes.video}
        controls={controls}
        poster={thumbnailUrl || undefined}
        autoPlay={autoplay}
      >
        <source src={video.video.url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
  };

  const renderExternalVideo = () => {
    if (!video.videoService || !video.videoId) return null;

    let embedUrl = "";
    switch (video.videoService) {
      case "youtube":
        embedUrl = getYouTubeEmbed(video.videoId, isPlaying);
        break;
      case "vimeo":
        embedUrl = getVimeoEmbed(video.videoId, isPlaying);
        break;
      case "wistia":
        embedUrl = getWistiaEmbed(video.videoId, isPlaying);
        break;
      case "dailymotion":
        embedUrl = getDailymotionEmbed(video.videoId, isPlaying);
        break;
      case "storylane":
        embedUrl = getStorylaneEmbed(video.videoId, isPlaying);
        break;
    }

    if (!isPlaying && thumbnailUrl) {
      return (
        <div className={classes.videoPreview} onClick={handlePlay}>
          <img
            src={thumbnailUrl}
            alt={video["jcr:title"] || "Video thumbnail"}
            className={classes.thumbnailImage}
          />
          <button className={classes.playButton} aria-label="Play video">
            <svg
              width="68"
              height="48"
              viewBox="0 0 68 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z"
                fill="red"
              />
              <path d="M45 24L27 14v20l18-10z" fill="white" />
            </svg>
          </button>
        </div>
      );
    }

    return (
      <iframe
        src={embedUrl}
        className={classes.videoIframe}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={video["jcr:title"] || "Video"}
      />
    );
  };

  return (
    <div className={classes.videoPlayer}>
      {video.nodeType === "jsmediagallerynt:internalVideo"
        ? renderInternalVideo()
        : renderExternalVideo()}
    </div>
  );
}
