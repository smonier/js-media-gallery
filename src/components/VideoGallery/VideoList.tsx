import { AddContentButtons, getChildNodes, Render } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import classes from "./VideoGallery.module.css";

/**
 * The videos of a gallery, each rendered by its own "gallery" view. Server views only.
 *
 * Used by the default view, and by the other views in edit mode: each video is then a component
 * of its own that Page Builder can select, including a video not set up yet (its view shows what
 * is missing), and the add buttons create new ones.
 */
export default function VideoList({
  currentNode,
  headingLevel,
}: {
  currentNode: JCRNodeWrapper;
  headingLevel: number;
}) {
  const childNodes = getChildNodes(currentNode, -1, 0);
  return (
    <>
      {childNodes.length > 0 && (
        <ul className={classes.defaultGallery}>
          {childNodes.map((childNode) => (
            <li key={childNode.getIdentifier()} className={classes.defaultGalleryItem}>
              <Render
                node={childNode}
                view="gallery"
                parameters={{ headingLevel: String(headingLevel) }}
              />
            </li>
          ))}
        </ul>
      )}
      <AddContentButtons
        nodeTypes={["jsmediagallerynt:internalVideo", "jsmediagallerynt:externalVideo"]}
        editCheck
      />
    </>
  );
}
