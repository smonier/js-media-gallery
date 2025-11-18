import { jahiaComponent } from "@jahia/javascript-modules-library";
import type { InternalVideoProps } from "./types";
import classes from "./InternalVideo.module.css";

const buildFileUrl = (fileNode: { path: string } | undefined) => {
  if (!fileNode?.path) return undefined;
  return `/files/default${fileNode.path}`;
};

export default jahiaComponent(
  {
    componentType: "view",
    nodeType: "jsmediagallerynt:internalVideo",
    name: "gallery",
    displayName: "Gallery Item",
  },
  (props: InternalVideoProps) => {
    const { "jcr:title": title, video, videoPoster } = props;
    const videoUrl = buildFileUrl(video);
    const posterUrl = buildFileUrl(videoPoster);

    if (!videoUrl) {
      return (
        <div className={classes.galleryItem}>
          <div className={classes.videoPlaceholder}>
            <p className={classes.noVideo}>No video selected</p>
          </div>
        </div>
      );
    }

    return (
      <div className={classes.galleryItem}>
        <div className={classes.galleryVideoContainer}>
          <video className={classes.video} controls poster={posterUrl}>
            <source src={videoUrl} type="video/mp4" />
            <source src={videoUrl} type="video/webm" />
            <source src={videoUrl} type="video/ogg" />
            Your browser does not support the video tag.
          </video>
        </div>
        {title && <h4 className={classes.galleryTitle}>{title}</h4>}
      </div>
    );
  },
);
