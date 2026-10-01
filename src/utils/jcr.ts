/**
 * Server-side helpers that read JCR nodes for the views. They return plain values only, so the
 * result can be passed to an island.
 */
import { buildNodeUrl, getNodeProps, server } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { RenderContext, Resource } from "org.jahia.services.render";
import { parseVideo, toVideoService, type VideoData } from "./video.js";

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

/**
 * Link of the jsmediagallerymix:linkTo mixin, Jahia's native link type: "internal" points at a
 * node (j:linknode), "external" at an address (j:url), both set per language. No link when the
 * current language has no target.
 */
export const resolveLink = (
  props: Record<string, unknown>,
  renderContext: RenderContext,
): ResolvedLink | undefined => {
  const type = props["j:linkType"];
  let href: string | undefined;
  if (type === "internal" && isNode(props["j:linknode"])) {
    server.render.addCacheDependency({ node: props["j:linknode"] }, renderContext);
    href = buildNodeUrl(props["j:linknode"]);
  } else if (type === "external" && typeof props["j:url"] === "string") {
    const value = props["j:url"].trim();
    href = SAFE_LINK.test(value) ? value : undefined;
  }
  const newWindow = props["openInNewTab"] === true || props["openInNewTab"] === "true";
  return href ? { href, newWindow } : undefined;
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
    // A missing or unknown provider reads as YouTube, the default of the field.
    const service = toVideoService(props.videoService) ?? "youtube";
    const parsed = parseVideo(service, props.videoId);
    if (parsed) {
      data.videoService = service;
      data.videoId = parsed.id;
      if (parsed.hash) data.videoHash = parsed.hash;
    }
  } else {
    data.videoUrl = fileUrl(props.video, renderContext);
    data.mimeType = fileMimeType(props.video);
    data.captionsUrl = fileUrl(props.captions, renderContext);
    if (data.captionsUrl) data.captionsLang = locale;
  }
  return data;
};
