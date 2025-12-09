export interface ExternalVideoProps {
  "jcr:title"?: string;
  "videoDesc"?: string;
  "videoService": "youtube" | "vimeo" | "wistia" | "dailymotion" | "storylane";
  "videoId"?: string;
  "videoPoster"?: any; // Can be JCR node or object with path
  "featured"?: boolean;
}
