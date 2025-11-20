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

export default jahiaComponent(
  {
    componentType: "view",
    nodeType: "jsmediagallerynt:imageGallery",
    name: "default",
    displayName: "Default View",
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
          const nodeIterator = folderNode.getNodes();
          const tempNodes: any[] = [];
          while (nodeIterator.hasNext()) {
            const childNode = nodeIterator.nextNode();
            if (childNode.isNodeType("jmix:image")) {
              tempNodes.push(childNode);
            }
          }
          imageNodes = tempNodes;
        }
      } catch (error) {
        console.error("[ImageGallery] Error getting folder images:", error);
      }
    } else if (imagesList) {
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

          <Island component={ImageModal} props={{ images, layout: "default" }}>
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
