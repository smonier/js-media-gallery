import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { NextIcon, PauseIcon, PlayIcon, PreviousIcon } from "../../utils/icons.js";
import type { ImageData } from "../../utils/jcr.js";
import ui from "../../utils/ui.module.css";
import { imageAlt } from "./ImageViewer.js";
import classes from "./ImageGallery.module.css";

interface CarouselClientProps {
  images: ImageData[];
  title?: string;
  /** Edit mode: all slides side by side, no rotation. */
  flat?: boolean;
}

const DELAY_MS = 5000;

/**
 * Image carousel (RGAA 13.8 and the WAI-ARIA carousel pattern):
 * - it rotates only when the visitor has not asked for reduced motion, and a visible button
 *   pauses and restarts it; the pointer or the keyboard focus entering the carousel pauses it too,
 *   until it leaves or the visitor presses the play button;
 * - previous, next and the slide picker are named buttons; the slide shown is announced whenever
 *   the carousel is not rotating, so a change made by the visitor is read (WAI-ARIA carousel);
 * - before hydration, without JavaScript and in edit mode, the slides are a scrollable strip.
 */
export default function CarouselClient({ images, title, flat = false }: CarouselClientProps) {
  const { t } = useTranslation("js-media-gallery");
  const [enhanced, setEnhanced] = useState(false);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false); // pointer or focus inside
  const root = useRef<HTMLElement>(null);
  const total = images.length;

  useEffect(() => {
    if (flat) return;
    setEnhanced(true);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setPlaying(total > 1 && !reduce);
  }, [flat, total]);

  useEffect(() => {
    if (!playing || paused || total < 2) return;
    const timer = setInterval(() => setCurrent((index) => (index + 1) % total), DELAY_MS);
    return () => clearInterval(timer);
  }, [playing, paused, total]);

  if (total === 0) return null;

  const goTo = (index: number) => {
    setCurrent((index + total) % total);
    setPlaying(false);
  };

  /** The play button: playing again overrides the pause of the pointer or the focus inside. */
  const togglePlaying = () => {
    if (!playing) setPaused(false);
    setPlaying(!playing);
  };

  /** Rotating: the slide changes are not announced (they would interrupt the visitor). */
  const rotating = playing && !paused;

  const label = title || t("mediaGallery.carousel.label");

  if (!enhanced) {
    return (
      <section
        className={classes.carouselStrip}
        aria-label={label}
        // A scrollable region must be reachable with the keyboard (WCAG 2.1.1).
        tabIndex={0}
      >
        <ul className={classes.carouselStripList}>
          {images.map((image, index) => (
            <li key={`${image.url}-${index}`} className={classes.carouselStripItem}>
              <figure className={classes.carouselFigure}>
                <img
                  src={image.url}
                  alt={imageAlt(image, index, total, t)}
                  className={classes.carouselImage}
                />
                {(image.title || image.description) && (
                  <figcaption className={classes.carouselCaption}>
                    {image.title && <span className={classes.carouselTitle}>{image.title}</span>}
                    {image.description && (
                      <span className={classes.carouselDescription}>{image.description}</span>
                    )}
                  </figcaption>
                )}
              </figure>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section
      ref={root}
      className={classes.carousel}
      aria-roledescription={t("mediaGallery.carousel.roleDescription")}
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={(event) => {
        // Only when the focus enters from outside: moving between the carousel's own buttons
        // keeps the state the visitor chose with the play button.
        if (!root.current?.contains(event.relatedTarget as Node | null)) setPaused(true);
      }}
      onBlur={(event) => {
        if (!root.current?.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      {total > 1 && (
        <div className={classes.carouselToolbar}>
          <button
            type="button"
            className={`${ui.control} ${classes.carouselPlay}`}
            onClick={togglePlaying}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
            <span>
              {playing ? t("mediaGallery.carousel.pause") : t("mediaGallery.carousel.play")}
            </span>
          </button>
        </div>
      )}
      <div className={classes.carouselMain} aria-live={rotating ? "off" : "polite"}>
        {images.map((image, index) => (
          <div
            key={`${image.url}-${index}`}
            className={classes.carouselSlide}
            role="group"
            aria-roledescription={t("mediaGallery.carousel.slideRoleDescription")}
            aria-label={t("mediaGallery.image.position", { index: index + 1, total })}
            hidden={index !== current}
          >
            <figure className={classes.carouselFigure}>
              <img
                src={image.url}
                alt={imageAlt(image, index, total, t)}
                className={classes.carouselImage}
              />
              {(image.title || image.description) && (
                <figcaption className={classes.carouselCaption}>
                  {image.title && <span className={classes.carouselTitle}>{image.title}</span>}
                  {image.description && (
                    <span className={classes.carouselDescription}>{image.description}</span>
                  )}
                </figcaption>
              )}
            </figure>
          </div>
        ))}
        {total > 1 && (
          <>
            <button
              type="button"
              className={`${ui.control} ${ui.iconButton} ${classes.carouselButton} ${classes.carouselButtonPrev}`}
              onClick={() => goTo(current - 1)}
              aria-label={t("mediaGallery.carousel.previous")}
            >
              <PreviousIcon />
            </button>
            <button
              type="button"
              className={`${ui.control} ${ui.iconButton} ${classes.carouselButton} ${classes.carouselButtonNext}`}
              onClick={() => goTo(current + 1)}
              aria-label={t("mediaGallery.carousel.next")}
            >
              <NextIcon />
            </button>
          </>
        )}
      </div>
      {total > 1 && (
        <ul className={classes.carouselDots}>
          {images.map((image, index) => (
            <li key={`${image.url}-${index}`}>
              <button
                type="button"
                className={`${ui.control} ${classes.carouselDot}`}
                onClick={() => goTo(index)}
                aria-label={t("mediaGallery.carousel.goTo", { index: index + 1 })}
                aria-current={index === current ? "true" : undefined}
              >
                <span className={classes.carouselDotMark} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
