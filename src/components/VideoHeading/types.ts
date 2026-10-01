export interface VideoHeadingProps {
  "jcr:title"?: string;
  /** Background video file node. */
  "video"?: unknown;
  /** Poster image node. */
  "videoPoster"?: unknown;
  "caption"?: string;
  "ctaLabel"?: string;
  /** jsmediagallerymix:linkTo: Jahia's link type; the target in j:linknode or j:url (per language). */
  "j:linkType"?: "none" | "internal" | "external";
  "j:linknode"?: unknown;
  "j:url"?: string;
  "openInNewTab"?: boolean | string;
}
