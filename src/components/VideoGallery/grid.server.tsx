import { Island, jahiaComponent } from "@jahia/javascript-modules-library";
import { headingLevel } from "../../utils/jcr.js";
import { collectVideos } from "./collect.js";
import GalleryFrame from "./GalleryFrame.js";
import VideoModal from "./VideoModal.island.client.js";
import Transcripts from "./Transcripts.js";
import VideoList from "./VideoList.js";
import type { VideoGalleryProps } from "./types.js";

export default jahiaComponent(
  {
    componentType: "view",
    nodeType: "jsmediagallerynt:videoGallery",
    name: "grid",
    displayName: "Grid View",
  },
  (props: VideoGalleryProps, { currentNode, currentResource, renderContext }) => {
    const { "jcr:title": title, bannerText, itemWidth } = props;
    const level = headingLevel(currentResource, 2);
    const itemLevel = title ? level + 1 : level;
    if (renderContext.isEditMode()) {
      return (
        <GalleryFrame title={title} bannerText={bannerText} level={level} isEmpty={false}>
          <VideoList currentNode={currentNode} headingLevel={itemLevel} />
        </GalleryFrame>
      );
    }
    const { videos, transcripts } = collectVideos(
      currentNode,
      renderContext,
      currentResource.getLocale().getLanguage(),
    );
    const width = Number(itemWidth);
    const style = {
      "--item-width": `${Number.isFinite(width) && width > 0 ? Math.min(width, 1200) : 250}px`,
    };
    return (
      <GalleryFrame
        title={title}
        bannerText={bannerText}
        level={level}
        isEmpty={videos.length === 0}
      >
        <div style={style as React.CSSProperties}>
          <Island component={VideoModal} props={{ videos, headingLevel: itemLevel }} />
        </div>
        <Transcripts transcripts={transcripts} level={itemLevel} />
      </GalleryFrame>
    );
  },
);
