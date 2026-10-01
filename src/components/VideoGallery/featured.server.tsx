import { Island, jahiaComponent } from "@jahia/javascript-modules-library";
import { headingLevel } from "../../utils/jcr.js";
import { collectVideos } from "./collect.js";
import GalleryFrame from "./GalleryFrame.js";
import FeaturedGallery from "./FeaturedGallery.island.client.js";
import Transcripts from "./Transcripts.js";
import type { VideoGalleryProps } from "./types.js";

export default jahiaComponent(
  {
    componentType: "view",
    nodeType: "jsmediagallerynt:videoGallery",
    name: "featured",
    displayName: "Featured + Grid",
  },
  (props: VideoGalleryProps, { currentNode, currentResource, renderContext }) => {
    const { "jcr:title": title, bannerText } = props;
    const level = headingLevel(currentResource, 2);
    const itemLevel = title ? level + 1 : level;
    const { videos, transcripts } = collectVideos(
      currentNode,
      renderContext,
      currentResource.getLocale().getLanguage(),
    );
    // Featured videos first, then the others, each group in the editor's order.
    const sorted = [
      ...videos.filter((video) => video.featured),
      ...videos.filter((video) => !video.featured),
    ];
    return (
      <GalleryFrame
        title={title}
        bannerText={bannerText}
        level={level}
        isEmpty={sorted.length === 0}
      >
        <Island component={FeaturedGallery} props={{ videos: sorted, headingLevel: itemLevel }} />
        <Transcripts transcripts={transcripts} level={itemLevel + 1} />
      </GalleryFrame>
    );
  },
);
