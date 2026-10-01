/**
 * Video provider helpers shared by the server views and the client islands.
 *
 * A provider URL is only ever built from a provider of the list below and from an identifier that
 * matches that provider's identifier format. Editors may type the identifier or paste the address
 * of the video: the identifier is read from the address of a known host only.
 */

export const VIDEO_SERVICES = ["youtube", "vimeo", "wistia", "dailymotion", "storylane"] as const;
export type VideoService = (typeof VIDEO_SERVICES)[number];

/** Serializable description of a video, passed from the server views to the islands. */
export interface VideoData {
  id: string;
  title: string;
  description?: string;
  isExternal: boolean;
  /** Internal video: file URL, MIME type, poster and captions track (all built server-side). */
  videoUrl?: string;
  mimeType?: string;
  captionsUrl?: string;
  captionsLang?: string;
  /** External video: validated provider and identifier. */
  videoService?: VideoService;
  videoId?: string;
  posterUrl?: string;
  featured?: boolean;
}

const ID_FORMATS: Record<VideoService, RegExp> = {
  youtube: /^[A-Za-z0-9_-]{11}$/,
  vimeo: /^\d{1,12}$/,
  wistia: /^[a-z0-9]{10}$/,
  dailymotion: /^[a-zA-Z0-9]{5,12}$/,
  storylane: /^[a-z0-9]{8,20}$/,
};

const HOSTS: Record<VideoService, string[]> = {
  youtube: [
    "youtube.com",
    "www.youtube.com",
    "m.youtube.com",
    "youtu.be",
    "www.youtube-nocookie.com",
  ],
  vimeo: ["vimeo.com", "www.vimeo.com", "player.vimeo.com"],
  wistia: ["fast.wistia.net", "fast.wistia.com"],
  dailymotion: ["www.dailymotion.com", "dailymotion.com", "dai.ly", "geo.dailymotion.com"],
  storylane: ["app.storylane.io", "jahia.storylane.io"],
};

export const isVideoService = (value: unknown): value is VideoService =>
  typeof value === "string" && (VIDEO_SERVICES as readonly string[]).includes(value);

/** Splits an http(s) address into host, path segments and query parameters. No URL API: the
 * server renderer (GraalJS) has none. */
const splitUrl = (raw: string) => {
  const match = /^https?:\/\/([^/?#\s]{1,253})([^?#\s]*)(?:\?([^#\s]*))?/i.exec(raw);
  if (!match) return undefined;
  const host = match[1].toLowerCase().replace(/:\d+$/, "");
  const segments = match[2].split("/").filter(Boolean);
  const query = new Map<string, string>();
  for (const pair of (match[3] ?? "").split("&")) {
    const [key, value = ""] = pair.split("=");
    if (key && !query.has(key)) query.set(key, value);
  }
  return { host, segments, query };
};

/** Reads the candidate identifier from a pasted address of a known host of the provider. */
const idFromUrl = (service: VideoService, raw: string): string | undefined => {
  const url = splitUrl(raw);
  if (!url || !HOSTS[service].includes(url.host)) return undefined;
  const { host, segments, query } = url;
  const last = segments[segments.length - 1];
  switch (service) {
    case "youtube":
      if (host === "youtu.be") return segments[0];
      if (query.get("v")) return query.get("v");
      return ["embed", "shorts", "live", "v"].includes(segments[0] ?? "") ? segments[1] : undefined;
    case "dailymotion":
      if (host === "dai.ly") return segments[0];
      return query.get("video") ?? last;
    default:
      return last;
  }
};

/**
 * Returns the identifier of the video when `raw` is a valid identifier of `service`, or the
 * address of one of its videos. Returns undefined for anything else.
 */
export const parseVideoId = (service: unknown, raw: unknown): string | undefined => {
  if (!isVideoService(service) || typeof raw !== "string") return undefined;
  const value = raw.trim();
  if (!value) return undefined;
  const candidate = ID_FORMATS[service].test(value) ? value : idFromUrl(service, value);
  return candidate && ID_FORMATS[service].test(candidate) ? candidate : undefined;
};

/** Provider name shown to visitors (iframe titles, link names). */
export const SERVICE_NAMES: Record<VideoService, string> = {
  youtube: "YouTube",
  vimeo: "Vimeo",
  wistia: "Wistia",
  dailymotion: "Dailymotion",
  storylane: "Storylane",
};

/**
 * Player URL. `service` and `videoId` must come from parseVideoId. Autoplay is only requested
 * after a visitor action (a click on the play control).
 */
export const getEmbedUrl = (
  service: VideoService,
  videoId: string,
  options: { autoplay?: boolean } = {},
): string => {
  if (!ID_FORMATS[service]?.test(videoId)) return "";
  const id = encodeURIComponent(videoId);
  const autoplay = options.autoplay ? "1" : "0";
  switch (service) {
    case "youtube":
      return `https://www.youtube-nocookie.com/embed/${id}?rel=0&autoplay=${autoplay}`;
    case "vimeo":
      return `https://player.vimeo.com/video/${id}?autoplay=${autoplay}`;
    case "wistia":
      return `https://fast.wistia.net/embed/iframe/${id}?autoPlay=${options.autoplay ? "true" : "false"}`;
    case "dailymotion":
      return `https://www.dailymotion.com/embed/video/${id}?autoplay=${autoplay}`;
    case "storylane":
      return `https://jahia.storylane.io/demo/${id}?embed=inline`;
  }
};

/** Address of the video on the provider's site: the target of the play link without JavaScript. */
export const getWatchUrl = (service: VideoService, videoId: string): string => {
  if (!ID_FORMATS[service]?.test(videoId)) return "";
  const id = encodeURIComponent(videoId);
  switch (service) {
    case "youtube":
      return `https://www.youtube.com/watch?v=${id}`;
    case "vimeo":
      return `https://vimeo.com/${id}`;
    case "wistia":
      return `https://fast.wistia.net/embed/iframe/${id}`;
    case "dailymotion":
      return `https://www.dailymotion.com/video/${id}`;
    case "storylane":
      return `https://jahia.storylane.io/share/${id}`;
  }
};

/** Thumbnail whose address is known without a request. */
export const getServiceThumbnail = (
  service?: VideoService,
  videoId?: string,
): string | undefined => {
  if (!service || !videoId || !ID_FORMATS[service]?.test(videoId)) return undefined;
  const id = encodeURIComponent(videoId);
  switch (service) {
    case "youtube":
      return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    case "wistia":
      return `https://fast.wistia.com/embed/medias/${id}/swatch`;
    case "dailymotion":
      return `https://www.dailymotion.com/thumbnail/video/${id}`;
    default:
      return undefined;
  }
};

const FETCH_TIMEOUT_MS = 5000;

/** Fetches JSON with a time limit; resolves to undefined on any failure. Browser only. */
const fetchJson = async (url: string): Promise<unknown> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      credentials: "omit",
      referrerPolicy: "strict-origin-when-cross-origin",
    });
    if (!response.ok) return undefined;
    return await response.json();
  } catch {
    return undefined;
  } finally {
    clearTimeout(timer);
  }
};

