export interface VideoItem {
  uuid: string;
  "jcr:title"?: string;
  nodeType: string;
  featured?: boolean;
  // Internal video
  video?: {
    url: string;
    path: string;
  };
  // External video
  videoService?: "youtube" | "vimeo" | "wistia" | "dailymotion";
  videoId?: string;
  // Common
  videoPoster?: {
    url: string;
    path: string;
  };
}

export interface VideoGalleryProps {
  "jcr:title"?: string;
  bannerText?: string;
  itemWidth?: number;
  videos?: VideoItem[];
}

export interface VideoPlayerProps {
  video: VideoItem;
  autoplay?: boolean;
  controls?: boolean;
}
