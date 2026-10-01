import i18next from "i18next";
import { describe, expect, it } from "vitest";
import { textValues } from "./i18n.js";

describe("textValues", () => {
  it("interpolates titles as they are, for React to encode once", async () => {
    // Same options as the engine: no interpolation settings, so values are HTML-encoded by default.
    const i18n = i18next.createInstance();
    await i18n.init({
      lng: "fr",
      resources: { fr: { translation: { play: "Lire la vidéo : {{title}}" } } },
    });
    const title = "L'équipe R&D / Q&A <1>";
    expect(i18n.t("play", { title })).not.toContain(title);
    expect(i18n.t("play", textValues({ title }))).toBe(`Lire la vidéo : ${title}`);
  });

  it("keeps the other values", () => {
    expect(textValues({ title: "a", count: 2 })).toEqual({
      title: "a",
      count: 2,
      interpolation: { escapeValue: false },
    });
  });
});
