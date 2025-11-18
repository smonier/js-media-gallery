import {
  jahiaComponent,
  AddResources,
  buildModuleFileUrl,
  getChildNodes,
  Render,
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
  (props: VideoGalleryProps, { currentNode }) => {
    const { "jcr:title": title, bannerText } = props;

    // Get all child video nodes
    const childNodes = getChildNodes(currentNode, -1, 0);

    return (
      <>
        <AddResources type="css" resources={buildModuleFileUrl("dist/assets/style.css")} />
        <div className={classes.root}>
          {title && <h2 className={classes.title}>{title}</h2>}
          {bannerText && (
            <div className={classes.banner} dangerouslySetInnerHTML={{ __html: bannerText }} />
          )}

          <div className={classes.defaultGallery}>
            {childNodes.map((childNode) => (
              <Render key={childNode.getIdentifier()} node={childNode} view="gallery" />
            ))}
          </div>
        </div>
      </>
    );
  },
);
