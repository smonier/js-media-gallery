export interface ExternalVideoProps {
  "jcr:title"?: string;
  "videoService": "youtube" | "vimeo" | "wistia" | "dailymotion";
  "videoId"?: string;
  "videoPoster"?: any; // Can be JCR node or object with path
  "featured"?: boolean;
}
