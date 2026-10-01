/**
 * Server-side helpers that read JCR nodes for the views. They return plain values only, so the
 * result can be passed to an island.
 */
import { buildNodeUrl, getNodeProps, server } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { RenderContext, Resource } from "org.jahia.services.render";
import { isVideoService, parseVideoId, type VideoData } from "./video.js";

export interface ImageData {
  url: string;
  /** Text alternative: the image's title in the media library ("" when it has none). */
  title: string;
  description: string;
}

const isNode = (value: unknown): value is JCRNodeWrapper =>
  Boolean(value) && typeof (value as JCRNodeWrapper).getPath === "function";

const stringProperty = (node: JCRNodeWrapper, name: string): string => {
  try {
    return node.hasProperty(name) ? node.getProperty(name).getString() || "" : "";
  } catch {
    return "";
  }
};

/** URL of a referenced file node, registered as a cache dependency. */
export const fileUrl = (value: unknown, renderContext: RenderContext): string | undefined => {
  if (!isNode(value)) return undefined;
  server.render.addCacheDependency({ node: value }, renderContext);
  return buildNodeUrl(value);
};

/** MIME type of a file node, when it is a type a <video> or <track> element can declare. */
export const fileMimeType = (value: unknown): string | undefined => {
  if (!isNode(value)) return undefined;
  try {
    const type = value.getNode("jcr:content").getProperty("jcr:mimeType").getString();
    return /^[a-z]+\/[a-z0-9.+-]+$/i.test(type) ? type : undefined;
  } catch {
    return undefined;
  }
};

/** Images of a gallery: the image children of the chosen folder, or the picked images. */
export const collectImages = (
  props: { folder?: unknown; imagesList?: unknown },
  renderContext: RenderContext,
): ImageData[] => {
  const nodes: JCRNodeWrapper[] = [];
  if (isNode(props.folder)) {
    server.render.addCacheDependency({ node: props.folder }, renderContext);
    try {
      const iterator = props.folder.getNodes();
      while (iterator.hasNext()) {
        const child = iterator.nextNode() as JCRNodeWrapper;
        if (child.isNodeType("jmix:image")) nodes.push(child);
      }
    } catch {
      // An unreadable folder shows the empty state.
    }
  } else if (Array.isArray(props.imagesList)) {
    nodes.push(...props.imagesList.filter(isNode));
  }
  return nodes.map((node) => {
    server.render.addCacheDependency({ node }, renderContext);
    return {
      url: buildNodeUrl(node),
      title: stringProperty(node, "jcr:title").trim(),
      description: stringProperty(node, "jcr:description").trim(),
    };
  });
};

/** Heading level asked by the parent view (Render parameter `headingLevel`), else `fallback`. */
export const headingLevel = (currentResource: Resource, fallback: number): number => {
  try {
    const value = Number(String(currentResource.getModuleParams().get("headingLevel")));
    if (Number.isInteger(value) && value >= 2 && value <= 6) return value;
  } catch {
    // No parameter.
  }
  return fallback;
};

/** Heading element name for a level. */
export const headingTag = (level: number) =>
  `h${Math.min(6, Math.max(2, level))}` as "h2" | "h3" | "h4" | "h5" | "h6";

const SAFE_LINK = /^(?:https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i;

export interface ResolvedLink {
  href: string;
  newWindow: boolean;
}

/** Link of the seumix:linkTo mixin (internal page or external address). */
export const resolveLink = (
  props: Record<string, unknown>,
  renderContext: RenderContext,
): ResolvedLink | undefined => {
  const type = props["seu:linkType"];
  let href: string | undefined;
  if (type === "internalLink" && isNode(props["seu:internalLink"])) {
    server.render.addCacheDependency({ node: props["seu:internalLink"] }, renderContext);
    href = buildNodeUrl(props["seu:internalLink"]);
  } else if (type === "externalLink" && typeof props["seu:externalLink"] === "string") {
    const value = props["seu:externalLink"].trim();
    href = SAFE_LINK.test(value) ? value : undefined;
  }
  return href ? { href, newWindow: props["seu:linkTarget"] === "_blank" } : undefined;
};

const VIDEO_PROPS = [
  "jcr:title",
  "videoDesc",
  "video",
  "videoPoster",
  "videoService",
  "videoId",
  "captions",
  "featured",
];

/** Video data of an internal or external video node. Returns undefined for other nodes. */
export const videoData = (
  node: JCRNodeWrapper,
  renderContext: RenderContext,
  locale: string,
): VideoData | undefined => {
  const isExternal = node.isNodeType("jsmediagallerynt:externalVideo");
  if (!isExternal && !node.isNodeType("jsmediagallerynt:internalVideo")) return undefined;
  const props = getNodeProps(node, VIDEO_PROPS) as Record<string, unknown>;
  const data: VideoData = {
    id: node.getIdentifier(),
    title: typeof props["jcr:title"] === "string" ? props["jcr:title"] : "",
    description: typeof props.videoDesc === "string" ? props.videoDesc : "",
    isExternal,
    posterUrl: fileUrl(props.videoPoster, renderContext),
    featured: props.featured === true || props.featured === "true",
  };
  if (isExternal) {
    const service = isVideoService(props.videoService) ? props.videoService : "youtube";
    const videoId = parseVideoId(service, props.videoId);
    if (videoId) {
      data.videoService = service;
      data.videoId = videoId;
    }
  } else {
    data.videoUrl = fileUrl(props.video, renderContext);
    data.mimeType = fileMimeType(props.video);
    data.captionsUrl = fileUrl(props.captions, renderContext);
    if (data.captionsUrl) data.captionsLang = locale;
  }
  return data;
};
