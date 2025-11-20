import { useState } from "react";
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

export default function VideoModal({ videos }: VideoModalProps) {
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);

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
                      width="64"
                      height="64"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                )}
                <div className={classes.gridPlayOverlay}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
              </div>
              {video.title && <h3 className={classes.gridVideoTitle}>{video.title}</h3>}
            </button>
          );
        })}
      </div>

      {selectedVideo && (
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
