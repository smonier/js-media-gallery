import {
  jahiaComponent,
  AddResources,
  buildModuleFileUrl,
} from "@jahia/javascript-modules-library";
import type { VideoGalleryProps } from "./types";
import classes from "./VideoGallery.module.css";

export default jahiaComponent(
  {
    componentType: "view",
    nodeType: "jsmediagallerynt:videoGallery",
    name: "default",
    displayName: "Default View",
  },
  (props: VideoGalleryProps, { renderChildren }) => {
    const { "jcr:title": title, bannerText } = props;

    return (
      <>
        <AddResources type="css" resources={buildModuleFileUrl("dist/assets/style.css")} />
        <div className={classes.root}>
          {title && <h2 className={classes.title}>{title}</h2>}
          {bannerText && (
            <div className={classes.banner} dangerouslySetInnerHTML={{ __html: bannerText }} />
          )}

          <div className={classes.defaultGallery}>{renderChildren({ view: "gallery" })}</div>
        </div>
      </>
    );
  },
);