/** Keeps a thumbnail address only when it is an https URL. */
const httpsUrl = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : undefined;
  } catch {
    return undefined;
  }
};

/**
 * Extract the first frame from an animated GIF and convert it to a JPEG object URL, so that the
 * thumbnail does not move. Resolves to the original URL when the frame cannot be read.
 */
export const extractFirstFrameFromGif = async (gifUrl: string): Promise<string> =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(gifUrl);
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => resolve(blob ? URL.createObjectURL(blob) : gifUrl),
          "image/jpeg",
          0.95,
        );
      } catch {
        resolve(gifUrl);
      }
    };
    img.onerror = () => resolve(gifUrl);
    img.src = gifUrl;
  });

/** Thumbnail of a Vimeo video (public oEmbed-style API). Browser only. */
export const fetchVimeoThumbnail = async (videoId: string): Promise<string | undefined> => {
  if (!ID_FORMATS.vimeo.test(videoId)) return undefined;
  const data = await fetchJson(
    `https://vimeo.com/api/v2/video/${encodeURIComponent(videoId)}.json`,
  );
  return Array.isArray(data) ? httpsUrl(data[0]?.thumbnail_large) : undefined;
};

/** Thumbnail of a Storylane demo (oEmbed metadata), first frame only. Browser only. */
export const fetchStorylaneThumbnail = async (videoId: string): Promise<string | undefined> => {
  if (!ID_FORMATS.storylane.test(videoId)) return undefined;
  const share = `https://jahia.storylane.io/share/${encodeURIComponent(videoId)}`;
  const data = await fetchJson(
    `https://api.storylane.io/oembed/meta?url=${encodeURIComponent(share)}`,
  );
  const thumbnail =
    data && typeof data === "object"
      ? httpsUrl((data as { thumbnail_url?: unknown }).thumbnail_url)
      : undefined;
  return thumbnail ? extractFirstFrameFromGif(thumbnail) : undefined;
};

/** Thumbnail of any provider: the known address, or the one its API returns. Browser only. */
export const resolveThumbnail = async (
  service?: VideoService,
  videoId?: string,
): Promise<string | undefined> => {
  if (!service || !videoId) return undefined;
  if (service === "vimeo") return fetchVimeoThumbnail(videoId);
  if (service === "storylane") return fetchStorylaneThumbnail(videoId);
  return getServiceThumbnail(service, videoId);
};

/** Target of a play link when JavaScript does not run: the provider's page, or the file. */
export const fallbackHref = (video: VideoData): string | undefined =>
  video.isExternal
    ? video.videoService && video.videoId
      ? getWatchUrl(video.videoService, video.videoId)
      : undefined
    : video.videoUrl;
