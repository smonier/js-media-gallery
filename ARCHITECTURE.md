# Architecture

How js-media-gallery is built, for developers who change or extend it. What editors see, the content model, the video providers, theming and the build scripts are described in the [README](./README.md).

## Components

```
Page area
├── Image Gallery         jsmediagallerynt:imageGallery
├── Video Gallery         jsmediagallerynt:videoGallery
│   ├── Internal Video    jsmediagallerynt:internalVideo   (child node)
│   └── External Video    jsmediagallerynt:externalVideo   (child node)
└── Video Hero Banner     jsmediagallerynt:videoHeading
```

Each component lives in `src/components/<Name>/`: its `definition.cnd`, its `types.ts`, one `<view>.server.tsx` per view, its `*.island.client.tsx` islands and its CSS Module. `settings/definitions.cnd` holds the namespaces and the shared mixins only (`jsmediagallerymix:component`, `jsmediagallerymix:linkTo`).

## Views and islands

| Type           | View (file)                                       | Island                                                                   |
| -------------- | ------------------------------------------------- | ------------------------------------------------------------------------ |
| Image Gallery  | `default`, `grid`, `masonry`                      | `ImageModal` (one island, a `layout` prop), opens `ImageViewer`          |
|                | `gallery`                                         | `GalleryIsland` (main image and thumbnails), opens `ImageViewer`         |
|                | `carousel`                                        | `carousel.island.client.tsx`                                             |
| Video Gallery  | `default`                                         | None: `VideoList` renders each child with `<Render view="gallery">`      |
|                | `grid`                                            | `VideoModal` (cards that open `VideoDialog`)                             |
|                | `featured`                                        | `FeaturedGallery` (featured videos first, then the others)               |
| Internal Video | `default`, `gallery` (the item view of a gallery) | None: `VideoBlock` and `VideoFrame` render a native `<video>`            |
| External Video | `default`, `gallery`                              | `ExternalVideoPlayer` (thumbnail, then the player in place or a dialog)  |
| Video Hero     | `default`                                         | `HeroVideo` (background video and its pause button), when a video is set |

The image gallery views share `ImageGallery/GalleryFrame.tsx` and the video gallery views `VideoGallery/GalleryFrame.tsx`: the heading, the banner text, the empty state and the stylesheet. Video galleries render transcripts on the server, next to the island (`Transcripts.tsx`), so they do not depend on JavaScript.

Shared parts are in `src/utils/`:

| File                                                 | Role                                                                                       |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `jcr.ts`                                             | Reads JCR nodes for the server views and returns plain values (see below).                 |
| `video.ts`                                           | Everything provider-specific: identifiers, hosts, player, page and thumbnail addresses.    |
| `sanitize.ts`, `RichText.tsx`                        | Allow-list filter for editors' rich text and the one component that renders it.            |
| `ModalDialog.tsx`, `VideoDialog.tsx`                 | Native `<dialog>` opened as a modal, and a player inside it.                               |
| `VideoFrame.tsx`, `VideoBlock.tsx`, `Transcript.tsx` | A player (provider frame or `<video>`), one video with its text, a collapsible transcript. |
| `useThumbnail.ts`                                    | The editor's poster, else the provider's thumbnail.                                        |
| `i18n.ts`                                            | `textValues`: interpolation options for labels that include a title.                       |
| `icons.tsx`, `ui.module.css`                         | Decorative icons, the design tokens and the shared control styles.                         |

## Rendering flow

