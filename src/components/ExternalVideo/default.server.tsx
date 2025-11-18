import {
  jahiaComponent,
  Island,
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
  (props: ExternalVideoProps) => {
    const { "jcr:title": title, videoService, videoId, videoPoster } = props;
    const posterUrl = videoPoster?.path ? `/files/default${videoPoster.path}` : undefined;

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
