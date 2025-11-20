import {
  jahiaComponent,
  AddResources,
  buildModuleFileUrl,
  getChildNodes,
  Island,
  server,
  buildNodeUrl,
  getNodeProps,
} from "@jahia/javascript-modules-library";
import type { VideoGalleryProps } from "./types";
import classes from "./VideoGallery.module.css";
import VideoModal from "./VideoModal.island.client";

export default jahiaComponent(
  {
    componentType: "view",
    nodeType: "jsmediagallerynt:videoGallery",
    name: "grid",
    displayName: "Grid View",
  },
  (props: VideoGalleryProps, { currentNode, renderContext }) => {
    const { "jcr:title": title, bannerText, itemWidth = 250 } = props;

    const childNodes = getChildNodes(currentNode, -1, 0);

    // Collect video data for modal
    const videos = childNodes.map((childNode: any) => {
      const nodeType = childNode.getPrimaryNodeType().getName();
      const isExternal = nodeType === "jsmediagallerynt:externalVideo";

      const nodeProps = getNodeProps(childNode, [
        "jcr:title",
        "videoDesc",
        "video",
        "videoPoster",
        "videoService",
        "videoId",
      ]);

      const videoTitle = nodeProps["jcr:title"] || "";
      const videoDesc = nodeProps["videoDesc"] || "";

      let videoUrl: string | undefined;
      let posterUrl: string | undefined;
      let videoService: string | undefined;
      let videoId: string | undefined;

      if (isExternal) {
        videoService = nodeProps["videoService"] || "youtube";
        videoId = nodeProps["videoId"] || "";
      } else {
        const video = nodeProps["video"];
        if (video) {
          if (video.getPath && typeof video.getPath === "function") {
            server.render.addCacheDependency({ node: video }, renderContext);
            videoUrl = buildNodeUrl(video);
          } else if (video.path) {
            videoUrl = `/files/default${video.path}`;
          }
        }
      }

      const videoPoster = nodeProps["videoPoster"];
      if (videoPoster) {
        if (videoPoster.getPath && typeof videoPoster.getPath === "function") {
          server.render.addCacheDependency({ node: videoPoster }, renderContext);
          posterUrl = buildNodeUrl(videoPoster);
        } else if (videoPoster.path) {
          posterUrl = `/files/default${videoPoster.path}`;
        }
      }

      return {
        id: childNode.getIdentifier(),
        title: videoTitle,
        description: videoDesc,
        videoUrl,
        posterUrl,
        videoService,
        videoId,
        isExternal,
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

          <div style={{ "--item-width": `${itemWidth}px` } as React.CSSProperties}>
            <Island component={VideoModal} props={{ videos }}>
              <div className={classes.grid}>
                {childNodes.map((childNode) => (
                  <div key={childNode.getIdentifier()} className={classes.gridItem}>
                    Loading videos...
                  </div>
                ))}
              </div>
            </Island>
          </div>
        </div>
      </>
    );
  },
);
