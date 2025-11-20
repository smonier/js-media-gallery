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
import ImageModal from "./ImageModal.island.client";

export default jahiaComponent<ImageGalleryProps>(
  {
    componentType: "view",
    nodeType: "jsmediagallerynt:imageGallery",
    name: "grid",
    displayName: "Grid View",
  },
  (props: ImageGalleryProps, { renderContext, currentNode }) => {
    const { "jcr:title": title, bannerText, imagesList, folder } = props;

    console.log("[ImageGallery Grid] Component rendering - Props:", {
      hasFolder: !!folder,
      folderPath: folder?.path,
      folderUuid: folder?.uuid,
      hasImagesList: !!imagesList,
      imagesListLength: imagesList?.length,
    });

    // Get images from folder or imagesList
    let imageNodes: any[] = [];
    if (folder) {
      console.log("[ImageGallery Grid] Folder mode - trying to access folder");
      try {
        // folder might BE the node itself
        let folderNode = null;

        if (folder.getPath && typeof folder.getPath === "function") {
          // folder is already a JCR node
          folderNode = folder;
        } else if (folder.path) {
          // folder is an object with path property
          folderNode = currentNode.getSession().getNode(folder.path);
        }

        if (folderNode) {
          console.log("[ImageGallery Grid] Folder node path: " + folderNode.getPath());

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

          console.log("[ImageGallery Grid] Found " + imageNodes.length + " image nodes in folder");
        }
      } catch (error) {
        console.error("[ImageGallery Grid] Error getting folder images: " + String(error));
      }
    } else if (imagesList) {
      console.log("[ImageGallery Grid] ImagesList mode - " + (imagesList?.length || 0) + " images");
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
          {title && <h2 className={classes.title}>{title}</h2>}
          {bannerText && (
            <div className={classes.banner} dangerouslySetInnerHTML={{ __html: bannerText }} />
          )}

          <Island component={ImageModal} props={{ images, layout: "grid" }}>
            <div className={classes.grid}>
              {images.map((image, index) => (
                <div key={`${image.url}-${index}`} className={classes.gridItem}>
                  <img src={image.url} alt={image.title || `Image ${index + 1}`} />
                </div>
              ))}
            </div>
          </Island>
        </div>
      </>
    );
  },
);
