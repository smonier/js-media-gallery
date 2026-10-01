# Component Architecture Diagram

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                      Jahia Page / Area                          │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │ ImageGallery │  │ VideoGallery │  │VideoHeading  │
    │              │  │              │  │ (Hero Banner)│
    └──────────────┘  └──────────────┘  └──────────────┘
                              │
                  ┌───────────┼───────────┐
                  │                       │
                  ▼                       ▼
          ┌──────────────┐        ┌──────────────┐
          │InternalVideo │        │ExternalVideo │
          │ (MP4/WebM)  │        │(YouTube/etc) │
          └──────────────┘        └──────────────┘
```

## View Types

### Image Gallery Views
```
ImageGallery Component
    ├── default.server.tsx    → Default View (grid)
    ├── grid.server.tsx       → Grid View (responsive cards)
    ├── masonry.server.tsx    → Masonry Layout (waterfall)
    │   └── ImageModal.island.client.tsx (the three views above: links that open ImageViewer)
    ├── gallery.server.tsx    → Main image and thumbnails
    │   └── GalleryIsland.island.client.tsx
    └── carousel.server.tsx   → Carousel (slider with a pause button)
        └── carousel.island.client.tsx
```

### Video Gallery Views
```
VideoGallery Component
    ├── default.server.tsx    → Default View (each video in its "gallery" view)
    ├── featured.server.tsx   → Featured + Grid (large video + thumbnails)
    │   └── FeaturedGallery.island.client.tsx
    └── grid.server.tsx       → Grid View (cards that open a modal player)
        └── VideoModal.island.client.tsx
In edit mode every view renders each video in its own "gallery" view (VideoList.tsx), so Page
Builder can select it.
```

## Data Flow

### Image Gallery
```
┌──────────────┐
│Content Editor│
└──────┬───────┘
       │ Select images or folder
       ▼
┌──────────────────┐
│ImageGallery Props│
│  - images[]      │
│  - title         │
│  - bannerText    │
└────────┬─────────┘
         │
    ┌────┴────┐
    │  View   │ (grid/masonry/carousel)
    └────┬────┘
         │
    ┌────▼────┐
    │ Render  │
    │ Images  │
    └─────────┘
```

### Video Gallery with External Videos
```
┌──────────────┐
│Content Editor│
└──────┬───────┘
       │ Add videos, select service
       ▼
┌──────────────────────┐
│ExternalVideo Props   │
│  - videoService      │
│  - videoId           │
│  - videoPoster       │
│  - featured (bool)   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│Islands + src/utils   │
│  - video.ts: parse   │
│    ids and addresses │
│  - useThumbnail      │
│  - VideoFrame: embed │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│Render iframe/preview │
└──────────────────────┘
```

## Server vs Client Architecture

### Server-Side Rendering (SSR)
```
┌─────────────────────────────────────┐
│  *.server.tsx                       │
│                                     │
│  - Renders initial HTML             │
│  - Fetches data from Jahia          │
│  - No browser APIs                  │
│  - SEO-friendly                     │
│  - Fast initial load                │
└─────────────────────────────────────┘
```

### Client Islands (Hydration)
```
┌─────────────────────────────────────┐
│  *.island.client.tsx                │
│                                     │
│  - Interactive components           │
│  - Uses React hooks                 │
│  - Browser APIs allowed             │
│  - Event handlers                   │
│  - Hydrates after initial render    │
└─────────────────────────────────────┘
```

## File Organization Pattern

```
Component/
├── definition.cnd              # Jahia node type & properties
├── types.ts                    # TypeScript interfaces
├── default.server.tsx          # Default server view
├── [viewName].server.tsx       # Additional views
├── [feature].island.client.tsx # Client-side interactivity
└── Component.module.css        # Scoped styles
```

## Settings Structure

```
settings/
├── definitions.cnd                    # Shared mixins ONLY
│   ├── jsmediagallerymix:component
│   └── jsmediagallerymix:linkTo       # Jahia's native link type (hero)
│                                      # (directoryLink / imagesLink: ImageGallery/definition.cnd)
├── content-editor-forms/
│   └── fieldsets/
│       └── jsmediagallerynt_imageGallery.json   # gallery type choice (adds the mixin)
│
├── locales/
│   ├── en.json                        # View labels
│   └── fr.json
│
└── resources/
    ├── js-media-gallery_en.properties # Editor labels
    └── js-media-gallery_fr.properties
