import { jahiaComponent, server, buildNodeUrl } from "@jahia/javascript-modules-library";
import type { InternalVideoProps } from "./types";
import classes from "./InternalVideo.module.css";

export default jahiaComponent(
  {
    componentType: "view",
    nodeType: "jsmediagallerynt:internalVideo",
    name: "gallery",
    displayName: "Gallery Item",
  },
  (props: InternalVideoProps, { renderContext }) => {
    const { "jcr:title": title, video, videoPoster } = props;

    // CRITICAL: Handle JCR nodes OR plain objects
    let videoUrl = undefined;
    let posterUrl = undefined;

    if (video) {
      if (video.getPath && typeof video.getPath === "function") {
        server.render.addCacheDependency({ node: video }, renderContext);
        videoUrl = buildNodeUrl(video);
      } else if (video.path) {
        videoUrl = `/files/default${video.path}`;
      }
    }

    if (videoPoster) {
      if (videoPoster.getPath && typeof videoPoster.getPath === "function") {
        server.render.addCacheDependency({ node: videoPoster }, renderContext);
        posterUrl = buildNodeUrl(videoPoster);
      } else if (videoPoster.path) {
        posterUrl = `/files/default${videoPoster.path}`;
      }
    }

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
