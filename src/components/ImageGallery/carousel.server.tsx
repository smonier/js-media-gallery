import { Island, jahiaComponent } from "@jahia/javascript-modules-library";
import { collectImages, headingLevel } from "../../utils/jcr.js";
import GalleryFrame from "./GalleryFrame.js";
import CarouselClient from "./carousel.island.client.js";
import type { ImageGalleryProps } from "./types.js";

export default jahiaComponent(
  {
    componentType: "view",
    nodeType: "jsmediagallerynt:imageGallery",
    name: "carousel",
    displayName: "Carousel View",
  },
  (props: ImageGalleryProps, { renderContext, currentResource }) => {
    const { "jcr:title": title, bannerText } = props;
    const images = collectImages(props, renderContext);
    const level = headingLevel(currentResource, 2);
    // In edit mode the slides are shown side by side, with no rotation.
    const flat = renderContext.isEditMode();
    return (
      <GalleryFrame
        title={title}
        bannerText={bannerText}
        level={level}
        isEmpty={images.length === 0}
      >
        <Island component={CarouselClient} props={{ images, title: title || "", flat }} />
      </GalleryFrame>
    );
  },
);