```

## CSS Module Pattern

```
Component.module.css
    ↓ (imported as)
import classes from './Component.module.css'
    ↓ (used as)
<div className={classes.root}>
    ↓ (becomes at runtime)
<div class="Component_root_abc123">
```

Benefits:
- ✅ Scoped (no global conflicts)
- ✅ Type-safe (with TS plugin)
- ✅ Tree-shakeable
- ✅ Easy to maintain

## Video Service Integration Flow

```
External Video Component
    │
    ├─→ YouTube
    │    ├─ Thumbnail: i.ytimg.com/vi/{id}/hqdefault.jpg
    │    └─ Embed: youtube-nocookie.com/embed/{id}
    │
    ├─→ Vimeo
    │    ├─ Thumbnail: vimeo.com/api/v2/video/{id}.json (oEmbed for an unlisted video)
    │    └─ Embed: player.vimeo.com/video/{id} (?h={key} for an unlisted video)
    │
    ├─→ Wistia
    │    ├─ Thumbnail: fast.wistia.com/embed/medias/{id}/swatch
    │    └─ Embed: fast.wistia.net/embed/iframe/{id}
    │
    ├─→ Dailymotion
    │    ├─ Thumbnail: dailymotion.com/thumbnail/video/{id}
    │    └─ Embed: dailymotion.com/embed/video/{id}
    │
    └─→ Storylane
         ├─ Thumbnail: oEmbed metadata (first frame)
         └─ Embed: jahia.storylane.io/demo/{id} (in a modal dialog)

All of it lives in src/utils/video.ts, covered by src/utils/video.test.ts.
```

## Build & Deploy Pipeline

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   Edit   │ -> │  Build   │ -> │ Package  │ -> │  Deploy  │
│   Code   │    │  (Vite)  │    │  (yarn)  │    │  (Jahia) │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
     │               │                │                │
     │               ├─ TypeScript    │                │
     │               ├─ CSS Modules   │                │
     │               └─ JSX           │                │
     │                                │                │
     └─ src/                          └─ dist/         └─ Jahia CMS
        components/                      package.tgz
```

## Component Communication

### Parent → Child (Props)
```typescript
// Server view passes serializable data down
<Island component={VideoModal} props={{ videos, headingLevel: itemLevel }} />
```

### Child → Parent (Callbacks)
```typescript
// Inside an island, children report back through callbacks
<VideoCard video={video} onOpen={(opener) => open(video, opener)} />
```

### Global State (Context)
```typescript
// Server context
import { useServerContext } from '@jahia/javascript-modules-library';
const { locale, site } = useServerContext();
```

## Performance Optimizations

### Image Loading
```
┌─────────────┐
│ Lazy Load   │ (loading="lazy")
│ Images      │
└─────────────┘
      │
      ▼
┌─────────────┐
│ Load when   │
│ in viewport │
└─────────────┘
```

### Video Loading
```
┌─────────────┐
│ Show        │
│ Thumbnail   │
└─────┬───────┘
      │ Click
      ▼
┌─────────────┐
│ Load iframe │
│ with video  │
└─────────────┘
```

### Code Splitting
```
Server Views (SSR)
    └─ Always loaded

Client Islands (Hydration)
    └─ Loaded only when needed
```

---

This architecture follows Jahia JavaScript Module best practices while maintaining modern web development standards.
