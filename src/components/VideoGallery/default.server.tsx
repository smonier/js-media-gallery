import { getChildNodes, jahiaComponent } from "@jahia/javascript-modules-library";
import { headingLevel } from "../../utils/jcr.js";
import GalleryFrame from "./GalleryFrame.js";
import type { VideoGalleryProps } from "./types.js";
import VideoList from "./VideoList.js";

export default jahiaComponent(
  {
    componentType: "view",
    nodeType: "jsmediagallerynt:videoGallery",
    name: "default",
    displayName: "Default View",
  },
  (props: VideoGalleryProps, { currentNode, currentResource, renderContext }) => {
    const { "jcr:title": title, bannerText } = props;
    const level = headingLevel(currentResource, 2);
    const isEmpty = getChildNodes(currentNode, 1, 0).length === 0;
    return (
      <GalleryFrame
        title={title}
        bannerText={bannerText}
        level={level}
        isEmpty={isEmpty && !renderContext.isEditMode()}
      >
        <VideoList currentNode={currentNode} headingLevel={title ? level + 1 : level} />
      </GalleryFrame>
    );
  },
);
