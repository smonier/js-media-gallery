import { useEffect, useId } from "react";
import { useTranslation } from "react-i18next";
import ModalDialog from "../../utils/ModalDialog.js";
import { CloseIcon, NextIcon, PreviousIcon } from "../../utils/icons.js";
import type { ImageData } from "../../utils/jcr.js";
import ui from "../../utils/ui.module.css";
import classes from "./ImageGallery.module.css";

interface ImageViewerProps {
  images: ImageData[];
  /** Index of the image shown, or null when the viewer is closed. */
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  /** Gallery title, used as the dialog's name. */
  title?: string;
  /** The control that opened the viewer, which gets the focus back when it closes. */
  opener?: HTMLElement | null;
}

/** Text alternative of an image: its title, or its position when it has none. */
export const imageAlt = (
  image: ImageData,
  index: number,
  total: number,
  t: (key: string, options?: Record<string, unknown>) => string,
) => image.title || t("mediaGallery.image.untitled", { index: index + 1, total });

/**
 * Full-size image viewer in a modal dialog, with previous / next and the arrow keys. The keys are
 * read on the document while the viewer is open, so they keep working wherever the focus is (a
 * click on the image leaves it on no control).
 */
export default function ImageViewer({
  images,
  index,
  onIndexChange,
  onClose,
  title,
  opener,
}: ImageViewerProps) {
  const { t } = useTranslation("js-media-gallery");
  const titleId = useId();
  const total = images.length;
  const image = index === null ? undefined : images[index];
  const go = (step: number) => {
    if (index !== null) onIndexChange((index + step + total) % total);
  };

  useEffect(() => {
    if (index === null || total < 2) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
      if (!step) return;
      event.preventDefault();
      onIndexChange((index + step + total) % total);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [index, total, onIndexChange]);

  return (
    <ModalDialog open={image !== undefined} onClose={onClose} labelledBy={titleId} opener={opener}>
      {image && index !== null && (
        <div className={`${ui.dialogPanel} ${classes.viewer}`}>
          <div className={ui.dialogHeader}>
            <h2 id={titleId} className={ui.dialogTitle}>
              {title || t("mediaGallery.image.viewer")}
            </h2>
            <button
              type="button"
              className={`${ui.control} ${ui.iconButton}`}
              onClick={onClose}
              aria-label={t("mediaGallery.image.close")}
            >
              <CloseIcon />
            </button>
          </div>
          <figure className={classes.viewerFigure}>
            <div className={classes.viewerStage}>
              <img
                src={image.url}
                alt={imageAlt(image, index, total, t)}
                className={classes.viewerImage}
              />
            </div>
            {(image.title || image.description) && (
              <figcaption className={classes.viewerCaption}>
                {image.title && <p className={ui.dialogTitle}>{image.title}</p>}
                {image.description && <p className={ui.dialogText}>{image.description}</p>}
              </figcaption>
            )}
          </figure>
          {total > 1 && (
            <div className={classes.viewerNav}>
              <button
                type="button"
                className={`${ui.control} ${ui.iconButton}`}
                onClick={() => go(-1)}
                aria-label={t("mediaGallery.image.previous")}
              >
                <PreviousIcon />
              </button>
              <p className={classes.viewerCounter} aria-live="polite" aria-atomic="true">
                {t("mediaGallery.image.position", { index: index + 1, total })}
              </p>
              <button
                type="button"
                className={`${ui.control} ${ui.iconButton}`}
                onClick={() => go(1)}
                aria-label={t("mediaGallery.image.next")}
              >
                <NextIcon />
              </button>
            </div>
          )}
        </div>
      )}
    </ModalDialog>
  );
}