1. A server view (`jahiaComponent`) receives the node's properties. A reference property (weak reference to an image, a file, a folder or a page) arrives as a JCR node when the visitor can read its target.
2. The view calls the helpers of `src/utils/jcr.ts`, which turn nodes into plain values:
   - `fileUrl` builds the address of a file with `buildNodeUrl(node)`, which gives the right workspace and context path. Addresses such as `/files/default/...` are never built by hand.
   - `collectImages` returns the images of the chosen folder (its direct `jmix:image` children, in the folder's order) or the picked images, as `ImageData` (address, title, description).
   - `videoData` returns a `VideoData` for an internal or external video node; `collectVideos` (in `VideoGallery/collect.ts`) keeps the videos that can be played.
   - `resolveLink` reads the hero's native link (`j:linkType`, then `j:linknode` through `buildNodeUrl`, or `j:url`).
   - `headingLevel` reads the optional `headingLevel` Render parameter.
3. Every node read this way is registered as a cache dependency with `server.render.addCacheDependency`. When a reference cannot be read (target not published, or not visible to the visitor), the dependency is registered on the stored identifier instead, so the fragment refreshes when the target is published later.
4. The view passes only serializable values to its islands (`ImageData[]`, `VideoData[]`, strings, numbers), never a JCR node. `<Island>` renders the island on the server as well, then hydrates it in the browser, so the first HTML already holds the links that work without JavaScript.

### Stylesheet

Vite compiles every CSS Module into one file, `dist/assets/style.css`. Each component loads it with `<AddResources type="css" resources={buildModuleFileUrl("dist/assets/style.css")} />`, through the gallery frames, `VideoBlock` and the hero view. A new view that does not use one of these must add it itself. Colours, radii and shadows come from the `--jsmg-` tokens of `src/utils/ui.module.css`, never from literals in a component stylesheet.

### Rich text

Banner texts, hero captions and transcripts are rendered only through `RichText`, which runs the allow-list filter of `sanitize.ts` first and renumbers headings under the component's own heading. The filter is plain JavaScript with no DOM, so it runs in the server renderer. No other code renders an editor's HTML.

### Server renderer constraints

Server views run in GraalJS: there is no DOM and no `URL` API (`video.ts` splits addresses itself). The functions of `video.ts` that need the browser (`fetch`, a canvas) are called from islands only: the Vimeo and Storylane thumbnail requests and the extraction of the first frame of the Storylane image.

### Labels

Views and islands call `useTranslation("js-media-gallery")` with the namespace written out; keys live under `mediaGallery` in `settings/locales/<lang>.json`. A label that interpolates a title (for example "Play the video: {{title}}") passes its values through `textValues` from `i18n.ts`, so the title is encoded once, by React.

## Edit mode

- The carousel renders its slides side by side, without rotation (`flat` prop).
- The grid and featured video galleries render `VideoList` instead of their island: each video is its own component that Page Builder can select, including one that is not set up yet, and `AddContentButtons` offers to add internal and external videos.
- `RichText` adds a note when an image inside rich text has no text alternative.

## Image gallery source: dynamic fieldsets

`imgGalleryType` is a plain string property. `settings/content-editor-forms/fieldsets/jsmediagallerynt_imageGallery.json` turns it into a choice list whose two values add a mixin to the node through `addMixin`:

| Value          | Mixin added                       | Field                                   |
| -------------- | --------------------------------- | --------------------------------------- |
| `imgDirectory` | `jsmediagallerymix:directoryLink` | `folder`, a weak reference to a folder  |
| `imgFile`      | `jsmediagallerymix:imagesLink`    | `imagesList`, weak references to images |

Both mixins are declared in `ImageGallery/definition.cnd` as `> jmix:dynamicFieldset mixin` with `extends = jsmediagallerynt:imageGallery`. The JSON file names the type with a colon (`jsmediagallerynt:imageGallery`) and its file name with an underscore.

## Video providers

`src/utils/video.ts` holds all provider knowledge, covered by `src/utils/video.test.ts`:

- `VIDEO_SERVICES`, the list of providers, and `toVideoService`, which reads a stored value without case.
- `ID_FORMATS` and `HOSTS`: an identifier is accepted only when it matches its provider's format, and an address only when its host belongs to the provider. `parseVideo` reads the identifier (and the key of an unlisted Vimeo video) from either.
- `SERVICE_NAMES` (names shown to visitors), `getEmbedUrl` (player), `getWatchUrl` (the provider's page, target of the link without JavaScript), `getServiceThumbnail` (thumbnails known without a request) and `resolveThumbnail` (the others, fetched in the browser).

Storylane demos open in a modal dialog instead of playing in place: `VideoFrame`, `VideoDialog`, `ExternalVideoPlayer` and `VideoModal` check for `storylane`.

## Extending the module

### Adding a video provider

1. Add the value to the `videoService` list in `src/components/ExternalVideo/definition.cnd`.
2. Add `jsmediagallerynt_externalVideo.videoService.<value>` to `settings/resources/js-media-gallery_en.properties` and `_fr.properties`.
3. In `src/utils/video.ts`, add the provider to `VIDEO_SERVICES`, `ID_FORMATS`, `HOSTS` and `SERVICE_NAMES` (`yarn build:check` reports each of these tables that lacks it), to `videoFromUrl` when the identifier is not the last segment of the address, and to `getEmbedUrl`, `getWatchUrl` and `getServiceThumbnail` or `resolveThumbnail`.
4. Add its identifiers and addresses to `src/utils/video.test.ts` and run `yarn test`.
5. Add it to the README tables: accepted values, players and thumbnails, and content security policy.

### Adding a view

1. Create `src/components/<Name>/<view>.server.tsx` with `jahiaComponent({ componentType: "view", nodeType, name, displayName }, render)`. A node type has one view per name: two views with the same name and node type stop the module from loading.
2. Render through the component's `GalleryFrame` (or add `AddResources` yourself), and read the data with `collectImages`, `collectVideos` or `videoData`.
3. Put interactive parts in a `*.island.client.tsx` file and pass it serializable props only.
4. Add the view's label, `jsmediagallerynt_<type>.<view>`, to the English and French resource bundles, and its visitor-facing text to `settings/locales/en.json` and `fr.json`.

## Tests

`yarn test` runs the Vitest unit tests of the pure modules: the rich-text filter (`sanitize.test.ts`), the provider helpers (`video.test.ts`) and the label values (`i18n.test.ts`). Views are checked on a Jahia instance: build, deploy, then render each view in preview and in Page Builder, with and without JavaScript.

## Build output

`yarn build` runs Vite with `@jahia/vite-plugin`:

- `dist/server/index.js`: every server view, in one bundle.
- `dist/client/`: one bundle per island, with chunks they share in `dist/assets/`.
- `dist/assets/style.css`: every CSS Module.

`yarn package` then packs `dist/`, the CND files and `settings/` (the `files` list of `package.json`) into `dist/package.tgz`, the file Jahia installs.
