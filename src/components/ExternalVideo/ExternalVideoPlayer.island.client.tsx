import { useState, useEffect } from "react";
import classes from "./ExternalVideo.module.css";

interface ExternalVideoPlayerProps {
  videoService: "youtube" | "vimeo" | "wistia" | "dailymotion";
  videoId: string;
  posterUrl?: string;
  title?: string;
}

// Embed URL generators
const getYouTubeEmbed = (videoId: string) =>
  `https://www.youtube.com/embed/${videoId}?rel=0`;

const getVimeoEmbed = (videoId: string) =>
  `https://player.vimeo.com/video/${videoId}`;

const getWistiaEmbed = (videoId: string) =>
  `https://fast.wistia.net/embed/iframe/${videoId}`;

const getDailymotionEmbed = (videoId: string) =>
  `https://www.dailymotion.com/embed/video/${videoId}`;

// Thumbnail generators
const getYouTubeThumbnail = (videoId: string) =>
  `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

const getWistiaThumbnail = (videoId: string) =>
  `https://fast.wistia.com/embed/medias/${videoId}/swatch`;

const getDailymotionThumbnail = (videoId: string) =>
  `https://www.dailymotion.com/thumbnail/video/${videoId}`;

export default function ExternalVideoPlayer({
  videoService,
  videoId,
  posterUrl,
  title,
}: ExternalVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(posterUrl || null);

  useEffect(() => {
    if (posterUrl) {
      setThumbnailUrl(posterUrl);
      return;
    }

    // Auto-fetch service thumbnails
    switch (videoService) {
      case "youtube":
        setThumbnailUrl(getYouTubeThumbnail(videoId));
        break;
      case "wistia":
        setThumbnailUrl(getWistiaThumbnail(videoId));
        break;
      case "dailymotion":
        setThumbnailUrl(getDailymotionThumbnail(videoId));
        break;
      case "vimeo":
        // Vimeo requires API call
        fetch(`https://vimeo.com/api/v2/video/${videoId}.json`)
          .then((res) => res.json())
          .then((data) => {
            if (data[0]?.thumbnail_large) {
              setThumbnailUrl(data[0].thumbnail_large);
            }
          })
          .catch(() => {
            // Fallback if API fails
          });
        break;
    }
  }, [videoService, videoId, posterUrl]);

  const getEmbedUrl = () => {
    switch (videoService) {
      case "youtube":
        return getYouTubeEmbed(videoId);
      case "vimeo":
        return getVimeoEmbed(videoId);
      case "wistia":
        return getWistiaEmbed(videoId);
      case "dailymotion":
        return getDailymotionEmbed(videoId);
      default:
        return "";
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  if (!isPlaying && thumbnailUrl) {
    return (
      <div className={classes.videoPlayer}>
        <div className={classes.videoPreview} onClick={handlePlay}>
          <img
            src={thumbnailUrl}
            alt={title || "Video thumbnail"}
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
      </div>
    );
  }

  return (
    <div className={classes.videoPlayer}>
      <iframe
        src={getEmbedUrl()}
        className={classes.videoIframe}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={title || "Video"}
      />
    </div>
  );
}
