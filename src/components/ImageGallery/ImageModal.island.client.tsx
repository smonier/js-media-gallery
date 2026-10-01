import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ZoomIcon } from "../../utils/icons.js";
import type { ImageData } from "../../utils/jcr.js";
import ui from "../../utils/ui.module.css";
import ImageViewer, { imageAlt } from "./ImageViewer.js";
import classes from "./ImageGallery.module.css";

interface ImageModalProps {
  images: ImageData[];
  layout: "grid" | "masonry" | "default";
  title?: string;
}

const LAYOUTS = {
  default: {
    list: classes.grid,
    item: classes.gridItem,
    frame: classes.imageWrapper,
    image: classes.image,
  },
  grid: {
    list: classes.grid,
    item: classes.gridItem,
    frame: classes.imageWrapper,
    image: classes.image,
  },
  masonry: {
    list: classes.masonry,
    item: classes.masonryItem,
    frame: classes.masonryFrame,
    image: classes.masonryImage,
  },
};

/**
 * Grid or masonry of images. Each image is a link to the full-size file, so it works without
 * JavaScript; with JavaScript the link opens the image viewer instead.
 */
export default function ImageModal({ images, layout, title }: ImageModalProps) {
  const { t } = useTranslation("js-media-gallery");
  const [selected, setSelected] = useState<number | null>(null);
  const [spans, setSpans] = useState<Record<number, number>>({});
  const styles = LAYOUTS[layout] ?? LAYOUTS.default;
  const total = images.length;

  // Masonry: taller rows for portrait images.
  const measure = (index: number, image: HTMLImageElement) => {
    if (layout !== "masonry" || !image.naturalWidth) return;
    const ratio = image.naturalHeight / image.naturalWidth;
    const span = ratio > 1.5 ? 4 : ratio > 1.2 ? 3 : ratio < 0.7 ? 1 : 2;
    setSpans((previous) => (previous[index] === span ? previous : { ...previous, [index]: span }));
  };

  return (
    <>
      <ul className={styles.list}>
        {images.map((image, index) => {
          const caption = layout !== "default" && (image.title || image.description);
          return (
            <li
              key={`${image.url}-${index}`}
              className={styles.item}
              style={spans[index] ? { gridRowEnd: `span ${spans[index]}` } : undefined}
            >
              <figure className={classes.figure}>
                <a
                  href={image.url}
                  className={`${ui.control} ${classes.imageLink}`}
                  onClick={(event) => {
                    event.preventDefault();
                    setSelected(index);
                  }}
                >
                  <span className={styles.frame}>
                    <img
                      src={image.url}
                      alt={imageAlt(image, index, total, t)}
                      className={styles.image}
                      loading="lazy"
                      ref={(element) => {
                        if (element?.complete) measure(index, element);
                      }}
                      onLoad={(event) => measure(index, event.currentTarget)}
                    />
                    <span className={classes.imageOverlay} aria-hidden="true">
                      <ZoomIcon />
                    </span>
                  </span>
                  <span className={ui.visuallyHidden}>
                    {" "}
                    ({t("mediaGallery.image.viewFullSize")})
                  </span>
                </a>
                {caption && (
                  <figcaption className={classes.caption}>
                    {image.title && <span className={classes.captionTitle}>{image.title}</span>}
                    {image.description && (
                      <span className={classes.captionText}>{image.description}</span>
                    )}
                  </figcaption>
                )}
              </figure>
            </li>
          );
        })}
      </ul>
      <ImageViewer
        images={images}
        index={selected}
        onIndexChange={setSelected}
        onClose={() => setSelected(null)}
        title={title}
      />
    </>
  );
}
