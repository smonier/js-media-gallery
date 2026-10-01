import { useEffect, useState } from "react";
import { getServiceThumbnail, resolveThumbnail, type VideoData } from "./video.js";

/**
 * Thumbnail of a video: the editor's poster, else the provider's thumbnail. Addresses known
 * without a request are used from the first render (so the server renders them too); Vimeo and
 * Storylane are asked once the island runs.
 */
export default function useThumbnail(video: VideoData | undefined): string | undefined {
  const initial = video?.posterUrl || getServiceThumbnail(video?.videoService, video?.videoId);
  const [thumbnail, setThumbnail] = useState<string | undefined>(initial);

  useEffect(() => {
    if (!video || initial) return;
    let active = true;
    resolveThumbnail(video.videoService, video.videoId, video.videoHash).then((url) => {
      if (active && url) setThumbnail(url);
    });
    return () => {
      active = false;
    };
  }, [video, initial]);

  return thumbnail;
}
