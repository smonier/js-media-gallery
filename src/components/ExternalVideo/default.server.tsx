import {
  jahiaComponent,
  Island,
  server,
  buildNodeUrl,
  AddResources,
  buildModuleFileUrl,
} from "@jahia/javascript-modules-library";
import type { ExternalVideoProps } from "./types";
import classes from "./ExternalVideo.module.css";
import ExternalVideoPlayer from "./ExternalVideoPlayer.island.client";

export default jahiaComponent(
  {
    componentType: "view",
    nodeType: "jsmediagallerynt:externalVideo",
    name: "default",
    displayName: "External Video",
  },
  (props: ExternalVideoProps, { renderContext }) => {
    const { "jcr:title": title, videoService, videoId, videoPoster } = props;

    // CRITICAL: Handle JCR nodes OR plain objects
    let posterUrl = undefined;

    if (videoPoster) {
      if (videoPoster.getPath && typeof videoPoster.getPath === "function") {
        server.render.addCacheDependency({ node: videoPoster }, renderContext);
        posterUrl = buildNodeUrl(videoPoster);
      } else if (videoPoster.path) {
        posterUrl = `/files/default${videoPoster.path}`;
      }
    }

    if (!videoId) {
      return (
        <>
          <AddResources type="css" resources={buildModuleFileUrl("dist/assets/style.css")} />
          <div className={classes.root}>
            <p className={classes.noVideo}>No video ID provided</p>
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
        </div>
      </>
    );
  },
);
