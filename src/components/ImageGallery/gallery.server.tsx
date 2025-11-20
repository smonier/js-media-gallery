import {
  jahiaComponent,
  server,
  buildNodeUrl,
  AddResources,
  buildModuleFileUrl,
  Island,
} from "@jahia/javascript-modules-library";
import type { ImageGalleryProps } from "./types";
import classes from "./ImageGallery.module.css";
import GalleryIsland from "./GalleryIsland.island.client";

export default jahiaComponent<ImageGalleryProps>(
  {
    componentType: "view",
    nodeType: "jsmediagallerynt:imageGallery",
    name: "gallery",
    displayName: "Gallery View",
  },
  (props: ImageGalleryProps, { renderContext, currentNode }) => {
    const { "jcr:title": title, bannerText, imagesList, folder } = props;

    // Get images from folder or imagesList
    let imageNodes: any[] = [];
    if (folder) {
      try {
        let folderNode = null;

        if (folder.getPath && typeof folder.getPath === "function") {
          folderNode = folder;
        } else if (folder.path) {
          folderNode = currentNode.getSession().getNode(folder.path);
        }

        if (folderNode) {
          const iterator = folderNode.getNodes();
          while (iterator.hasNext()) {
            const childNode = iterator.nextNode();
            if (
              childNode.isNodeType("jmix:image") ||
              childNode.getPrimaryNodeType().isNodeType("jmix:image")
            ) {
              imageNodes.push(childNode);
            }
          }
        }
      } catch (error) {
        console.error("[ImageGallery Gallery] Error accessing folder:", error);
      }
    } else if (imagesList && Array.isArray(imagesList)) {
      imageNodes = imagesList;
    }

    if (imageNodes.length === 0) {
      return (
        <>
          <AddResources type="css" resources={buildModuleFileUrl("dist/assets/style.css")} />
          <div className={classes.root}>
            {title && <h2 className={classes.title}>{title}</h2>}
            <p className={classes.noImages}>No images to display</p>
          </div>
        </>
      );
    }

    // Build images array for client
    const images = imageNodes.map((node) => {
      let imageUrl = "";
      let imageTitle = "";
      let imageDesc = "";

      if (node.getPath && typeof node.getPath === "function") {
        imageUrl = buildNodeUrl(node, renderContext);
        try {
          if (node.hasProperty("jcr:title")) {
            imageTitle = node.getProperty("jcr:title").getString();
          }
        } catch (e) {
          // Ignore
        }
        try {
          if (node.hasProperty("jcr:description")) {
            imageDesc = node.getProperty("jcr:description").getString();
          }
        } catch (e) {
          // Ignore
        }
      } else if (node.url) {
        imageUrl = node.url;
        imageTitle = node.title || "";
        imageDesc = node.description || "";
      }

      return {
        url: imageUrl,
        title: imageTitle,
        description: imageDesc,
      };
    });

    return (
      <>
        <AddResources type="css" resources={buildModuleFileUrl("dist/assets/style.css")} />
        <div className={classes.root}>
          {title && <h2 className={classes.title}>{title}</h2>}
          {bannerText && (
            <div className={classes.banner} dangerouslySetInnerHTML={{ __html: bannerText }} />
          )}

          <Island component={GalleryIsland} props={{ images, title: title || "Gallery" }}>
            <div className={classes.galleryView}>
              <div className={classes.galleryMain}>
                <img
                  src={images[0].url}
                  alt={images[0].title || "Image 1"}
                  className={classes.galleryMainImage}
                />
              </div>
              {images.length > 1 && (
                <div className={classes.galleryThumbnails}>
                  {images.slice(1, 5).map((image, index) => (
                    <div key={index} className={classes.galleryThumb}>
                      <img src={image.url} alt={image.title || `Image ${index + 2}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Island>
        </div>
      </>
    );
  },
);
