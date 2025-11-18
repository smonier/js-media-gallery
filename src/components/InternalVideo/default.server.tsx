import {
  jahiaComponent,
  server,
  buildNodeUrl,
  AddResources,
  buildModuleFileUrl,
} from "@jahia/javascript-modules-library";
import type { InternalVideoProps } from "./types";
import classes from "./InternalVideo.module.css";

export default jahiaComponent<InternalVideoProps>(
  {
    componentType: "view",
    nodeType: "jsmediagallerynt:internalVideo",
    name: "default",
    displayName: "Internal Video",
  },
  (props, { renderContext }) => {
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
        <>
          <AddResources type="css" resources={buildModuleFileUrl("dist/assets/style.css")} />
          <div className={classes.root}>
            <p className={classes.noVideo}>No video selected</p>
          </div>
        </>
      );
    }

    return (
      <>
        <AddResources type="css" resources={buildModuleFileUrl("dist/assets/style.css")} />
        <div className={classes.root}>
          {title && <h3 className={classes.title}>{title}</h3>}
          <div className={classes.videoContainer}>
            <video className={classes.video} controls poster={posterUrl}>
              <source src={videoUrl} type="video/mp4" />
              <source src={videoUrl} type="video/webm" />
              <source src={videoUrl} type="video/ogg" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </>
    );
  },
);
