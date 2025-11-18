export interface VideoHeadingProps {
  "jcr:title"?: string;
  "video"?: any; // Can be JCR node (with getPath()) or object with {path, url, name}
  "caption"?: string;
  "linkUrl"?: string;
  "linkText"?: string;
}
