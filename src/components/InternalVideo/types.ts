export interface InternalVideoProps {
  "jcr:title"?: string;
  "video"?: any; // Can be JCR node (with getPath()) or object with {path, url, name}
  "videoPoster"?: any; // Can be JCR node or object with path
  "featured"?: boolean;
}
