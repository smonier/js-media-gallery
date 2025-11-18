import { useState, useEffect } from "react";
import type { GalleryImage } from "./types";
import classes from "./ImageGallery.module.css";

interface CarouselClientProps {
  images: GalleryImage[];
}

export default function CarouselClient({ images }: CarouselClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  useEffect(() => {
    if (!isAutoPlay || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay, images.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlay(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsAutoPlay(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsAutoPlay(false);
  };

  if (images.length === 0) {
    return <div className={classes.carouselEmpty}>No images available</div>;
  }

  const currentImage = images[currentIndex];

  return (
    <div className={classes.carousel}>
      <div className={classes.carouselMain}>
        <img
          src={currentImage.url}
          alt={currentImage.title || `Image ${currentIndex + 1}`}
          className={classes.carouselImage}
        />
        {(currentImage.title || currentImage.description) && (
          <div className={classes.carouselCaption}>
            {currentImage.title && <h3 className={classes.carouselTitle}>{currentImage.title}</h3>}
            {currentImage.description && (
              <p className={classes.carouselDescription}>{currentImage.description}</p>
            )}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <>
          <button
            className={`${classes.carouselButton} ${classes.carouselButtonPrev}`}
            onClick={goToPrevious}
            aria-label="Previous image"
          >
            ‹
          </button>
          <button
            className={`${classes.carouselButton} ${classes.carouselButtonNext}`}
            onClick={goToNext}
            aria-label="Next image"
          >
            ›
          </button>

          <div className={classes.carouselDots}>
            {images.map((_, index) => (
              <button
                key={index}
                className={`${classes.carouselDot} ${
                  index === currentIndex ? classes.carouselDotActive : ""
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
