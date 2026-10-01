import {
  AddResources,
  buildModuleFileUrl,
  Island,
  jahiaComponent,
} from "@jahia/javascript-modules-library";
import { useTranslation } from "react-i18next";
import RichText from "../../utils/RichText.js";
import { fileMimeType, fileUrl, headingLevel, headingTag, resolveLink } from "../../utils/jcr.js";
import ui from "../../utils/ui.module.css";
import HeroVideo from "./HeroVideo.island.client.js";
import type { VideoHeadingProps } from "./types.js";
import classes from "./VideoHeading.module.css";

export default jahiaComponent(
  {
    componentType: "view",
    nodeType: "jsmediagallerynt:videoHeading",
    name: "default",
    displayName: "Video Hero Banner",
  },
  (props: VideoHeadingProps, { currentNode, currentResource, renderContext }) => {
    const { t } = useTranslation("js-media-gallery");
    const { "jcr:title": title, caption, ctaLabel } = props;
    const videoUrl = fileUrl(props.video, renderContext, { node: currentNode, property: "video" });
    const posterUrl = fileUrl(props.videoPoster, renderContext, {
      node: currentNode,
      property: "videoPoster",
    });
    const link = resolveLink(props as Record<string, unknown>, renderContext, currentNode);
    // The page template owns the only h1: the hero title is a section heading (RGAA 9.1).
    const level = headingLevel(currentResource, 2);
    const Heading = headingTag(level);
    const headingId = `jsmg-hero-${currentNode.getIdentifier()}`;

    return (
      <>
        <AddResources type="css" resources={buildModuleFileUrl("dist/assets/style.css")} />
        <section className={classes.hero} aria-labelledby={title ? headingId : undefined}>
          <div className={classes.videoBackground}>
            {videoUrl ? (
              <Island
                component={HeroVideo}
                props={{ src: videoUrl, mimeType: fileMimeType(props.video), posterUrl }}
              />
            ) : posterUrl ? (
              <img src={posterUrl} alt="" className={classes.video} />
            ) : (
              <div className={classes.placeholder} />
            )}
            <div className={classes.overlay} />
          </div>

          <div className={classes.content}>
            <div className={classes.textWrapper}>
              {title && (
                <Heading id={headingId} className={classes.title}>
                  {title}
                </Heading>
              )}
              <RichText html={caption} className={classes.caption} headingLevel={level + 1} />
              {link && ctaLabel && (
                <a
                  href={link.href}
                  className={`${ui.control} ${classes.cta}`}
                  target={link.newWindow ? "_blank" : undefined}
                  rel={link.newWindow ? "noopener noreferrer" : undefined}
                >
                  {ctaLabel}
                  {link.newWindow && (
                    <span className={ui.visuallyHidden}> {t("mediaGallery.common.newWindow")}</span>
                  )}
                </a>
              )}
            </div>
          </div>
        </section>
      </>
    );
  },
);
