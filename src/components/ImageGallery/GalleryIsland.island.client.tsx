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

/** Thumbnails shown next to the main image, by screen width. */
const thumbnailCount = () => (window.innerWidth >= 1200 ? 4 : window.innerWidth >= 768 ? 2 : 1);

/**
 * A main image with a row of thumbnails. A thumbnail shows its image as the main one; the main
 * image is a link to the full-size file (no JavaScript needed) that opens the viewer.
 */
export default function GalleryIsland({ images, title }: GalleryIslandProps) {
  const { t } = useTranslation("js-media-gallery");
  const [current, setCurrent] = useState(0);
  const [viewer, setViewer] = useState<number | null>(null);
  const [count, setCount] = useState(4);
  const [hydrated, setHydrated] = useState(false);
  const total = images.length;

  useEffect(() => {
    setHydrated(true);
    const update = () => setCount(thumbnailCount());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const main = images[current] ?? images[0];
  if (!main) return null;
  // One slot per thumbnail, plus one for "more" when some images are left out.
  const shown = total > count + 1 ? images.slice(0, count) : images;
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
              setViewer(current);
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
              <li
                key={`${image.url}-${index}`}
                className={`${classes.galleryThumb} ${hydrated ? classes.galleryThumbFadeIn : ""}`}
                style={hydrated ? { animationDelay: `${index * 120}ms` } : undefined}
              >
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
                  onClick={() => setViewer(shown.length)}
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
      />
    </>
  );
}
