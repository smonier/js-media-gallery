import { describe, expect, it } from "vitest";
import {
  fallbackHref,
  getEmbedUrl,
  getServiceThumbnail,
  getWatchUrl,
  parseVideo,
  parseVideoId,
  toVideoService,
} from "./video.js";

describe("parseVideoId - identifiers", () => {
  it("accepts an identifier in each provider's format", () => {
    expect(parseVideoId("youtube", "M7lc1UVf-VE")).toBe("M7lc1UVf-VE");
    expect(parseVideoId("vimeo", "76979871")).toBe("76979871");
    expect(parseVideoId("wistia", "e4a27b971d")).toBe("e4a27b971d");
    expect(parseVideoId("dailymotion", "x8abcd1")).toBe("x8abcd1");
    expect(parseVideoId("storylane", "abcd1234ef")).toBe("abcd1234ef");
  });

  it("trims what the editor typed", () => {
    expect(parseVideoId("youtube", "  M7lc1UVf-VE \n")).toBe("M7lc1UVf-VE");
  });

  it("refuses identifiers in the wrong format", () => {
    expect(parseVideoId("youtube", "short")).toBeUndefined();
    expect(parseVideoId("vimeo", "abc")).toBeUndefined();
    expect(parseVideoId("wistia", "E4A27B971D")).toBeUndefined();
    expect(parseVideoId("youtube", '"><img src=x>')).toBeUndefined();
  });

  it("refuses unknown providers and values that are not text", () => {
    expect(parseVideoId("myspace", "M7lc1UVf-VE")).toBeUndefined();
    expect(parseVideoId(undefined, "M7lc1UVf-VE")).toBeUndefined();
    expect(parseVideoId("youtube", undefined)).toBeUndefined();
    expect(parseVideoId("youtube", 42)).toBeUndefined();
    expect(parseVideoId("youtube", "")).toBeUndefined();
  });
});

describe("parseVideoId - addresses", () => {
  it("reads YouTube addresses", () => {
    for (const url of [
      "https://www.youtube.com/watch?v=M7lc1UVf-VE",
      "https://www.youtube.com/watch?feature=share&v=M7lc1UVf-VE",
      "https://m.youtube.com/watch?v=M7lc1UVf-VE",
      "https://youtu.be/M7lc1UVf-VE",
      "https://youtu.be/M7lc1UVf-VE?t=42",
      "https://www.youtube.com/embed/M7lc1UVf-VE",
      "https://www.youtube.com/shorts/M7lc1UVf-VE",
      "https://www.youtube.com/live/M7lc1UVf-VE",
      "https://www.youtube-nocookie.com/embed/M7lc1UVf-VE",
      "http://youtube.com/v/M7lc1UVf-VE",
    ]) {
      expect(parseVideoId("youtube", url), url).toBe("M7lc1UVf-VE");
    }
    expect(parseVideoId("youtube", "https://www.youtube.com/channel/UCabc")).toBeUndefined();
  });

  it("reads Vimeo addresses", () => {
    for (const url of [
      "https://vimeo.com/76979871",
      "https://www.vimeo.com/76979871",
      "https://player.vimeo.com/video/76979871",
      "https://player.vimeo.com/video/76979871?autoplay=1",
      "https://vimeo.com/channels/staffpicks/76979871",
      "https://vimeo.com/showcase/1234567/video/76979871",
      "https://vimeo.com/groups/name/videos/76979871",
    ]) {
      expect(parseVideoId("vimeo", url), url).toBe("76979871");
    }
  });

  it("reads unlisted Vimeo addresses with their key", () => {
    expect(parseVideo("vimeo", "https://vimeo.com/76979871/8272103f6e")).toEqual({
      id: "76979871",
      hash: "8272103f6e",
    });
    expect(parseVideo("vimeo", "https://player.vimeo.com/video/76979871?h=8272103f6e")).toEqual({
      id: "76979871",
      hash: "8272103f6e",
    });
    expect(
      parseVideo("vimeo", "https://player.vimeo.com/video/76979871?badge=0&h=8272103f6e"),
    ).toEqual({ id: "76979871", hash: "8272103f6e" });
    // A key that is not hexadecimal is ignored, the video id stays.
    expect(parseVideo("vimeo", "https://player.vimeo.com/video/76979871?h=x%22y")).toEqual({
      id: "76979871",
    });
    expect(parseVideo("vimeo", "https://vimeo.com/76979871")).toEqual({ id: "76979871" });
  });

  it("reads Wistia addresses, account media pages included", () => {
    for (const url of [
      "https://fast.wistia.net/embed/iframe/e4a27b971d",
      "https://fast.wistia.com/embed/iframe/e4a27b971d",
      "https://jahia.wistia.com/medias/e4a27b971d",
      "https://my-team.wistia.com/medias/e4a27b971d?wtime=10",
    ]) {
      expect(parseVideoId("wistia", url), url).toBe("e4a27b971d");
    }
    expect(parseVideoId("wistia", "https://jahia.wistia.com/projects/e4a27b971d")).toBeUndefined();
    expect(
      parseVideoId("wistia", "https://wistia.com.example.org/medias/e4a27b971d"),
    ).toBeUndefined();
    expect(parseVideoId("wistia", "https://a.b.wistia.com/medias/e4a27b971d")).toBeUndefined();
    expect(parseVideoId("wistia", "https://-bad.wistia.com/medias/e4a27b971d")).toBeUndefined();
  });

  it("reads Dailymotion addresses", () => {
    for (const url of [
      "https://www.dailymotion.com/video/x8abcd1",
      "https://dailymotion.com/video/x8abcd1",
      "https://dai.ly/x8abcd1",
      "https://geo.dailymotion.com/player.html?video=x8abcd1",
      "https://www.dailymotion.com/embed/video/x8abcd1",
    ]) {
      expect(parseVideoId("dailymotion", url), url).toBe("x8abcd1");
    }
  });

  it("reads Storylane addresses", () => {
    expect(parseVideoId("storylane", "https://app.storylane.io/share/abcd1234ef")).toBe(
      "abcd1234ef",
    );
    expect(parseVideoId("storylane", "https://jahia.storylane.io/demo/abcd1234ef")).toBe(
      "abcd1234ef",
    );
  });

  it("refuses other hosts, look-alike hosts and other schemes", () => {
    for (const [service, url] of [
      ["youtube", "https://youtube.com.example.org/watch?v=M7lc1UVf-VE"],
      ["youtube", "https://example.org/watch?v=M7lc1UVf-VE"],
      ["youtube", "javascript:alert(1)//youtu.be/M7lc1UVf-VE"],
      ["youtube", "ftp://youtu.be/M7lc1UVf-VE"],
      ["youtube", "//youtu.be/M7lc1UVf-VE"],
      ["youtube", "data:text/html,M7lc1UVf-VE"],
      ["vimeo", "https://vimeo.com.example.org/76979871"],
      ["vimeo", "https://evilvimeo.com/76979871"],
      ["wistia", "https://wistia.net/medias/e4a27b971d"],
      ["wistia", "https://fast.wistia.net.example.org/embed/iframe/e4a27b971d"],
      ["dailymotion", "https://dailymotion.example.org/video/x8abcd1"],
      ["storylane", "https://storylane.io.example.org/share/abcd1234ef"],
    ]) {
      expect(parseVideoId(service, url), url).toBeUndefined();
    }
  });

  it("does not read one provider's address as another provider's", () => {
    expect(parseVideoId("vimeo", "https://youtu.be/M7lc1UVf-VE")).toBeUndefined();
    expect(parseVideoId("youtube", "https://vimeo.com/76979871")).toBeUndefined();
  });
});

