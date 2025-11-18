import {
  jahiaComponent,
  server,
  buildNodeUrl,
  AddResources,
  buildModuleFileUrl,
} from "@jahia/javascript-modules-library";
import type { VideoHeadingProps } from "./types";
import classes from "./VideoHeading.module.css";

export default jahiaComponent(
  {
    componentType: "view",
    nodeType: "jsmediagallerynt:videoHeading",
    name: "default",
    displayName: "Video Hero Banner",
  },
  (props: VideoHeadingProps, { renderContext }) => {
    const { "jcr:title": title, video, caption, linkUrl, linkText } = props;

    // CRITICAL: video can be a JCR node OR an object with path property
    let videoUrl = undefined;

    if (video) {
      if (video.getPath && typeof video.getPath === "function") {
        // video is a JCR node - use buildNodeUrl
        server.render.addCacheDependency({ node: video }, renderContext);
        videoUrl = buildNodeUrl(video);
      } else if (video.path) {
        // video is an object with path property
        videoUrl = `/files/default${video.path}`;
      }
    }

    return (
      <>
        <AddResources type="css" resources={buildModuleFileUrl("dist/assets/style.css")} />
        <section className={classes.hero}>
          <div className={classes.videoBackground}>
            {videoUrl ? (
              <video className={classes.video} autoPlay muted loop playsInline>
                <source src={videoUrl} type="video/mp4" />
              </video>
            ) : (
              <div className={classes.placeholder}>No video selected</div>
            )}
            <div className={classes.overlay} />
          </div>

          <div className={classes.content}>
            <div className={classes.textWrapper}>
              {title && <h1 className={classes.title}>{title}</h1>}
              {caption && (
                <div className={classes.caption} dangerouslySetInnerHTML={{ __html: caption }} />
              )}
              {linkUrl && linkText && (
                <a href={linkUrl} className={classes.cta}>
                  {linkText}
                </a>
              )}
            </div>
          </div>
        </section>
      </>
    );
  },
);
