import { jahiaComponent } from "@jahia/javascript-modules-library";
import { useTranslation } from "react-i18next";
import VideoBlock from "../../utils/VideoBlock.js";
import VideoFrame from "../../utils/VideoFrame.js";
import { headingLevel, videoData } from "../../utils/jcr.js";
import ui from "../../utils/ui.module.css";
import type { InternalVideoProps } from "./types.js";

export default jahiaComponent(
  {
    componentType: "view",
    nodeType: "jsmediagallerynt:internalVideo",
    name: "default",
    displayName: "Internal Video",
  },
  (props: InternalVideoProps, { currentNode, currentResource, renderContext }) => {
    const { t } = useTranslation("js-media-gallery");
    const video = videoData(currentNode, renderContext, currentResource.getLocale().getLanguage());
    return (
      <VideoBlock
        title={props["jcr:title"]}
        description={props.videoDesc}
        transcript={props.transcript}
        level={headingLevel(currentResource, 3)}
        variant="default"
        emptyMessage={video?.videoUrl ? undefined : t("mediaGallery.internalVideo.noVideo")}
      >
        {video?.videoUrl && (
          <div className={ui.playerFrame}>
            <VideoFrame video={video} className={ui.player} />
          </div>
        )}
      </VideoBlock>
    );
  },
);
