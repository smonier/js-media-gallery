import { getChildNodes, getNodeProps } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { RenderContext } from "org.jahia.services.render";
import { videoData } from "../../utils/jcr.js";
import type { VideoData } from "../../utils/video.js";

export interface GalleryVideos {
  videos: VideoData[];
  /** Transcripts, rendered by the server view next to the island. */
  transcripts: { id: string; title: string; html: string }[];
}

/** Videos of a gallery that can be played, in the editor's order. */
export const collectVideos = (
  currentNode: JCRNodeWrapper,
  renderContext: RenderContext,
  locale: string,
): GalleryVideos => {
  const videos: VideoData[] = [];
  const transcripts: GalleryVideos["transcripts"] = [];
  for (const child of getChildNodes(currentNode, -1, 0)) {
    const video = videoData(child, renderContext, locale);
    if (!video) continue;
    if (video.isExternal ? !(video.videoService && video.videoId) : !video.videoUrl) continue;
    videos.push(video);
    const { transcript } = getNodeProps(child, ["transcript"]) as { transcript?: unknown };
    if (typeof transcript === "string" && transcript.trim()) {
      transcripts.push({ id: video.id, title: video.title, html: transcript });
    }
  }
  return { videos, transcripts };
};
