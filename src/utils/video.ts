/**
 * Video utility functions shared across components
 */

/**
 * Extract the first frame from an animated GIF and convert to JPEG
 */
export const extractFirstFrameFromGif = async (gifUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(URL.createObjectURL(blob));
            } else {
              reject(new Error("Failed to create blob"));
            }
          },
          "image/jpeg",
          0.95,
        );
      } else {
        reject(new Error("Failed to get canvas context"));
      }
    };

    img.onerror = () => {
      // If extraction fails, return original URL
      resolve(gifUrl);
    };

    img.src = gifUrl;
  });
};

/**
 * Get embed URL for a video service
 */
export const getEmbedUrl = (
  service: string,
  videoId: string,
  options: { autoplay?: boolean; rel?: boolean } = {},
): string => {
  const { autoplay = false, rel = false } = options;
  const autoplayParam = autoplay ? "?autoplay=1" : "";
  const relParam = rel ? "" : "?rel=0";

  switch (service.toLowerCase()) {
    case "youtube":
      return `https://www.youtube.com/embed/${videoId}${autoplay ? "?autoplay=1" : relParam}`;
    case "vimeo":
      return `https://player.vimeo.com/video/${videoId}${autoplayParam}`;
    case "wistia":
      return `https://fast.wistia.net/embed/iframe/${videoId}${autoplayParam}`;
    case "dailymotion":
      return `https://www.dailymotion.com/embed/video/${videoId}${autoplayParam}`;
    case "storylane":
      return `https://jahia.storylane.io/demo/${videoId}?embed=inline`;
    default:
      return "";
  }
};

/**
 * Get thumbnail URL for a video service
 */
export const getServiceThumbnail = (service?: string, videoId?: string): string | undefined => {
  if (!service || !videoId) return undefined;

  switch (service.toLowerCase()) {
    case "youtube":
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    case "wistia":
      return `https://fast.wistia.com/embed/medias/${videoId}/swatch`;
    case "dailymotion":
      return `https://www.dailymotion.com/thumbnail/video/${videoId}`;
    case "storylane":
      // Storylane thumbnails should be fetched via oEmbed API
      return undefined;
    default:
      return undefined;
  }
};

/**
 * Fetch Storylane thumbnail via oEmbed API
 */
export const fetchStorylaneThumbnail = async (videoId: string): Promise<string | undefined> => {
  try {
    const response = await fetch(
      `https://api.storylane.io/oembed/meta?url=https://jahia.storylane.io/share/${videoId}`,
    );
    const data = await response.json();

    if (data?.thumbnail_url) {
      // Extract first frame from animated GIF
      try {
        return await extractFirstFrameFromGif(data.thumbnail_url);
      } catch {
        // Fallback to original GIF if extraction fails
        return data.thumbnail_url;
      }
    }
    return undefined;
  } catch {
    return undefined;
  }
};

/**
 * Load Storylane script dynamically
 */
export const loadStorylineScript = (): void => {
  const existingScript = document.querySelector(
    'script[src="https://js.storylane.io/js/v2/storylane.js"]',
  );

  if (existingScript) {
    return;
  }

  const script = document.createElement("script");
  script.src = "https://js.storylane.io/js/v2/storylane.js";
  script.async = true;
  document.body.appendChild(script);
};
