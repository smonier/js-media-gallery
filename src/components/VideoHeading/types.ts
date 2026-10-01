export interface VideoHeadingProps {
  "jcr:title"?: string;
  /** Background video file node. */
  "video"?: unknown;
  /** Poster image node. */
  "videoPoster"?: unknown;
  "caption"?: string;
  "ctaLabel"?: string;
  /** seumix:linkTo */
  "seu:linkType"?: string;
  "seu:linkTarget"?: string;
  "seu:internalLink"?: unknown;
  "seu:externalLink"?: string;
}
