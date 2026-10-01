import type { ReactNode } from "react";
import { AddResources, buildModuleFileUrl } from "@jahia/javascript-modules-library";
import { useTranslation } from "react-i18next";
import RichText from "../../utils/RichText.js";
import { headingTag } from "../../utils/jcr.js";
import classes from "./ImageGallery.module.css";

interface GalleryFrameProps {
  title?: string;
  bannerText?: string;
  level: number;
  isEmpty: boolean;
  children: ReactNode;
}

/** Title, banner text and empty state shared by the image gallery views. */
export default function GalleryFrame({
  title,
  bannerText,
  level,
  isEmpty,
  children,
}: GalleryFrameProps) {
  const { t } = useTranslation("js-media-gallery");
  const Heading = headingTag(level);
  return (
    <>
      <AddResources type="css" resources={buildModuleFileUrl("dist/assets/style.css")} />
      <div className={classes.root}>
        {title && <Heading className={classes.title}>{title}</Heading>}
        <RichText
          html={bannerText}
          className={classes.banner}
          headingLevel={title ? level + 1 : level}
        />
        {isEmpty ? (
          <p className={classes.noImages}>{t("mediaGallery.imageGallery.noImages")}</p>
        ) : (
          children
        )}
      </div>
    </>
  );
}
