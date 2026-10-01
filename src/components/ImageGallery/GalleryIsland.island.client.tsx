import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ImageData } from "../../utils/jcr.js";
import ui from "../../utils/ui.module.css";
import ImageViewer, { imageAlt } from "./ImageViewer.js";
import classes from "./ImageGallery.module.css";

interface GalleryIslandProps {
  images: ImageData[];
  title?: string;
}

/** Thumbnails shown under the main image; the others are reached with the "more" button. */
const THUMBNAILS = 4;

/**
 * A main image with a row of thumbnails. A thumbnail shows its image as the main one; the main
 * image is a link to the full-size file (no JavaScript needed) that opens the viewer. The same
 * thumbnails are rendered on the server and in the browser, so hydration changes nothing on
 * screen; the row wraps on narrow screens (CSS). Only the "more" button, which needs JavaScript,
 * appears after hydration.
 */
export default function GalleryIsland({ images, title }: GalleryIslandProps) {
  const { t } = useTranslation("js-media-gallery");
  const [current, setCurrent] = useState(0);
  const [viewer, setViewer] = useState<number | null>(null);
  const [opener, setOpener] = useState<HTMLElement | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const total = images.length;

  useEffect(() => setHydrated(true), []);

  const open = (index: number, element: HTMLElement) => {
    setOpener(element);
    setViewer(index);
  };

  const main = images[current] ?? images[0];
  if (!main) return null;
  // One slot per thumbnail, plus one for "more" when some images are left out.
  const shown = total > THUMBNAILS + 1 ? images.slice(0, THUMBNAILS) : images;
  const hidden = total - shown.length;

  return (
    <>
      <div className={classes.galleryView}>
        <div className={classes.galleryMain}>
          <a
            href={main.url}
            className={`${ui.control} ${classes.galleryMainLink}`}
            onClick={(event) => {
              event.preventDefault();
              open(current, event.currentTarget);
            }}
          >
            <img
              src={main.url}
              alt={imageAlt(main, current, total, t)}
              className={classes.galleryMainImage}
            />
            <span className={ui.visuallyHidden}> ({t("mediaGallery.image.viewFullSize")})</span>
          </a>
        </div>

        {total > 1 && (
          <ul className={classes.galleryThumbnails}>
            {shown.map((image, index) => (
              <li key={`${image.url}-${index}`} className={classes.galleryThumb}>
                <button
                  type="button"
                  className={`${ui.control} ${classes.galleryThumbButton}`}
                  onClick={() => setCurrent(index)}
                  aria-pressed={index === current}
                >
                  <img
                    src={image.url}
                    alt={imageAlt(image, index, total, t)}
                    className={classes.galleryThumbImage}
                  />
                </button>
              </li>
            ))}
            {hydrated && hidden > 0 && (
              <li className={`${classes.galleryThumb} ${classes.galleryThumbFadeIn}`}>
                <button
                  type="button"
                  className={`${ui.control} ${classes.galleryThumbButton} ${classes.galleryThumbMore}`}
                  onClick={(event) => open(shown.length, event.currentTarget)}
                >
                  <span className={classes.galleryMoreCount} aria-hidden="true">
                    +{hidden}
                  </span>
                  <span className={ui.visuallyHidden}>
                    {t("mediaGallery.image.more", { count: hidden })}
                  </span>
                </button>
              </li>
            )}
          </ul>
        )}
      </div>

      <ImageViewer
        images={images}
        index={viewer}
        onIndexChange={setViewer}
        onClose={() => setViewer(null)}
        title={title}
        opener={opener}
      />
    </>
  );
}
