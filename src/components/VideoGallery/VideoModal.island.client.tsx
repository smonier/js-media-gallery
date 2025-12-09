import { useState, useEffect } from "react";
import classes from "./VideoGallery.module.css";

interface VideoData {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  posterUrl?: string;
  videoService?: string;
  videoId?: string;
  isExternal: boolean;
}

interface VideoModalProps {
  videos: VideoData[];
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

export default function VideoModal({ videos }: VideoModalProps) {
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [storylaneThumbnails, setStorylaneThumbnails] = useState<Record<string, string>>({});

  // Fetch Storylane thumbnails on mount
  useEffect(() => {
    const storylaneVideos = videos.filter(
      (v) => v.isExternal && v.videoService?.toLowerCase() === "storylane" && v.videoId,
    );

    storylaneVideos.forEach((video) => {
      if (video.videoId && !storylaneThumbnails[video.videoId]) {
        fetch(
          `https://api.storylane.io/oembed/meta?url=https://jahia.storylane.io/share/${video.videoId}`,
        )
          .then((res) => res.json())
          .then(async (data) => {
            if (data?.thumbnail_url) {
              // Extract first frame from the animated GIF
              try {
                const firstFrame = await extractFirstFrameFromGif(data.thumbnail_url);
                setStorylaneThumbnails((prev) => ({
                  ...prev,
                  [video.videoId!]: firstFrame,
                }));
              } catch (error) {
                // Fallback to original GIF if extraction fails
                setStorylaneThumbnails((prev) => ({
                  ...prev,
                  [video.videoId!]: data.thumbnail_url,
                }));
              }
            }
          })
          .catch(() => {
            // Fallback if API fails
          });
      }
    });
  }, [videos]);

  // Dynamically load Storylane script when needed
  useEffect(() => {
    if (selectedVideo?.isExternal && selectedVideo?.videoService?.toLowerCase() === "storylane") {
      // Check if script is already loaded
      const existingScript = document.querySelector(
        'script[src="https://js.storylane.io/js/v2/storylane.js"]',
      );

      if (existingScript) {
        return;
      }

      const script = document.createElement("script");
      script.src = "https://js.storylane.io/js/v2/storylane.js";
      script.async = true;
      document.body.appendChild(script);

      return () => {
        // Don't remove the script to avoid reloading
      };
    }
  }, [selectedVideo]);

  // Render Storylane fullscreen modal to document.body
  useEffect(() => {
    if (
      selectedVideo?.isExternal &&
      selectedVideo?.videoService?.toLowerCase() === "storylane" &&
      selectedVideo?.videoId
    ) {
      // Create modal element
      const modalId = `storylane-modal-grid-${selectedVideo.videoId}`;
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

      const description = selectedVideo.description || "";

      modalElement.innerHTML = `
        <div style="padding: 16px 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: ${description ? "8px" : "0"};">
            <h2 style="margin: 0; color: white; font-size: 1.25rem; font-weight: 500;">${selectedVideo.title || "Storylane Demo"}</h2>
            <button id="${modalId}-close" type="button" style="background: #1976d2; border: none; color: white; padding: 6px 16px; border-radius: 4px; cursor: pointer; font-size: 0.875rem; font-weight: 500; text-transform: uppercase;">
              Close
            </button>
          </div>
          ${description ? `<div style="color: #ccc; font-size: 0.9rem; line-height: 1.5;">${description}</div>` : ""}
        </div>
        <hr style="margin: 0; border: none; border-top: 1px solid rgba(255, 255, 255, 0.12);" />
        <div style="width: 100%; height: 100vh; align-items: center; justify-content: center; display: flex;">
          <div class="sl-embed" style="position: relative; padding-bottom: 56.25%; width: 100%; height: 0; transform: scale(0.9);">
            <iframe
              allowfullscreen
              loading="lazy"
              src="${getEmbedUrl(selectedVideo.videoService, selectedVideo.videoId)}"
              name="sl-embed"
              allow="fullscreen"
              title="${selectedVideo.title || "Storylane Demo"}"
              style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 1px solid rgba(63, 95, 172, 0.35); box-shadow: 0px 0px 18px rgba(26, 19, 72, 0.15); border-radius: 10px; box-sizing: border-box;"
            ></iframe>
          </div>
        </div>
        <hr style="margin: 0; border: none; border-top: 1px solid rgba(255, 255, 255, 0.12);" />
      `;

      document.body.appendChild(modalElement);
      document.body.style.overflow = "hidden";

      // Add close handler
      const closeButton = document.getElementById(`${modalId}-close`);
      const handleClose = () => {
        setSelectedVideo(null);
      };

      if (closeButton) {
        closeButton.addEventListener("click", handleClose);
      }

      // Add ESC key handler
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setSelectedVideo(null);
        }
      };
      document.addEventListener("keydown", handleEscape);

      // Cleanup
      return () => {
        if (closeButton) {
          closeButton.removeEventListener("click", handleClose);
        }
        document.removeEventListener("keydown", handleEscape);
        const modal = document.getElementById(modalId);
        if (modal && document.body.contains(modal)) {
          document.body.removeChild(modal);
        }
        document.body.style.overflow = "";
      };
    }
  }, [selectedVideo]);

  const getEmbedUrl = (service: string, videoId: string) => {
    switch (service.toLowerCase()) {
      case "youtube":
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      case "vimeo":
        return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
      case "dailymotion":
        return `https://www.dailymotion.com/embed/video/${videoId}?autoplay=1`;
      case "wistia":
        return `https://fast.wistia.net/embed/iframe/${videoId}?autoplay=1`;
      case "storylane":
        return `https://jahia.storylane.io/demo/${videoId}?embed=inline`;
      default:
        return "";
    }
  };

  const getServiceThumbnail = (service?: string, videoId?: string) => {
    if (!service || !videoId) return undefined;

    switch (service.toLowerCase()) {
      case "youtube":
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      case "wistia":
        return `https://fast.wistia.com/embed/medias/${videoId}/swatch`;
      case "dailymotion":
        return `https://www.dailymotion.com/thumbnail/video/${videoId}`;
      default:
        return undefined;
    }
  };

  const getThumbnailUrl = (video: VideoData) => {
    if (video.posterUrl) return video.posterUrl;
    if (video.isExternal) {
      // For Storylane, use the fetched thumbnail from state
      if (video.videoService?.toLowerCase() === "storylane" && video.videoId) {
        return (
          storylaneThumbnails[video.videoId] ||
          getServiceThumbnail(video.videoService, video.videoId)
        );
      }
      return getServiceThumbnail(video.videoService, video.videoId);
    }
    return undefined;
  };

  const closeModal = () => {
    setSelectedVideo(null);
  };

  return (
    <>
      <div className={classes.videoGrid}>
        {videos.map((video) => {
          const thumbnailUrl = getThumbnailUrl(video);

          return (
            <button
              key={video.id}
              type="button"
              className={classes.gridVideoCard}
              onClick={() => setSelectedVideo(video)}
            >
              <div className={classes.gridThumbnailWrapper}>
                {thumbnailUrl ? (
                  <img
                    src={thumbnailUrl}
                    alt={video.title || "Video thumbnail"}
                    className={classes.gridThumbnail}
                  />
                ) : (
                  <div className={classes.gridPlaceholder}>
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
                  </div>
                )}
                <div className={classes.playButton}>
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
                </div>
              </div>
              {video.title && <h3 className={classes.gridVideoTitle}>{video.title}</h3>}
              {video.description && (
                <div
                  className={classes.gridVideoDescription}
                  dangerouslySetInnerHTML={{ __html: video.description }}
                />
              )}
            </button>
          );
        })}
      </div>

      {selectedVideo && selectedVideo.videoService?.toLowerCase() !== "storylane" && (
        <div className={classes.modal} onClick={closeModal}>
          <div className={classes.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={classes.modalClose}
              onClick={closeModal}
              aria-label="Close video"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className={classes.modalVideoWrapper}>
              {selectedVideo.isExternal ? (
                <iframe
                  className={classes.modalVideo}
                  src={getEmbedUrl(selectedVideo.videoService!, selectedVideo.videoId!)}
                  title={selectedVideo.title || "Video"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  className={classes.modalVideo}
                  controls
                  autoPlay
                  poster={selectedVideo.posterUrl}
                >
                  <source src={selectedVideo.videoUrl} type="video/mp4" />
                  <source src={selectedVideo.videoUrl} type="video/webm" />
                  <source src={selectedVideo.videoUrl} type="video/ogg" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>

            {(selectedVideo.title || selectedVideo.description) && (
              <div className={classes.modalInfo}>
                {selectedVideo.title && (
                  <h2 className={classes.modalTitle}>{selectedVideo.title}</h2>
                )}
                {selectedVideo.description && (
                  <div
                    className={classes.modalDescription}
                    dangerouslySetInnerHTML={{ __html: selectedVideo.description }}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
