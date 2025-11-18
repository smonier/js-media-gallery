export interface ImageGalleryProps {
  "jcr:title"?: string;
  "bannerText"?: string;
  "imgGalleryType"?: "imgDirectory" | "imgFile";
  "folder"?: {
    uuid: string;
    path: string;
  };
  "imagesList"?: Array<{
    "uuid": string;
    "url": string;
    "name": string;
    "path"?: string;
    "width"?: number;
    "height"?: number;
    "jcr:title"?: string;
    "jcr:description"?: string;
  }>;
}

export interface GalleryImage {
  uuid: string;
  url: string;
  name: string;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
}
