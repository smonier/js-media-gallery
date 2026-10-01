import { Island, jahiaComponent } from "@jahia/javascript-modules-library";
import { collectImages, headingLevel } from "../../utils/jcr.js";
import GalleryFrame from "./GalleryFrame.js";
import GalleryIsland from "./GalleryIsland.island.client.js";
import type { ImageGalleryProps } from "./types.js";

export default jahiaComponent(
  {
    componentType: "view",
    nodeType: "jsmediagallerynt:imageGallery",
    name: "gallery",
    displayName: "Gallery View",
  },
  (props: ImageGalleryProps, { renderContext, currentResource }) => {
    const { "jcr:title": title, bannerText } = props;
    const images = collectImages(props, renderContext);
    const level = headingLevel(currentResource, 2);
    return (
      <GalleryFrame
        title={title}
        bannerText={bannerText}
        level={level}
        isEmpty={images.length === 0}
      >
        <Island component={GalleryIsland} props={{ images, title: title || "" }} />
      </GalleryFrame>
    );
  },
);
