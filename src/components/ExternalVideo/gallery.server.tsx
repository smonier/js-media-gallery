import { jahiaComponent, Island } from "@jahia/javascript-modules-library";
import type { ExternalVideoProps } from "./types";
import classes from "./ExternalVideo.module.css";
import ExternalVideoPlayer from "./ExternalVideoPlayer.island.client";

const buildFileUrl = (fileNode: { path: string } | undefined) => {
  if (!fileNode?.path) return undefined;
  return `/files/default${fileNode.path}`;
};

export default jahiaComponent(
  {
    componentType: "view",
    nodeType: "jsmediagallerynt:externalVideo",
    name: "gallery",
    displayName: "Gallery Item",
  },
  (props: ExternalVideoProps) => {
    const { "jcr:title": title, videoService, videoId, videoPoster } = props;
    const posterUrl = buildFileUrl(videoPoster);

    if (!videoId) {
      return (
        <div className={classes.galleryItem}>
          <div className={classes.videoPlaceholder}>
            <p className={classes.noVideo}>No video ID provided</p>
          </div>
        </div>
      );
    }

    return (
      <div className={classes.galleryItem}>
        <div className={classes.galleryVideoContainer}>
          <Island
            component={ExternalVideoPlayer}
            props={{
              videoService,
              videoId,
              posterUrl,
              title,
            }}
          >
            <div className={classes.videoFallback}>
              {posterUrl && (
                <img src={posterUrl} alt={title || "Video"} className={classes.posterImage} />
              )}
            </div>
          </Island>
        </div>
        {title && <h4 className={classes.galleryTitle}>{title}</h4>}
      </div>
    );
  },
);
