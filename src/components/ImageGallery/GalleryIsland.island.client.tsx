import { useState, useEffect } from "react";
import classes from "./ImageGallery.module.css";

interface ImageData {
  url: string;
  title: string;
  description: string;
}

interface GalleryIslandProps {
  images: ImageData[];
  title: string;
}

export default function GalleryIsland({ images, title }: GalleryIslandProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [dialogImageIndex, setDialogImageIndex] = useState<number>(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Responsive thumbnail count based on screen size
  const [thumbnailsCount, setThumbnailsCount] = useState(4);

  useEffect(() => {
    const updateThumbnailsCount = () => {
      if (window.innerWidth >= 1200) {
        setThumbnailsCount(4);
      } else if (window.innerWidth >= 768) {
        setThumbnailsCount(2);
      } else {
        setThumbnailsCount(1);
      }
    };

    updateThumbnailsCount();
    window.addEventListener("resize", updateThumbnailsCount);
    return () => window.removeEventListener("resize", updateThumbnailsCount);
  }, []);

  const maxThumbnails = thumbnailsCount + 1; // +1 for the main image
  const thumbnailItems = images.slice(1, maxThumbnails);
  const hasMore = images.length > maxThumbnails;

  const openDialog = (index: number) => {
    setDialogImageIndex(index);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const nextImage = () => {
    setDialogImageIndex((prev) => (prev + 1) % images.length);
  };

  const previousImage = () => {
    setDialogImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Keyboard navigation in dialog
  useEffect(() => {
    if (!isDialogOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDialog();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") previousImage();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDialogOpen, dialogImageIndex]);

  const mainImage = images[selectedImageIndex];

  return (
    <>
      <div className={classes.galleryView}>
        {/* Main Image */}
        <div className={classes.galleryMain}>
          <button
            type="button"
            className={classes.galleryMainButton}
            onClick={() => openDialog(selectedImageIndex)}
            aria-label="View full size"
          >
            <img
              src={mainImage.url}
              alt={mainImage.title || `Image ${selectedImageIndex + 1}`}
              className={classes.galleryMainImage}
            />
          </button>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <ul className={classes.galleryThumbnails}>
            {thumbnailItems.map((image, index) => {
              const imageIndex = index + 1;
              const fadeInDelay = hydrated ? `${index * 200}ms` : "0ms";

              return (
                <li
                  key={imageIndex}
                  className={`${classes.galleryThumb} ${hydrated ? classes.galleryThumbFadeIn : ""}`}
                  style={{ animationDelay: fadeInDelay }}
                >
                  <button
                    type="button"
                    className={classes.galleryThumbButton}
                    onClick={() => setSelectedImageIndex(imageIndex)}
                    aria-label={`View image ${imageIndex + 1}`}
                  >
                    <img
                      src={image.url}
                      alt={image.title || `Thumbnail ${imageIndex + 1}`}
                      className={classes.galleryThumbImage}
                    />
                  </button>
                </li>
              );
            })}

            {hydrated && hasMore && (
              <li
                className={`${classes.galleryThumbMore} ${classes.galleryThumbFadeIn}`}
                style={{ animationDelay: `${thumbnailItems.length * 200}ms` }}
              >
                <button
                  type="button"
                  className={classes.galleryThumbButton}
                  onClick={() => openDialog(maxThumbnails)}
                  aria-label={`View ${images.length - maxThumbnails} more images`}
                >
                  <span className={classes.galleryMoreCount}>+{images.length - maxThumbnails}</span>
                </button>
              </li>
            )}
          </ul>
        )}
      </div>

      {/* Dialog / Modal for Slideshow */}
      {isDialogOpen && (
        <div className={classes.imageModalOverlay} onClick={closeDialog}>
          <div className={classes.galleryDialog} onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              type="button"
              className={classes.imageModalClose}
              onClick={closeDialog}
              aria-label="Close gallery"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Title */}
            {title && <h2 className={classes.galleryDialogTitle}>{title}</h2>}

            {/* Slideshow */}
            <div className={classes.gallerySlideshow}>
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    className={`${classes.imageModalNav} ${classes.imageModalNavPrev}`}
                    onClick={previousImage}
                    aria-label="Previous image"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className={`${classes.imageModalNav} ${classes.imageModalNavNext}`}
                    onClick={nextImage}
                    aria-label="Next image"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </>
              )}

              <div className={classes.gallerySlideshowImageWrapper}>
                <img
                  src={images[dialogImageIndex].url}
                  alt={images[dialogImageIndex].title || `Image ${dialogImageIndex + 1}`}
                  className={classes.gallerySlideshowImage}
                />
              </div>

              {/* Image Info */}
              {(images[dialogImageIndex].title || images[dialogImageIndex].description) && (
                <div className={classes.gallerySlideshowInfo}>
                  {images[dialogImageIndex].title && (
                    <h3 className={classes.gallerySlideshowTitle}>
                      {images[dialogImageIndex].title}
                    </h3>
                  )}
                  {images[dialogImageIndex].description && (
                    <p className={classes.gallerySlideshowDescription}>
                      {images[dialogImageIndex].description}
                    </p>
                  )}
                </div>
              )}

              {/* Counter */}
              {images.length > 1 && (
                <div className={classes.imageModalCounter}>
                  {dialogImageIndex + 1} / {images.length}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
