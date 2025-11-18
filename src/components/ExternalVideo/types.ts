export interface ExternalVideoProps {
  "jcr:title"?: string;
  videoService: "youtube" | "vimeo" | "wistia" | "dailymotion";
  videoId?: string;
  videoPoster?: {
    url: string;
    path: string;
  };
  featured?: boolean;
}
