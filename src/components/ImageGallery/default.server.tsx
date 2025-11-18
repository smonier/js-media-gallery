import {
  jahiaComponent,
  server,
  buildNodeUrl,
  AddResources,
  buildModuleFileUrl,
} from "@jahia/javascript-modules-library";
import type { ImageGalleryProps } from "./types";
import classes from "./ImageGallery.module.css";

export default jahiaComponent(
  {
    componentType: "view",
    nodeType: "jsmediagallerynt:imageGallery",
    name: "default",
    displayName: "Default View",
  },
  (props: ImageGalleryProps, { renderContext, currentNode }) => {
    const { "jcr:title": title, bannerText, imagesList, folder } = props;

    console.log(
      "[ImageGallery] Component rendering - Props: " +
        JSON.stringify({
          hasFolder: !!folder,
          folderType: typeof folder,
          folderKeys: folder ? Object.keys(folder) : [],
          hasImagesList: !!imagesList,
          imagesListLength: imagesList?.length,
        }),
    );

    // Log the actual folder object to see its structure
    if (folder) {
      console.log(
        "[ImageGallery] Folder object type: " + (folder.constructor?.name || typeof folder),
      );
      try {
        console.log(
          "[ImageGallery] Folder path attempt: " +
            (folder.getPath ? folder.getPath() : "NO getPath"),
        );
      } catch (e) {
        console.log("[ImageGallery] Folder is not a node, trying properties...");
      }
    }

    // Get images from folder or imagesList
    let imageNodes: any[] = [];
    let debugError = "";
    let debugInfo = "";

    if (folder) {
      debugInfo = "Folder detected, type: " + typeof folder;
      console.log("[ImageGallery] Folder mode - trying to access folder");

      try {
        // folder might BE the node itself
        let folderNode = null;

        if (folder.getPath && typeof folder.getPath === "function") {
          // folder is already a JCR node
          folderNode = folder;
          debugInfo += ", IS A NODE, path: " + folderNode.getPath();
        } else if (folder.path) {
          // folder is an object with path property
          folderNode = currentNode.getSession().getNode(folder.path);
          debugInfo += ", has .path: " + folder.path;
        } else {
          debugError = "Folder object has no path or getPath method";
        }

        if (folderNode) {
          console.log("[ImageGallery] Folder node path: " + folderNode.getPath());

          // Iterate through folder nodes like JSP does: targetNode.nodes
          const nodeIterator = folderNode.getNodes();
          const tempNodes: any[] = [];
          while (nodeIterator.hasNext()) {
            const childNode = nodeIterator.nextNode();
            if (childNode.isNodeType("jmix:image")) {
              tempNodes.push(childNode);
            }
          }
          imageNodes = tempNodes;

          console.log("[ImageGallery] Found " + imageNodes.length + " image nodes in folder");
          debugInfo += ", found " + imageNodes.length + " images";
        }
      } catch (error) {
        console.error("[ImageGallery] Error getting folder images: " + String(error));
        debugError = String(error);
      }
    } else if (imagesList) {
      console.log("[ImageGallery] ImagesList mode - " + (imagesList?.length || 0) + " images");
      imageNodes = imagesList;
    }

    // imageNodes contains JCR Node objects - use buildNodeUrl() for file nodes
    const images = (imageNodes || [])
      .filter((node: any) => Boolean(node))
      .map((node: any) => {
        try {
          // Add cache dependency for each image node
          server.render.addCacheDependency({ node }, renderContext);

          // Use buildNodeUrl() which works for all node types including JCRFileNode
          return {
            url: buildNodeUrl(node),
            title: "",
            description: "",
          };
        } catch (error) {
          console.error("Error processing image node:", error);
          return null;
        }
      })
      .filter((image): image is NonNullable<typeof image> => image !== null);
    if (images.length === 0) {
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

    return (
      <>
        <AddResources type="css" resources={buildModuleFileUrl("dist/assets/style.css")} />
        <div className={classes.root}>
          {/* DEBUG INFO */}
          <div
            style={{
              padding: "1rem",
              background: "#f0f0f0",
              marginBottom: "1rem",
              fontSize: "0.875rem",
              fontFamily: "monospace",
            }}
          >
            <strong>DEBUG ImageGallery:</strong>
            <br />
            Has folder: {folder ? "YES" : "NO"}
            <br />
            {debugInfo && (
              <>
                {debugInfo}
                <br />
              </>
            )}
            Has imagesList: {imagesList ? "YES" : "NO"}
            <br />
            {imagesList && (
              <>
                ImagesList length: {imagesList.length}
                <br />
              </>
            )}
            Image nodes found: {imageNodes.length}
            <br />
            Processed images: {images.length}
            <br />
            {debugError && (
              <>
                <span style={{ color: "red" }}>ERROR: {debugError}</span>
                <br />
              </>
            )}
          </div>

          {title && <h2 className={classes.title}>{title}</h2>}
          {bannerText && (
            <div className={classes.banner} dangerouslySetInnerHTML={{ __html: bannerText }} />
          )}

          <div className={classes.defaultGallery}>
            {images.map((image, index) => (
              <figure key={`${image.url}-${index}`} className={classes.defaultItem}>
                <div className={classes.defaultImageWrapper}>
                  <img
                    src={image.url}
                    className={classes.defaultImage}
                    alt={image.title || `Image ${index + 1}`}
                  />
                </div>
                {(image.title || image.description) && (
                  <figcaption className={classes.defaultCaption}>
                    {image.title && <h3 className={classes.defaultImageTitle}>{image.title}</h3>}
                    {image.description && (
                      <p className={classes.defaultImageDescription}>{image.description}</p>
                    )}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </div>
      </>
    );
  },
);
