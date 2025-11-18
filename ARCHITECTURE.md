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
    ├── grid.server.tsx       → Grid View (responsive cards)
    ├── masonry.server.tsx    → Masonry Layout (waterfall)
    └── carousel.server.tsx   → Carousel (auto-play slider)
        └── carousel.island.client.tsx (interactivity)
```

### Video Gallery Views
```
VideoGallery Component
    ├── featured.server.tsx   → Featured + Grid (large video + thumbnails)
    └── grid.server.tsx       → Grid View (uniform grid)
        └── VideoPlayer.island.client.tsx (video playback)
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
│VideoPlayer.island    │
│  - Fetch thumbnail   │
│  - Generate embed URL│
│  - Handle play/pause │
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
│   ├── jsmediagallerymix:galleryType
│   ├── jsmediagallerymix:directoryLink
│   └── jsmediagallerymix:imagesLink
│
├── content-editor-forms/
│   └── fieldsets/
│       ├── jsmediagallerynt_externalVideo.json
│       └── jsmediagallerymix_galleryType.json
│
├── locales/
│   └── en.json                        # Client i18n
│
└── resources/
    └── en.properties                  # Server labels
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
    │    ├─ Thumbnail: img.youtube.com/vi/{id}/maxresdefault.jpg
    │    └─ Embed: youtube.com/embed/{id}
    │
    ├─→ Vimeo
    │    ├─ Thumbnail: API call to vimeo.com/api/v2/video/{id}.json
    │    └─ Embed: player.vimeo.com/video/{id}
    │
    ├─→ Wistia
    │    ├─ Thumbnail: fast.wistia.com/embed/medias/{id}/swatch
    │    └─ Embed: fast.wistia.net/embed/iframe/{id}
    │
    └─→ Dailymotion
         ├─ Thumbnail: dailymotion.com/thumbnail/video/{id}
         └─ Embed: dailymotion.com/embed/video/{id}
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
// Server view passes data down
<Hydrate 
  component="VideoPlayer.island.client.tsx"
  props={{ video, autoplay: false }}
/>
```

### Child → Parent (Callbacks)
```typescript
// Client component uses callbacks
interface Props {
  onVideoPlay?: () => void;
}

// Usage
<VideoPlayer onVideoPlay={() => console.log('Playing!')} />
```

### Global State (Context)
```typescript
// Server context
import { useServerContext } from '@jahia/javascript-modules-library/server';
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
