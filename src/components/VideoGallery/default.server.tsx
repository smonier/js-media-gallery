import { getChildNodes, jahiaComponent, Render } from "@jahia/javascript-modules-library";
import { headingLevel } from "../../utils/jcr.js";
import GalleryFrame from "./GalleryFrame.js";
import type { VideoGalleryProps } from "./types.js";
import classes from "./VideoGallery.module.css";

export default jahiaComponent(
  {
    componentType: "view",
    nodeType: "jsmediagallerynt:videoGallery",
    name: "default",
    displayName: "Default View",
  },
  (props: VideoGalleryProps, { currentNode, currentResource }) => {
    const { "jcr:title": title, bannerText } = props;
    const level = headingLevel(currentResource, 2);
    const childNodes = getChildNodes(currentNode, -1, 0);
    return (
      <GalleryFrame
        title={title}
        bannerText={bannerText}
        level={level}
        isEmpty={childNodes.length === 0}
      >
        <ul className={classes.defaultGallery}>
          {childNodes.map((childNode) => (
            <li key={childNode.getIdentifier()} className={classes.defaultGalleryItem}>
              <Render
                node={childNode}
                view="gallery"
                parameters={{ headingLevel: String(title ? level + 1 : level) }}
              />
            </li>
          ))}
        </ul>
      </GalleryFrame>
    );
  },
);
