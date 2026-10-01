import { Island, jahiaComponent } from "@jahia/javascript-modules-library";
import { collectImages, headingLevel } from "../../utils/jcr.js";
import GalleryFrame from "./GalleryFrame.js";
import ImageModal from "./ImageModal.island.client.js";
import type { ImageGalleryProps } from "./types.js";

export default jahiaComponent(
  {
    componentType: "view",
    nodeType: "jsmediagallerynt:imageGallery",
    name: "default",
    displayName: "Default View",
  },
  (props: ImageGalleryProps, { currentNode, renderContext, currentResource }) => {
    const { "jcr:title": title, bannerText } = props;
    const images = collectImages(props, renderContext, currentNode);
    const level = headingLevel(currentResource, 2);
    return (
      <GalleryFrame
        title={title}
        bannerText={bannerText}
        level={level}
        isEmpty={images.length === 0}
      >
        <Island component={ImageModal} props={{ images, layout: "default", title: title || "" }} />
      </GalleryFrame>
    );
  },
);
