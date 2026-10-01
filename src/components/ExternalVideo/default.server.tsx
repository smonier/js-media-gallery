import { Island, jahiaComponent } from "@jahia/javascript-modules-library";
import { useTranslation } from "react-i18next";
import VideoBlock from "../../utils/VideoBlock.js";
import { headingLevel, videoData } from "../../utils/jcr.js";
import ExternalVideoPlayer from "./ExternalVideoPlayer.island.client.js";
import type { ExternalVideoProps } from "./types.js";

export default jahiaComponent(
  {
    componentType: "view",
    nodeType: "jsmediagallerynt:externalVideo",
    name: "default",
    displayName: "External Video",
  },
  (props: ExternalVideoProps, { currentNode, currentResource, renderContext }) => {
    const { t } = useTranslation("js-media-gallery");
    const video = videoData(currentNode, renderContext, currentResource.getLocale().getLanguage());
    const playable = Boolean(video?.videoService && video.videoId);
    return (
      <VideoBlock
        title={props["jcr:title"]}
        description={props.videoDesc}
        transcript={props.transcript}
        level={headingLevel(currentResource, 3)}
        variant="default"
        emptyMessage={playable ? undefined : t("mediaGallery.externalVideo.noVideoId")}
      >
        {video && playable && <Island component={ExternalVideoPlayer} props={{ video }} />}
      </VideoBlock>
    );
  },
);
