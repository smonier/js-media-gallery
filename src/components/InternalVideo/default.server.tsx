import {
  jahiaComponent,
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
  (props) => {
    const { "jcr:title": title, video, videoPoster } = props;
    const videoUrl = video?.path ? `/files/default${video.path}` : undefined;
    const posterUrl = videoPoster?.path ? `/files/default${videoPoster.path}` : undefined;

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
