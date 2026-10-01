export interface ImageGalleryProps {
  "jcr:title"?: string;
  "bannerText"?: string;
  "imgGalleryType"?: "imgDirectory" | "imgFile";
  /** Folder node (jsmediagallerymix:directoryLink). */
  "folder"?: unknown;
  /** Image nodes (jsmediagallerymix:imagesLink). */
  "imagesList"?: unknown[];
}
