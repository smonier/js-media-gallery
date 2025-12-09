import { useState } from "react";
import classes from "./VideoGallery.module.css";
import { getEmbedUrl, getServiceThumbnail } from "../../utils/video";

interface VideoData {
  id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  posterUrl?: string;
  videoService?: string;
  videoId?: string;
  isExternal: boolean;
}

interface FeaturedGalleryProps {
  videos: VideoData[];
}

export default function FeaturedGallery({ videos }: FeaturedGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Debug logging
  console.log(
    "Client received videos:",
    videos.map((v) => ({
      title: v.title,
      isExternal: v.isExternal,
      videoService: v.videoService,
      videoId: v.videoId,
      hasPoster: !!v.posterUrl,
      posterUrl: v.posterUrl,
    })),
  );

  if (!videos || videos.length === 0) {
    return (
      <div className={classes.featuredEmpty}>
        <p>No videos available</p>
      </div>
    );
  }

  const activeVideo = videos[activeIndex];

  // Get thumbnail URL with priority: custom poster > service thumbnail > placeholder
  const getThumbnailUrl = (video: VideoData) => {
    if (video.posterUrl) {
      return video.posterUrl;
    }
    if (video.isExternal) {
      const serviceThumbnail = getServiceThumbnail(video.videoService, video.videoId);
      console.log(
        `Service thumbnail for ${video.videoService} ${video.videoId}:`,
        serviceThumbnail,
      );
      return serviceThumbnail;
    }
    return undefined;
  };

  return (
    <div className={classes.featuredLayout}>
      {/* Main Video Section - 9/13 width */}
      <div className={classes.featuredMain}>
        <div className={classes.featuredVideoWrapper}>
          {activeVideo.isExternal ? (
            <iframe
              className={classes.videoIframe}
              src={getEmbedUrl(activeVideo.videoService || "", activeVideo.videoId || "")}
              title={activeVideo.title || "Video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              className={classes.video}
              controls
              poster={activeVideo.posterUrl}
              key={activeVideo.id}
            >
              <source src={activeVideo.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </div>

      {/* Description Section - 3/13 width */}
      <div className={classes.featuredDescription}>
        <h3 className={classes.featuredVideoTitle}>{activeVideo.title || "Untitled Video"}</h3>
        {activeVideo.description && (
          <div
            className={classes.featuredVideoDesc}
            dangerouslySetInnerHTML={{ __html: activeVideo.description }}
          />
        )}
      </div>

      {/* Thumbnail Carousel - Full Width Second Row */}
      {videos.length > 1 && (
        <div className={classes.featuredCarousel}>
          <div className={classes.carouselTrack}>
            {videos.map((video, index) => {
              const thumbnailUrl = getThumbnailUrl(video);

              return (
                <button
                  key={video.id}
                  type="button"
                  className={`${classes.carouselThumbnail} ${index === activeIndex ? classes.carouselThumbnailActive : ""}`}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Play ${video.title || "video"}`}
                >
                  <div className={classes.thumbnailWrapper}>
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt={video.title || "Video thumbnail"}
                        className={classes.thumbnailImage}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          objectPosition: "center",
                          display: "block",
                        }}
                      />
                    ) : (
                      <div className={classes.thumbnailPlaceholder}>
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
                    {index === activeIndex && (
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
                    )}
                  </div>
                  {video.title && <span className={classes.thumbnailTitle}>{video.title}</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
