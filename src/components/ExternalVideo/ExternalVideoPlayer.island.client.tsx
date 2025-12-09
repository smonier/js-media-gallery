import { useState, useEffect } from "react";
import classes from "./ExternalVideo.module.css";

interface ExternalVideoPlayerProps {
  videoService: "youtube" | "vimeo" | "wistia" | "dailymotion" | "storylane";
  videoId: string;
  posterUrl?: string;
  title?: string;
  videoDesc?: string;
}

// Helper function to extract first frame from GIF
const extractFirstFrameFromGif = async (gifUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(URL.createObjectURL(blob));
            } else {
              reject(new Error("Failed to create blob"));
            }
          },
          "image/jpeg",
          0.95,
        );
      } else {
        reject(new Error("Failed to get canvas context"));
      }
    };

    img.onerror = () => {
      // If extraction fails, return original URL
      resolve(gifUrl);
    };

    img.src = gifUrl;
  });
};

// Embed URL generators
const getYouTubeEmbed = (videoId: string) => `https://www.youtube.com/embed/${videoId}?rel=0`;

const getVimeoEmbed = (videoId: string) => `https://player.vimeo.com/video/${videoId}`;

const getWistiaEmbed = (videoId: string) => `https://fast.wistia.net/embed/iframe/${videoId}`;

const getDailymotionEmbed = (videoId: string) =>
  `https://www.dailymotion.com/embed/video/${videoId}`;

const getStorylaneEmbed = (videoId: string) =>
  `https://jahia.storylane.io/demo/${videoId}?embed=inline`;

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
  videoDesc,
}: ExternalVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(posterUrl || null);
  const [storylaneScriptLoaded, setStorylineScriptLoaded] = useState(false);

  const isStorylane = videoService === "storylane";

  // Dynamically load Storylane script when needed
  useEffect(() => {
    if (isStorylane && isFullscreen && !storylaneScriptLoaded) {
      // Check if script is already loaded
      const existingScript = document.querySelector(
        'script[src="https://js.storylane.io/js/v2/storylane.js"]',
      );

      if (existingScript) {
        setStorylineScriptLoaded(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://js.storylane.io/js/v2/storylane.js";
      script.async = true;
      script.onload = () => setStorylineScriptLoaded(true);
      document.body.appendChild(script);

      return () => {
        // Don't remove the script to avoid reloading
      };
    }
  }, [isStorylane, isFullscreen, storylaneScriptLoaded]);

  // Render modal to document.body when fullscreen
  useEffect(() => {
    if (isFullscreen && isStorylane) {
      // Create modal element
      const modalId = `storylane-modal-${videoId}`;
      const existingModal = document.getElementById(modalId);

      if (existingModal) {
        return;
      }

      const modalElement = document.createElement("div");
      modalElement.id = modalId;
      modalElement.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100vw;
        height: 100vh;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        background-color: rgba(0, 0, 0, 0.9);
        backdrop-filter: blur(4px);
      `;

      modalElement.innerHTML = `
        <div style="padding: 16px 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: ${videoDesc ? "8px" : "0"};">
            <h2 style="margin: 0; color: white; font-size: 1.25rem; font-weight: 500;">${title || "Storylane Demo"}</h2>
            <button id="${modalId}-close" type="button" style="background: #1976d2; border: none; color: white; padding: 6px 16px; border-radius: 4px; cursor: pointer; font-size: 0.875rem; font-weight: 500; text-transform: uppercase;">
              Close
            </button>
          </div>
          ${videoDesc ? `<div style="color: #ccc; font-size: 0.9rem; line-height: 1.5;">${videoDesc}</div>` : ""}
        </div>
        <hr style="margin: 0; border: none; border-top: 1px solid rgba(255, 255, 255, 0.12);" />
        <div style="width: 100%; height: 100vh; align-items: center; justify-content: center; display: flex;">
          <div class="sl-embed" style="position: relative; padding-bottom: 56.25%; width: 100%; height: 0; transform: scale(0.9);">
            <iframe
              allowfullscreen
              loading="lazy"
              src="${getStorylaneEmbed(videoId)}"
              name="sl-embed"
              allow="fullscreen"
              title="${title || "Storylane Demo"}"
              style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 1px solid rgba(63, 95, 172, 0.35); box-shadow: 0px 0px 18px rgba(26, 19, 72, 0.15); border-radius: 10px; box-sizing: border-box;"
            ></iframe>
          </div>
        </div>
        <hr style="margin: 0; border: none; border-top: 1px solid rgba(255, 255, 255, 0.12);" />
      `;

      document.body.appendChild(modalElement);

      // Add close handler
      const closeButton = document.getElementById(`${modalId}-close`);
      const handleClose = () => {
        setIsFullscreen(false);
      };

      if (closeButton) {
        closeButton.addEventListener("click", handleClose);
      }

      // Cleanup
      return () => {
        if (closeButton) {
          closeButton.removeEventListener("click", handleClose);
        }
        const modal = document.getElementById(modalId);
        if (modal && document.body.contains(modal)) {
          document.body.removeChild(modal);
        }
      };
    }
  }, [isFullscreen, isStorylane, videoId, title]);

  // Prevent body scroll when fullscreen
  useEffect(() => {
    if (isFullscreen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      // Add escape key handler
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsFullscreen(false);
        }
      };

      document.addEventListener("keydown", handleEscape);

      return () => {
        document.body.style.overflow = originalOverflow;
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isFullscreen]);
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
      case "storylane":
        // Storylane requires oEmbed API call
        fetch(
          `https://api.storylane.io/oembed/meta?url=https://jahia.storylane.io/share/${videoId}`,
        )
          .then((res) => res.json())
          .then(async (data) => {
            if (data?.thumbnail_url) {
              // Extract first frame from the animated GIF
              try {
                const firstFrame = await extractFirstFrameFromGif(data.thumbnail_url);
                setThumbnailUrl(firstFrame);
              } catch (error) {
                // Fallback to original GIF if extraction fails
                setThumbnailUrl(data.thumbnail_url);
              }
            }
          })
          .catch(() => {
            // Fallback if API fails
          });
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
      case "storylane":
        return getStorylaneEmbed(videoId);
      default:
        return "";
    }
  };

  const handlePlay = () => {
    // For Storylane, open fullscreen modal instead of inline
    if (isStorylane) {
      setIsFullscreen(true);
    } else {
      setIsPlaying(true);
    }
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  // Render thumbnail preview
  const showThumbnail = !isPlaying && !isFullscreen && thumbnailUrl;

  // Render fullscreen modal for Storylane
  const showModal = isFullscreen && isStorylane;

  return (
    <>
      {/* Thumbnail preview (for all videos before playing) */}
      {showThumbnail && (
        <div className={classes.videoPlayer}>
          <div className={classes.videoPreview} onClick={handlePlay}>
            <img
              src={thumbnailUrl}
              alt={title || "Video thumbnail"}
              className={classes.thumbnailImage}
            />
            <button type="button" className={classes.playButton} aria-label="Play video">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="10" fill="white" fillOpacity="0.95" />
                <path d="M10 8.5v7l6-3.5-6-3.5z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Inline video player for non-Storylane videos */}
      {!showThumbnail && !showModal && (
        <div className={classes.videoPlayer}>
          <iframe
            src={getEmbedUrl()}
            className={classes.videoIframe}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title || "Video"}
          />
        </div>
      )}
    </>
  );
}
