import Transcript from "../../utils/Transcript.js";
import type { GalleryVideos } from "./collect.js";
import classes from "./VideoGallery.module.css";

/** Transcripts of the videos of a grid or featured gallery, after it. */
export default function Transcripts({
  transcripts,
  level,
}: {
  transcripts: GalleryVideos["transcripts"];
  level: number;
}) {
  if (transcripts.length === 0) return null;
  return (
    <div className={classes.transcripts}>
      {transcripts.map((item) => (
        <Transcript key={item.id} html={item.html} videoTitle={item.title} headingLevel={level} />
      ))}
    </div>
  );
}
