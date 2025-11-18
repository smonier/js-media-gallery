export interface InternalVideoProps {
  "jcr:title"?: string;
  video?: {
    url: string;
    path: string;
    name?: string;
  };
  videoPoster?: {
    url: string;
    path: string;
  };
  featured?: boolean;
}
