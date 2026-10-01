import { useId } from "react";
import { useTranslation } from "react-i18next";
import ModalDialog from "./ModalDialog.js";
import VideoFrame from "./VideoFrame.js";
import { CloseIcon } from "./icons.js";
import type { VideoData } from "./video.js";
import ui from "./ui.module.css";

interface VideoDialogProps {
  /** The video to play, or undefined when the dialog is closed. */
  video?: VideoData;
  onClose: () => void;
}

/** A player in a modal dialog, opened by a visitor's click (so it may start playing). */
export default function VideoDialog({ video, onClose }: VideoDialogProps) {
  const { t } = useTranslation("js-media-gallery");
  const titleId = useId();
  const isDemo = video?.videoService === "storylane";
  return (
    <ModalDialog open={Boolean(video)} onClose={onClose} labelledBy={titleId}>
      {video && (
        <div className={`${ui.dialogPanel} ${isDemo ? ui.dialogWide : ""}`}>
          <div className={ui.dialogHeader}>
            <h2 id={titleId} className={ui.dialogTitle}>
              {video.title || t("mediaGallery.video.untitled")}
            </h2>
            <button
              type="button"
              className={`${ui.control} ${ui.iconButton}`}
              onClick={onClose}
              aria-label={t("mediaGallery.video.close")}
            >
              <CloseIcon />
            </button>
          </div>
          <div className={`${ui.playerFrame} ${isDemo ? ui.playerFrameDemo : ""}`}>
            <VideoFrame video={video} autoplay={!isDemo} className={ui.player} />
          </div>
          {video.description && <p className={ui.dialogText}>{video.description}</p>}
        </div>
      )}
    </ModalDialog>
  );
}