describe("toVideoService", () => {
  it("reads stored providers without case or surrounding spaces", () => {
    expect(toVideoService("youtube")).toBe("youtube");
    expect(toVideoService("YouTube")).toBe("youtube");
    expect(toVideoService(" Vimeo ")).toBe("vimeo");
    expect(toVideoService("other")).toBeUndefined();
    expect(toVideoService(undefined)).toBeUndefined();
    expect(parseVideoId("YouTube", "M7lc1UVf-VE")).toBe("M7lc1UVf-VE");
  });
});

describe("player, page and thumbnail addresses", () => {
  it("builds player addresses, autoplay only on request", () => {
    expect(getEmbedUrl("youtube", "M7lc1UVf-VE")).toBe(
      "https://www.youtube-nocookie.com/embed/M7lc1UVf-VE?rel=0&autoplay=0",
    );
    expect(getEmbedUrl("vimeo", "76979871", { autoplay: true })).toBe(
      "https://player.vimeo.com/video/76979871?autoplay=1",
    );
    expect(getEmbedUrl("wistia", "e4a27b971d", { autoplay: true })).toBe(
      "https://fast.wistia.net/embed/iframe/e4a27b971d?autoPlay=true",
    );
    expect(getEmbedUrl("dailymotion", "x8abcd1")).toBe(
      "https://www.dailymotion.com/embed/video/x8abcd1?autoplay=0",
    );
    expect(getEmbedUrl("storylane", "abcd1234ef")).toBe(
      "https://jahia.storylane.io/demo/abcd1234ef?embed=inline",
    );
  });

  it("carries the key of an unlisted Vimeo video to the player and the page", () => {
    expect(getEmbedUrl("vimeo", "76979871", { hash: "8272103f6e" })).toBe(
      "https://player.vimeo.com/video/76979871?h=8272103f6e&autoplay=0",
    );
    expect(getWatchUrl("vimeo", "76979871", "8272103f6e")).toBe(
      "https://vimeo.com/76979871/8272103f6e",
    );
    // Only for Vimeo, and only in the expected format.
    expect(getEmbedUrl("youtube", "M7lc1UVf-VE", { hash: "8272103f6e" })).not.toContain("h=");
    expect(getEmbedUrl("vimeo", "76979871", { hash: "x&y=1" })).toBe(
      "https://player.vimeo.com/video/76979871?autoplay=0",
    );
  });

  it("builds nothing from an identifier in the wrong format", () => {
    expect(getEmbedUrl("youtube", "../../x")).toBe("");
    expect(getWatchUrl("vimeo", "abc")).toBe("");
    expect(getServiceThumbnail("youtube", "../x")).toBeUndefined();
  });

  it("knows the thumbnails that need no request", () => {
    expect(getServiceThumbnail("youtube", "M7lc1UVf-VE")).toBe(
      "https://i.ytimg.com/vi/M7lc1UVf-VE/hqdefault.jpg",
    );
    expect(getServiceThumbnail("vimeo", "76979871")).toBeUndefined();
    expect(getServiceThumbnail(undefined, undefined)).toBeUndefined();
  });

  it("links the play control to the provider's page, or to the file", () => {
    const base = { id: "n", title: "t" };
    expect(
      fallbackHref({
        ...base,
        isExternal: true,
        videoService: "vimeo",
        videoId: "76979871",
        videoHash: "8272103f6e",
      }),
    ).toBe("https://vimeo.com/76979871/8272103f6e");
    expect(fallbackHref({ ...base, isExternal: true })).toBeUndefined();
    expect(fallbackHref({ ...base, isExternal: false, videoUrl: "/files/a.mp4" })).toBe(
      "/files/a.mp4",
    );
  });
});
