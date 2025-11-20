import { useState, useEffect } from "react";
import classes from "./ImageGallery.module.css";

interface ImageData {
  url: string;
  title: string;
  description: string;
}

interface ImageModalProps {
  images: ImageData[];
  layout: "grid" | "masonry" | "default";
}

export default function ImageModal({ images, layout }: ImageModalProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [imageSpans, setImageSpans] = useState<{ [key: number]: number }>({});

  const closeModal = () => {
    setSelectedIndex(null);
  };

  // Calculate masonry spans based on image aspect ratios
  const handleImageLoad = (index: number, event: React.SyntheticEvent<HTMLImageElement>) => {
    if (layout !== "masonry") return;

    const img = event.currentTarget;
    const aspectRatio = img.naturalHeight / img.naturalWidth;

    // Calculate span based on aspect ratio
    // Portrait images (tall) get more rows
    let span = 2; // default
    if (aspectRatio > 1.5)
      span = 4; // very tall
    else if (aspectRatio > 1.2)
      span = 3; // tall
    else if (aspectRatio < 0.7) span = 1; // wide

    setImageSpans((prev) => ({ ...prev, [index]: span }));
  };

  const nextImage = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % images.length);
    }
  };

  const previousImage = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") previousImage();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex]);

  const getLayoutClass = () => {
    switch (layout) {
      case "grid":
        return classes.grid;
      case "masonry":
        return classes.masonry;
      default:
        return classes.grid;
    }
  };

  const getItemClass = () => {
    switch (layout) {
      case "grid":
        return classes.gridItem;
      case "masonry":
        return classes.masonryItem;
      default:
        return classes.gridItem;
    }
  };

  const getImageClass = () => {
    switch (layout) {
      case "grid":
        return classes.image;
      case "masonry":
        return classes.masonryImage;
      default:
        return classes.image;
    }
  };

  const getWrapperClass = () => {
    switch (layout) {
      case "grid":
        return classes.imageWrapper;
      case "masonry":
        return "";
      default:
        return classes.imageWrapper;
    }
  };

  const selectedImage = selectedIndex !== null ? images[selectedIndex] : null;

  return (
    <>
      <div className={getLayoutClass()}>
        {images.map((image, index) => {
          const masonryStyle =
            layout === "masonry" && imageSpans[index]
              ? { gridRowEnd: `span ${imageSpans[index]}` }
              : {};

          return (
            <button
              key={`${image.url}-${index}`}
              type="button"
              className={`${getItemClass()} ${classes.imageButton}`}
              onClick={() => setSelectedIndex(index)}
              style={masonryStyle}
            >
              {getWrapperClass() && (
                <div className={getWrapperClass()}>
                  <img
                    src={image.url}
                    className={getImageClass()}
                    alt={image.title || `Image ${index + 1}`}
                    onLoad={(e) => handleImageLoad(index, e)}
                  />
                  <div className={classes.imageOverlay}>
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                  </div>
                </div>
              )}
              {!getWrapperClass() && (
                <>
                  <img
                    src={image.url}
                    className={`${getImageClass()} ${classes.imageButton}`}
                    alt={image.title || `Image ${index + 1}`}
                    onLoad={(e) => handleImageLoad(index, e)}
                  />
                  <div className={classes.imageOverlay}>
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                  </div>
                </>
              )}
              {(image.title || image.description) && layout !== "default" && (
                <figcaption className={layout === "masonry" ? classes.masonryCaption : undefined}>
                  {image.title && (
                    <h3 className={layout === "grid" ? classes.imageTitle : classes.masonryTitle}>
                      {image.title}
                    </h3>
                  )}
                  {image.description && (
                    <p
                      className={
                        layout === "grid" ? classes.imageDescription : classes.masonryDescription
                      }
                    >
                      {image.description}
                    </p>
                  )}
                </figcaption>
              )}
            </button>
          );
        })}
      </div>

      {selectedImage && (
        <div className={classes.imageModalOverlay} onClick={closeModal}>
          <div className={classes.imageModalContent} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={classes.imageModalClose}
              onClick={closeModal}
              aria-label="Close image"
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

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className={`${classes.imageModalNav} ${classes.imageModalNavPrev}`}
                  onClick={previousImage}
                  aria-label="Previous image"
                >
                  <svg
                    width="32"
                    height="32"
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
                    width="32"
                    height="32"
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

            <div className={classes.imageModalImageWrapper}>
              <img
                src={selectedImage.url}
                alt={selectedImage.title || "Image"}
                className={classes.imageModalImage}
              />
            </div>

            {(selectedImage.title || selectedImage.description) && (
              <div className={classes.imageModalInfo}>
                {selectedImage.title && (
                  <h2 className={classes.imageModalTitle}>{selectedImage.title}</h2>
                )}
                {selectedImage.description && (
                  <p className={classes.imageModalDescription}>{selectedImage.description}</p>
                )}
              </div>
            )}

            {images.length > 1 && (
              <div className={classes.imageModalCounter}>
                {selectedIndex! + 1} / {images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
