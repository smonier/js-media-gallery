# js-media-gallery Changelog

## 1.1.0 (2026-10-01)

- Accessible media components (RGAA 4.1.2 / WCAG 2.1 AA): image and video links that work without JavaScript, native modal dialogs that keep and return the focus, a carousel with a pause button that respects reduced motion, captions and transcripts for videos, headings placed under the page outline, EN and FR labels.
- The video hero's call to action uses Jahia's native link type (`j:linkType`, `j:linknode`, `j:url`) and an "Open in a new tab" option, replacing the se-utils link mixin: the module no longer depends on se-utils. Upgrade with `migrations/1.1.0-native-hero-links.groovy` (see the README).
- No jExperience dependency: the module depends on the default module and the JavaScript modules engine only.
- Rich text (banner text, hero caption, transcripts) is rendered through an allow-list filter.
- Carousel, image viewer, dialog, gallery and hero controls: keyboard play, arrow keys anywhere in the viewer, focus back on the control that opened a dialog in every browser, no close on a drag, stable thumbnails at every width, slide changes announced, a pause button that follows the video.
- Video addresses: unlisted Vimeo videos (with their key) and Wistia account media pages are accepted; provider values are read without case.
- Cached fragments refresh when a linked page, a video, a poster, captions or picked images are published after the component.
- In edit mode, every video of a grid or featured gallery can be selected in Page Builder; gallery transcripts have their own heading.
- Unit tests (Vitest) for the rich text filter, the video addresses and the label values, run in CI.

## 1.0.0 (2026-01-28)

First version: image galleries (grid, masonry, carousel, main image with thumbnails) and video galleries, internal and external videos (YouTube, Vimeo, Wistia, Dailymotion, Storylane) and a video hero banner.
