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
import FeaturedGallery from "./FeaturedGallery.island.client";

export default jahiaComponent(
  {
    componentType: "view",
    nodeType: "jsmediagallerynt:videoGallery",
    name: "featured",
    displayName: "Featured + Grid",
  },
  (props: VideoGalleryProps, { currentNode, renderContext }) => {
    const { "jcr:title": title, bannerText } = props;

    const childNodes = getChildNodes(currentNode, -1, 0);

    // Collect video data for client island
    const videos = childNodes.map((childNode: any) => {
      const nodeType = childNode.getPrimaryNodeType().getName();
      const isExternal = nodeType === "jsmediagallerynt:externalVideo";

      // Get node properties (this handles JCR node detection automatically)
      const nodeProps = getNodeProps(childNode, [
        "jcr:title",
        "videoDesc",
        "video",
        "videoPoster",
        "videoService",
        "videoId",
        "featured",
      ]);

      const videoTitle = nodeProps["jcr:title"] || "";
      const videoDesc = nodeProps["videoDesc"] || "";
      const featured = nodeProps["featured"] || false;

      let videoUrl: string | undefined;
      let posterUrl: string | undefined;
      let videoService: string | undefined;
      let videoId: string | undefined;

      if (isExternal) {
        videoService = nodeProps["videoService"] || "youtube";
        videoId = nodeProps["videoId"] || "";
      } else {
        // Internal video - get video URL
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

      // Get poster URL (both types) - using same pattern as gallery views
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
        featured,
      };
    });

    // Sort videos: featured first, then rest
    const sortedVideos = [
      ...videos.filter((v) => v.featured),
      ...videos.filter((v) => !v.featured),
    ];

    // Debug logging
    console.log(
      "Featured videos data:",
      JSON.stringify(
        sortedVideos.map((v) => ({
          title: v.title,
          isExternal: v.isExternal,
          videoService: v.videoService,
          videoId: v.videoId,
          hasPoster: !!v.posterUrl,
          posterUrl: v.posterUrl,
          featured: v.featured,
        })),
        null,
        2,
      ),
    );

    return (
      <>
        <AddResources type="css" resources={buildModuleFileUrl("dist/assets/style.css")} />
        <div className={classes.root}>
          {title && <h2 className={classes.title}>{title}</h2>}
          {bannerText && (
            <div className={classes.banner} dangerouslySetInnerHTML={{ __html: bannerText }} />
          )}

          <Island component={FeaturedGallery} props={{ videos: sortedVideos }}>
            <div className={classes.featuredSection}>Loading videos...</div>
          </Island>
        </div>
      </>
    );
  },
);
