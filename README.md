# js-media-gallery

A Jahia JavaScript module that adds image galleries, video galleries and a video hero banner to any site. Images come from a folder of the media library or are picked one by one, and are shown as a grid, a masonry, a carousel or a main image with thumbnails. Videos can be files of the media library (with captions and a transcript) or videos hosted on YouTube, Vimeo, Wistia, Dailymotion or Storylane. The components are server-rendered with React, enhanced in the browser by small client islands, built for RGAA 4.1.2 / WCAG 2.1 AA, and themed through CSS custom properties so they fit any template set.

## Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Upgrading from 1.0.0](#upgrading-from-100)
- [Usage for editors](#usage-for-editors)
- [Content model](#content-model)
- [Video providers and content security policy](#video-providers-and-content-security-policy)
- [Accessibility](#accessibility)
- [Theming](#theming)
- [Internationalisation](#internationalisation)
- [Development](#development)
- [Further documentation](#further-documentation)
- [Changelog](#changelog)

## Features

- **Image Gallery** with five views: default, grid, masonry, carousel, and a main image with thumbnails. Images come from a folder or are picked individually.
- **Image viewer** in a native modal dialog, with previous and next buttons, the arrow keys and a position counter.
- **Video Gallery** with three views: a list of players, a grid of cards that opens a player in a dialog, and a featured player with a strip of thumbnails.
- **Internal videos** from the media library, played with the browser's native controls, with a WebVTT captions file and a transcript per language.
- **External videos** from YouTube, Vimeo (unlisted videos included), Wistia, Dailymotion and Storylane. Editors type the video identifier or paste its address; the provider's thumbnail is used when no poster is set.
- **Video Hero Banner**: a section with a muted, looping background video, a title, a rich-text caption, a call to action and a pause button.
- Links and content that work **without JavaScript**, and players from third parties that load only when the visitor asks for them (except the main player of the featured view).
- Rich text filtered at render time through an allow-list, with headings renumbered under the component's own heading.
- Cache dependencies on every referenced node (images, folders, video files, posters, captions, linked pages), so a fragment refreshes when one of them is published after the component.
- English and French labels for editors and visitors.

## Requirements

| Requirement                   | Version                                                    |
| ----------------------------- | ---------------------------------------------------------- |
| Jahia                         | 8.2.1.0 or later                                           |
| `javascript-modules-engine`   | 1.x (`[1,2)`)                                              |
| Other Jahia module dependency | `default` only                                             |
| Node.js and Yarn (build only) | Node 22 or later, Yarn 4 (`yarn@4.10.3`, through Corepack) |

The module does not depend on jExperience or se-utils.

## Installation

### From a release

1. Download `js-media-gallery.tgz` from the [GitHub releases](https://github.com/smonier/js-media-gallery/releases) (latest: [1.1.0](https://github.com/smonier/js-media-gallery/releases/tag/1.1.0)).
2. In Jahia, open **Administration > Modules** and upload the file.
3. Enable the module on each site that uses it.

The package can also be installed with the Jahia provisioning API (`installOrUpgradeBundle`), which is what `yarn deploy` does.

### From source

```bash
git clone https://github.com/smonier/js-media-gallery.git
cd js-media-gallery
corepack enable
yarn install
yarn build      # builds and writes dist/package.tgz
yarn deploy     # uploads dist/package.tgz to the Jahia instance set in .env
```

See [Development](#development) for the `.env` file and a local Jahia.

## Upgrading from 1.0.0

Version 1.1.0 changes how the video hero stores its call to action. In 1.0.0 the link came from the se-utils link mixin (`seu:linkType`, `seu:internalLink`, `seu:externalLink`, `seu:linkTarget`). In 1.1.0 it uses Jahia's native link fields (`j:linkType`, `j:linknode`, `j:url`) and an **Open in a new tab** checkbox (`openInNewTab`). Version 1.1.0 also restricts the external video provider to the lower-case values `youtube`, `vimeo`, `wistia`, `dailymotion` and `storylane`.

The old values must be moved **before** 1.1.0 is deployed: otherwise the heroes keep properties that their type no longer declares. The Groovy script [`migrations/1.1.0-native-hero-links.groovy`](./migrations/1.1.0-native-hero-links.groovy) does the work. Run it on every environment that has content made with 1.0.0, in the Groovy console (`/modules/tools/groovyConsole.jsp`), as `root`:

1. **Before deploying 1.1.0**, run the script with `STEP = "before"`.
   - It copies each hero's link target to `j:linknode` (a page of the site) or `j:url` (a web address), in every language of the site, and removes the se-utils values and mixins.
   - It writes provider values in lower case and lists any value that is not one of the five providers, to be fixed in Content Editor.
   - It saves the link type and the new-tab choice of each hero to a plan file (`js-media-gallery-1.1.0-hero-links.json` in the server's temporary directory) for step 3.
2. **Deploy 1.1.0** as an upgrade of 1.0.0.
3. **After deploying**, run the script with `STEP = "after"`. It sets `j:linkType` and `openInNewTab` from the plan file, then deletes the file. Run it on the same server as step 1, since the plan file is local to that server.

Notes:

- Each step first runs with `DRY_RUN = true` (the default) and only logs what it would change. Set `DRY_RUN = false` to apply it.
- Changes are written to the `default` and `live` workspaces alike, so nothing needs to be published. The changed heroes show as modified in jContent afterwards; publishing them is safe.
- Running a step twice changes nothing more.
- The views read a stored provider value without case (`YouTube` still plays), but Content Editor only offers the lower-case values.

## Usage for editors

The **Image Gallery**, **Video Gallery** and **Video Hero Banner** can be added to any area that accepts content. **Internal Video** and **External Video** are added inside a Video Gallery. Each component's view is chosen in Content Editor.

### Image Gallery

| Field         | What it does                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------- |
| Title         | Heading of the gallery (optional). Also names the image viewer and the carousel.                  |
| Banner Text   | Rich text shown under the title. Its headings are placed under the gallery title.                 |
| Gallery Type  | **From Directory** shows the Image Folder field; **Select Images** shows the Select Images field. |
| Image Folder  | The folder whose images are shown (only its direct image children, in the folder's order).        |
| Select Images | The images to show, in the order picked.                                                          |

The **title** of each image in the media library is its text alternative, and its **description** is used as a caption. Give every image a title that describes it; an image without a title is announced by its position ("Image 2 of 8").

Views:

| View           | Rendering                                                                                                                                                                                                             |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default View   | A grid of images without captions. Each image opens the viewer.                                                                                                                                                       |
| Grid View      | A grid of images with their title and description as a caption. Each image opens the viewer.                                                                                                                          |
| Masonry Layout | Images in columns, taller rows for portrait images, with captions. Each image opens the viewer.                                                                                                                       |
| Carousel View  | One slide at a time with previous, next, a slide picker and a pause button. It rotates every 5 seconds unless the visitor asked for reduced motion. In edit mode the slides are shown side by side, without rotation. |
| Gallery View   | A main image with up to four thumbnails (a thumbnail shows its image as the main one) and a "+N" button that opens the viewer on the remaining images.                                                                |

### Video Gallery

| Field           | What it does                                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------------ |
| Title           | Heading of the gallery (optional).                                                                           |
| Banner Text     | Rich text shown under the title. Its headings are placed under the gallery title.                            |
| Item Width (px) | Minimum width of a card in the grid view (default 250, at most 1200). A card is never wider than the screen. |
| Videos          | Internal and external videos, added as children of the gallery and ordered by the editor.                    |

Views:

| View            | Rendering                                                                                                                                                               |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default View    | Each video as a player with its title, description and transcript.                                                                                                      |
| Grid View       | Cards with a thumbnail, a title and a description. A card opens its video in a modal player. Transcripts follow the grid under a "Transcripts" heading.                 |
| Featured + Grid | A main player with the title and description of the video shown, and a strip of thumbnails to switch videos. Videos marked **Featured** come first. Transcripts follow. |

In the grid and featured views, a video that is not set up yet (no file, or no valid identifier) is left out. In edit mode, every view lists each video as its own component, so Page Builder can select it, and shows the buttons to add internal and external videos.

### Internal Video

| Field              | What it does                                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Title              | Name of the video, shown as its heading and used as the player's name.                                              |
| Description        | Short plain text shown with the video.                                                                              |
| Video File         | A video file of the media library (MP4, WebM or Ogg), per language.                                                 |
| Video Poster Image | Image shown before the video plays, and used as the card thumbnail (16:9 recommended).                              |
| Captions File      | A WebVTT (`.vtt`) captions file, per language. It is offered by the player and on by default.                       |
| Transcript         | Rich text version of the video (speech, sounds and what is shown), shown in a collapsible section under the player. |
| Featured Video     | Shows the video first in the Featured + Grid view.                                                                  |

### External Video

| Field               | What it does                                                                                                                                                                                               |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Title               | Name of the video, shown as its heading and used in the player's name.                                                                                                                                     |
| Description         | Short plain text shown with the video.                                                                                                                                                                     |
| Video Service       | YouTube (default), Vimeo, Wistia, Dailymotion or Storylane.                                                                                                                                                |
| Video ID or address | The video identifier or the address of the video on the selected service, per language. Any other value is ignored: the video shows "No video ID provided" and is left out of grid and featured galleries. |
| Video Poster Image  | Custom thumbnail. Without it, the provider's thumbnail is used.                                                                                                                                            |
| Transcript          | Rich text version of the video, shown in a collapsible section. Turn the video's captions on at the provider.                                                                                              |
| Featured Video      | Shows the video first in the Featured + Grid view.                                                                                                                                                         |

On its own, an external video shows its thumbnail; a click loads the provider's player in place and starts it. A Storylane demo opens in a modal dialog instead.

### Video Hero Banner

| Field                | What it does                                                                                                      |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Title                | Heading of the section (`h2` by default; the page template owns the page's only `h1`).                            |
| Video File           | Background video, per language. It is muted, loops, and does not start for visitors who ask for reduced motion.   |
| Poster Image         | Image shown while the video loads, when it does not play, and in place of the video when none is set.             |
| Caption              | Rich text shown over the video.                                                                                   |
| Link                 | **No link**, **Page of this site** (Jahia's page picker) or **Web address**. The target is set for each language. |
| Open in a new tab    | Opens the link in a new tab; screen readers are told. Keep it for links to other websites.                        |
| Call to Action Label | Text of the call to action button. The button shows when both a link and a label are set.                         |

Text sits on a uniform dark scrim so that it stays readable whatever the video shows. The section is at least 70% of the viewport height (500 px minimum).

## Content model

Namespaces: `jsmediagallerynt` (`http://modules.se.jahia.org/mediagal/nt/1.0`) for types and `jsmediagallerymix` (`http://modules.se.jahia.org/mediagal/mix/1.0`) for mixins. Each component's definition lives next to its views in `src/components/<Name>/definition.cnd`; shared mixins are in `settings/definitions.cnd`.

### Types

| Type                             | Supertypes                                                                                                  | Property         | Definition                                                                 |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------- | -------------------------------------------------------------------------- |
| `jsmediagallerynt:imageGallery`  | `jnt:content`, `mix:title`, `jsmediagallerymix:component`, `jmix:list` (orderable)                          | `bannerText`     | string, rich text, i18n                                                    |
|                                  |                                                                                                             | `imgGalleryType` | string: `imgDirectory` or `imgFile` (choices from the Content Editor form) |
| `jsmediagallerynt:videoGallery`  | `jnt:content`, `jmix:editorialContent`, `mix:title`, `jmix:list`, `jsmediagallerymix:component` (orderable) | `bannerText`     | string, rich text, i18n                                                    |
|                                  |                                                                                                             | `itemWidth`      | long, mandatory, default `250`                                             |
|                                  |                                                                                                             | `+ *`            | child nodes of type `internalVideo` or `externalVideo`                     |
| `jsmediagallerynt:internalVideo` | `jnt:content`, `mix:title`                                                                                  | `videoDesc`      | string, i18n                                                               |
|                                  |                                                                                                             | `video`          | weak reference to a file, i18n                                             |
|                                  |                                                                                                             | `videoPoster`    | weak reference to an image (`jmix:image`)                                  |
|                                  |                                                                                                             | `captions`       | weak reference to a file (WebVTT), i18n                                    |
|                                  |                                                                                                             | `transcript`     | string, rich text, i18n                                                    |
|                                  |                                                                                                             | `featured`       | boolean, default `false`                                                   |
| `jsmediagallerynt:externalVideo` | `jnt:content`, `mix:title`                                                                                  | `videoDesc`      | string, i18n                                                               |
|                                  |                                                                                                             | `videoService`   | string: `youtube` (default), `vimeo`, `wistia`, `dailymotion`, `storylane` |
|                                  |                                                                                                             | `videoId`        | string, i18n: identifier or address                                        |
|                                  |                                                                                                             | `videoPoster`    | weak reference to an image (`jmix:image`)                                  |
|                                  |                                                                                                             | `transcript`     | string, rich text, i18n                                                    |
|                                  |                                                                                                             | `featured`       | boolean, default `false`                                                   |
| `jsmediagallerynt:videoHeading`  | `jnt:content`, `mix:title`, `jsmediagallerymix:component`, `jsmediagallerymix:linkTo`                       | `video`          | weak reference to a file, i18n                                             |
|                                  |                                                                                                             | `videoPoster`    | weak reference to an image (`jmix:image`)                                  |
|                                  |                                                                                                             | `caption`        | string, rich text, i18n                                                    |
|                                  |                                                                                                             | `ctaLabel`       | string, i18n                                                               |

`jcr:title` comes from `mix:title` on every type.

### Mixins

| Mixin                             | Purpose                                                                                                                                                                                                        |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `jsmediagallerymix:component`     | Marks the droppable components (`jmix:droppableContent`, `jmix:accessControllableContent`): image gallery, video gallery, video hero.                                                                          |
| `jsmediagallerymix:linkTo`        | Jahia's native link type: `j:linkType` (`none`, `internal`, `external`, through `linkTypeInitializer`) and `openInNewTab` (boolean). `j:linknode` and `j:url` come from Jahia's own link mixins, per language. |
| `jsmediagallerymix:directoryLink` | Dynamic fieldset of the image gallery: `folder`, a weak reference to a folder.                                                                                                                                 |
| `jsmediagallerymix:imagesLink`    | Dynamic fieldset of the image gallery: `imagesList`, multiple weak references to images.                                                                                                                       |

The Content Editor form `settings/content-editor-forms/fieldsets/jsmediagallerynt_imageGallery.json` turns **Gallery Type** into a choice list that adds `directoryLink` or `imagesLink` to the node.

### Render parameter

Every view reads an optional `headingLevel` Render parameter (2 to 6) for its top heading, so a parent view can place a component under its own outline. Defaults: `h2` for galleries and the hero, `h3` for a single video. Video galleries pass the next level down to their videos.

## Video providers and content security policy

### Accepted values

An identifier is used only when it matches the provider's format, and an address only when it belongs to a known host of the selected provider.

| Provider    | Identifier                           | Addresses accepted                                                                                                                                         |
| ----------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| YouTube     | 11 characters (`A-Z a-z 0-9 _ -`)    | `youtube.com/watch?v=<id>`, `youtu.be/<id>`, `youtube.com/embed/<id>`, `/shorts/<id>`, `/live/<id>`, `/v/<id>` (also `www.`, `m.`, `youtube-nocookie.com`) |
| Vimeo       | Up to 12 digits                      | `vimeo.com/<id>`, `vimeo.com/<id>/<key>` (unlisted), `player.vimeo.com/video/<id>?h=<key>`, channel, showcase, album and group addresses                   |
| Wistia      | 10 lower-case letters or digits      | `fast.wistia.net/embed/iframe/<id>`, `fast.wistia.com/...`, `<account>.wistia.com/medias/<id>`                                                             |
| Dailymotion | 5 to 12 letters or digits            | `dailymotion.com/video/<id>`, `dai.ly/<id>`, `geo.dailymotion.com/...?video=<id>`                                                                          |
| Storylane   | 8 to 20 lower-case letters or digits | `app.storylane.io/...` and `jahia.storylane.io/...` addresses ending with the demo identifier                                                              |

The key of an unlisted Vimeo video is kept and passed to the player and the thumbnail request.

### Players and thumbnails

| Provider    | Player frame                                        | Thumbnail                                                                                                           | Without JavaScript, the link goes to        |
| ----------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| YouTube     | `https://www.youtube-nocookie.com/embed/<id>`       | `https://i.ytimg.com/vi/<id>/hqdefault.jpg`                                                                         | `https://www.youtube.com/watch?v=<id>`      |
| Vimeo       | `https://player.vimeo.com/video/<id>`               | Requested in the browser from `https://vimeo.com/api/...`                                                           | `https://vimeo.com/<id>`                    |
| Wistia      | `https://fast.wistia.net/embed/iframe/<id>`         | `https://fast.wistia.com/embed/medias/<id>/swatch`                                                                  | `https://fast.wistia.net/embed/iframe/<id>` |
| Dailymotion | `https://www.dailymotion.com/embed/video/<id>`      | `https://www.dailymotion.com/thumbnail/video/<id>`                                                                  | `https://www.dailymotion.com/video/<id>`    |
| Storylane   | `https://jahia.storylane.io/demo/<id>?embed=inline` | Requested in the browser from `https://api.storylane.io/oembed/meta`; the first frame of the animated image is kept | `https://jahia.storylane.io/share/<id>`     |

Autoplay is requested only after a visitor's click. Player frames are lazy-loaded, use `referrerpolicy="strict-origin-when-cross-origin"`, and run in a sandbox (`allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox allow-forms`). Storylane demos are always embedded from `jahia.storylane.io`.

### Content security policy

If your site sends a `Content-Security-Policy` header, allow the providers you use:

| Directive     | Sources                                                                                                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `frame-src`   | `https://www.youtube-nocookie.com https://player.vimeo.com https://fast.wistia.net https://www.dailymotion.com https://jahia.storylane.io`                               |
| `img-src`     | `https://i.ytimg.com https://fast.wistia.com https://www.dailymotion.com`, the image hosts returned by the Vimeo and Storylane APIs, and `blob:` (Storylane first frame) |
| `connect-src` | `https://vimeo.com https://api.storylane.io`                                                                                                                             |
| `media-src`   | `'self'` (internal videos, captions and the hero video are served by Jahia)                                                                                              |

The thumbnail hosts returned by Vimeo and Storylane, and the hosts a provider may redirect a thumbnail to, are chosen by the provider: check the browser console for blocked images and add those hosts to `img-src`. A poster set by the editor avoids any thumbnail request to the provider.

## Accessibility

The components are built for RGAA 4.1.2 and WCAG 2.1 level AA. What they do:

- **Text alternatives.** Gallery images take their title from the media library; an image without a title is announced by its position. Video thumbnails are decorative, and their links are named after the video ("Play the video: ..."). Player frames are named after the provider and the video.
- **Headings.** Galleries and the hero start at `h2` and follow the `headingLevel` Render parameter; rich-text headings are renumbered under the component heading and never skip a level. Grid and featured galleries group their transcripts under a heading of their own.
- **Dialogs.** The image viewer and the video player use the native `<dialog>` element opened as a modal: the rest of the page is inert, the dialog is named by its visible heading, focus stays inside (including after a Tab from inside a provider's frame), Escape, the close button and a click on the backdrop close it (a drag that starts or ends inside does not), and focus returns to the control that opened it. The player stops when the dialog closes.
- **Motion.** The carousel and the hero video start only when the visitor has not asked for reduced motion, and both have a visible pause button. The carousel also pauses while the pointer or the keyboard focus is inside it. Transitions and hover effects are turned off under `prefers-reduced-motion: reduce`.
- **Announcements.** Slide changes made by the visitor, the image counter of the viewer and the video chosen in the featured view are announced; automatic rotation is not.
- **State not by colour alone.** A selected thumbnail is an `aria-pressed` button with a thicker frame; the picker button of the current carousel slide has `aria-current`.
- **Focus and targets.** Every control has a visible focus ring with a dark outline and a light halo, so one of the two keeps a 3:1 contrast on any background. Icon buttons are at least 44 x 44 px.
- **Captions and transcripts.** Internal videos play a WebVTT captions track per language, on by default. Every video can have a transcript, shown in a collapsible `<details>` section.
- **Links.** A link that opens a new tab says so to screen readers.
- **Rich text.** Banner texts, hero captions and transcripts go through an allow-list filter at render time: editorial markup only, no scripts, styles, frames or forms, no inline styles or classes, no link targets or titles. `lang` and `dir` attributes are kept. Ids are prefixed per block so they never collide. An image without a text alternative gets `alt=""`, and in edit mode a note asks the editor to describe it.

### Keyboard

| Where               | Keys                                                                                                                              |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Galleries           | Tab to each image or video link; Enter opens the viewer or the player.                                                            |
| Image viewer        | Left and Right arrows show the previous and next image (wherever the focus is in the viewer); Escape closes it; Tab stays inside. |
| Video player dialog | Escape closes it; Tab stays inside; the provider's or the browser's player controls apply.                                        |
| Carousel            | Tab to the pause/play button, previous, next and the slide picker; Enter or Space activates them.                                 |
| Gallery view        | Tab to a thumbnail; Enter or Space shows it as the main image; Enter on the main image opens the viewer.                          |
| Hero                | Tab to the pause/play button and the call to action.                                                                              |

### Without JavaScript

- Image grid, masonry and default views: each image is a link to the full-size file.
- Gallery view: the main image is a link to the full-size file; the "+N" button is not shown.
- Carousel: the slides are shown in a horizontal strip that can be scrolled, including with the keyboard.
- Video grid and single external videos: each card or thumbnail is a link to the video on the provider's site, or to the file of an internal video. Vimeo and Storylane thumbnails need JavaScript; set a poster to show one without it.
- Internal videos and the main player of the featured view are rendered by the server and play with the native or provider controls.
- Hero: the poster is shown and the background video does not start.

### What editors provide

The components cannot write these for you: a descriptive title on every image of the media library, a captions file for every internal video with speech or meaningful sound, a transcript for every video, captions turned on at the provider for external videos, and text alternatives for images inside rich text.

## Theming

Styles are CSS Modules, so class names are not a public API. The look is set through custom properties prefixed `--jsmg-`. The module defines neutral defaults on `:root`, in `src/utils/ui.module.css`.

| Property                        | Default                       | Used for                                                                       |
| ------------------------------- | ----------------------------- | ------------------------------------------------------------------------------ |
| `--jsmg-color-surface`          | `#fff`                        | Cards, video cards, image tiles, edit-mode notes                               |
| `--jsmg-color-surface-sunken`   | `#f5f5f5`                     | Image frames, the featured video's description panel, empty video placeholders |
| `--jsmg-color-text`             | `#1a1a1a`                     | Text on the module's own surfaces (card titles, captions, carousel controls)   |
| `--jsmg-color-text-muted`       | `#595959`                     | Secondary text on surfaces (descriptions, caption text)                        |
| `--jsmg-color-border`           | `#8a8a8a`                     | Border of the edit-mode notes                                                  |
| `--jsmg-color-media`            | `#000`                        | Background behind images, players and carousel slides                          |
| `--jsmg-color-overlay`          | `rgb(0 0 0 / 96%)`            | Backdrop of the image viewer and the video dialog                              |
| `--jsmg-color-on-overlay`       | `#fff`                        | Text on the backdrop, the carousel captions and the hero                       |
| `--jsmg-color-on-overlay-muted` | `#e0e0e0`                     | Secondary text on the backdrop and in carousel captions                        |
| `--jsmg-color-scrim`            | `rgb(0 0 0 / 70%)`            | Hover layer behind the zoom icon of an image                                   |
| `--jsmg-color-control`          | `#fff`                        | Background of icon buttons and play badges                                     |
| `--jsmg-color-on-control`       | `#1a1a1a`                     | Icon and border of icon buttons and play badges                                |
| `--jsmg-color-focus`            | `#1a1a1a`                     | Focus outline                                                                  |
| `--jsmg-color-focus-halo`       | `#fff`                        | Halo around the focus outline                                                  |
| `--jsmg-radius`                 | `8px`                         | Corner radius of cards and thumbnails                                          |
| `--jsmg-radius-lg`              | `12px`                        | Corner radius of players and large frames                                      |
| `--jsmg-shadow-sm`              | `0 2px 8px rgb(0 0 0 / 10%)`  | Resting shadows (cards, thumbnails, players, icon buttons)                     |
| `--jsmg-shadow-md`              | `0 4px 16px rgb(0 0 0 / 15%)` | Raised shadows (hover states, play buttons)                                    |

Optional properties, not defined by the module, that a host can set:

| Property                        | Fallback                                      | Used for                                                                                      |
| ------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `--jsmg-color-page-text`        | `currentColor`                                | Text that sits on the host page: gallery titles, banner text, empty states, single-video text |
| `--jsmg-color-accent`           | `var(--primary)`, then `#1565c0` or `#1a1a1a` | Ring of play buttons, frame of the selected thumbnail                                         |
| `--jsmg-color-hero-scrim`       | `rgb(0 0 0 / 60%)`                            | Layer between the hero video and its text                                                     |
| `--jsmg-color-hero-placeholder` | A blue to purple gradient                     | Hero background when neither a video nor a poster is set                                      |

### Mapping from a host template set

Map the tokens to the template set's own semantic tokens. Setting them on `body` (or on a wrapper element) overrides the module's `:root` defaults whatever the stylesheet order:

```css
body {
  --jsmg-color-surface: var(--site-color-surface);
  --jsmg-color-text: var(--site-color-text);
  --jsmg-color-text-muted: var(--site-color-text-muted);
  --jsmg-color-border: var(--site-color-border);
  --jsmg-color-accent: var(--site-color-primary);
  --jsmg-color-focus: var(--site-color-focus);
  --jsmg-radius: var(--site-radius);
}
```

### Light and dark

The module ships no dark-mode rule. Text that sits on the host page follows the host's text colour, so it is correct in both schemes. The module's own surfaces (cards, dialogs, players) keep their colours until the host redefines the tokens, for example in its own dark-mode rule:

```css
@media (prefers-color-scheme: dark) {
  body {
    --jsmg-color-surface: #1e1e1e;
    --jsmg-color-surface-sunken: #2a2a2a;
    --jsmg-color-text: #f2f2f2;
    --jsmg-color-text-muted: #c4c4c4;
    --jsmg-color-focus: #f2f2f2;
    --jsmg-color-focus-halo: #000;
  }
}
```

Check contrast for each theme: text needs 4.5:1 on its surface, and focus rings and control borders 3:1.

## Internationalisation

The module ships **English** and **French**:

- `settings/resources/js-media-gallery_en.properties` and `_fr.properties`: Content Editor labels, tooltips, choice values and view names.
- `settings/locales/en.json` and `fr.json`: text shown to visitors (button names, dialog names, announcements, empty states), loaded under the `js-media-gallery` namespace.

Content is translated per language for titles, descriptions, banner texts, captions, transcripts, the hero's call to action label and link target, video files, captions files and external video identifiers. The provider, posters, the featured flag, the item width and the image source are shared by all languages.

To add a language, add `settings/locales/<lang>.json` and `settings/resources/js-media-gallery_<lang>.properties` with the same keys as the English files.

## Development

### Prerequisites

- Node 22 or later (`.node-version` pins 22) and Yarn 4 through Corepack (`corepack enable`).
- A Jahia 8.2.1+ instance with `javascript-modules-engine` 1.x, for example the Docker Compose setup below.

### Scripts

| Script               | What it does                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| `yarn build`         | Builds the server and client bundles with Vite, then packs `dist/package.tgz`.                    |
| `yarn build:check`   | Type-checks with `tsc --noEmit`, then builds.                                                     |
| `yarn test`          | Runs the Vitest unit tests (`src/**/*.test.ts`): rich-text filter, video addresses, label values. |
| `yarn lint`          | Runs ESLint (TypeScript and React rules).                                                         |
| `yarn format`        | Runs Prettier on the project.                                                                     |
| `yarn package`       | Packs `dist/package.tgz` from the current build.                                                  |
| `yarn deploy`        | Uploads `dist/package.tgz` to Jahia through the provisioning API.                                 |
| `yarn dev` / `watch` | Rebuilds on every change, then packs and deploys after each successful build.                     |
| `yarn clean`         | Removes `dist/`.                                                                                  |

### Local Jahia

`docker-compose.yml` starts Jahia (`jahia/jahia-ee:8.2`) with PostgreSQL 16 and provisions `javascript-modules-engine` 1.0.1 from `docker/provisioning.yml`. Port 8080 serves Jahia and port 9229 the debugger.

```bash
docker compose up --wait
yarn build && yarn deploy
```

`yarn deploy` reads a `.env` file at the project root when there is one (it is ignored by Git):

```properties
JAHIA_HOST=http://localhost:8080
JAHIA_USER=root:root1234
```

These are the defaults when the file or a variable is missing. `JAHIA_USER` is `user:password`; for CI or shared environments, use a dedicated account with only the permissions it needs.

### Continuous integration

`.github/workflows/build.yml` runs on every push: it installs with `yarn install --immutable`, runs `yarn test` and `yarn build`, and uploads `dist/package.tgz` as a build artifact.

### Project layout

```
src/
├── components/
│   ├── ImageGallery/    image gallery: 5 views, viewer, carousel and gallery islands
│   ├── VideoGallery/    video gallery: default, grid and featured views
│   ├── InternalVideo/   media-library video (default and gallery item views)
│   ├── ExternalVideo/   provider video (default and gallery item views, player island)
│   └── VideoHeading/    video hero banner and its background video island
└── utils/               shared parts: modal dialog, video frame and dialog, rich text and its
                         filter, transcripts, JCR helpers, provider helpers, tokens (ui.module.css),
                         unit tests (*.test.ts)
settings/
├── definitions.cnd      namespaces and shared mixins
├── content-editor-forms/fieldsets/   gallery type choice list
├── content-types-icons/
├── locales/             visitor-facing text (en, fr)
└── resources/           Content Editor labels (en, fr)
migrations/              upgrade scripts
```

Each component folder holds its `definition.cnd`, `types.ts`, `*.server.tsx` views, `*.island.client.tsx` islands and CSS Module.

## Further documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md): component hierarchy, views and islands, data flow, provider integration.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
