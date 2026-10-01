export interface InternalVideoProps {
  "jcr:title"?: string;
  "videoDesc"?: string;
  /** Video file node. */
  "video"?: unknown;
  /** Poster image node. */
  "videoPoster"?: unknown;
  /** WebVTT captions file node. */
  "captions"?: unknown;
  "transcript"?: string;
  "featured"?: boolean;
}
