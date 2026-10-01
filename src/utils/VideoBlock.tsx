import type { ReactNode } from "react";
import { AddResources, buildModuleFileUrl } from "@jahia/javascript-modules-library";
import { headingTag } from "./jcr.js";
import Transcript from "./Transcript.js";
import classes from "./videoBlock.module.css";

interface VideoBlockProps {
  title?: string;
  description?: string;
  transcript?: unknown;
  level: number;
  /** "item": a card of a video gallery list (title under the player). */
  variant: "default" | "item";
  /** Shown instead of the player when the video cannot be played. */
  emptyMessage?: string;
  children?: ReactNode;
}

/** One video: its title, its player, its description and its transcript. Server views only. */
export default function VideoBlock({
  title,
  description,
  transcript,
  level,
  variant,
  emptyMessage,
  children,
}: VideoBlockProps) {
  const Heading = headingTag(level);
  const heading = title ? <Heading className={classes.title}>{title}</Heading> : null;
  const player = emptyMessage ? (
    <div className={classes.placeholder}>
      <p className={classes.noVideo}>{emptyMessage}</p>
    </div>
  ) : (
    <div className={classes.player}>{children}</div>
  );
  return (
    <>
      <AddResources type="css" resources={buildModuleFileUrl("dist/assets/style.css")} />
      <div className={variant === "item" ? classes.item : classes.root}>
        {variant === "item" ? (
          <>
            {player}
            <div className={classes.body}>
              {heading}
              {description && <p className={classes.description}>{description}</p>}
              <Transcript html={transcript} headingLevel={level + 1} />
            </div>
          </>
        ) : (
          <>
            {heading}
            {description && <p className={classes.description}>{description}</p>}
            {player}
            <Transcript html={transcript} headingLevel={level + 1} />
          </>
        )}
      </div>
    </>
  );
}
