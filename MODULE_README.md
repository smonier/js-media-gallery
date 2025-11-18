# Media Gallery Module for Jahia

A comprehensive, modern media gallery module for Jahia JavaScript Modules (JXM) featuring image galleries and video galleries with multiple viewing options and support for various video services.

## Features

### Image Gallery
- **Multiple View Types:**
  - **Grid View**: Responsive grid layout with hover effects
  - **Masonry Layout**: Pinterest-style waterfall layout
  - **Carousel**: Interactive slider with navigation controls
- **Two Content Sources:**
  - Select from a directory
  - Manually select individual images

### Video Gallery
- **Multiple View Types:**
  - **Featured + Grid**: Highlight one video with thumbnails below
  - **Grid View**: Uniform grid of video thumbnails
- **Video Types Supported:**
  - Internal hosted videos (MP4, WebM, OGG)
  - External services: YouTube, Vimeo, Wistia, Dailymotion
- **Featured Videos**: Mark videos as featured for special display
- **Auto-Thumbnail Extraction**: Automatically fetches thumbnails from video services

### Video Hero Banner
- Full-screen video background with overlay text
- Perfect for landing pages and marketing content
- Support for call-to-action buttons with links

## Component Structure

Following the Jahia JavaScript Module guide, each component has its own folder with:

```
src/components/
├── ImageGallery/
│   ├── definition.cnd              # Node type definitions
│   ├── types.ts                    # TypeScript interfaces
│   ├── grid.server.tsx             # Grid view
│   ├── masonry.server.tsx          # Masonry view
│   ├── carousel.server.tsx         # Carousel view
│   ├── carousel.island.client.tsx  # Client-side carousel logic
│   └── ImageGallery.module.css     # Styles
├── VideoGallery/
│   ├── definition.cnd
│   ├── types.ts
│   ├── featured.server.tsx         # Featured + grid view
│   ├── grid.server.tsx             # Grid view
│   ├── VideoPlayer.island.client.tsx # Video player logic
│   └── VideoGallery.module.css
├── InternalVideo/
│   ├── definition.cnd
│   ├── types.ts
│   ├── default.server.tsx
│   └── InternalVideo.module.css
├── ExternalVideo/
│   ├── definition.cnd
│   ├── types.ts
│   ├── default.server.tsx
│   ├── ExternalVideoPlayer.island.client.tsx
│   └── ExternalVideo.module.css
└── VideoHeading/
    ├── definition.cnd
    ├── types.ts
    ├── default.server.tsx
    └── VideoHeading.module.css
```

## Settings Structure

```
settings/
├── definitions.cnd                          # Shared mixins only
├── content-editor-forms/
│   ├── jsmediagallerynt_externalVideo.json # Video service dropdown
│   └── jsmediagallerymix_galleryType.json  # Gallery type dropdown
├── locales/
│   └── en.json                             # Client-side translations
└── resources/
    └── en.properties                       # Server-side resource bundle
```

## Key Improvements

### 1. Modern Content Editor Forms
Replaced deprecated `ChoiceListInitializer` with JSON overrides:
- `jsmediagallerynt_externalVideo.json` - Video service selection
- `jsmediagallerymix_galleryType.json` - Gallery type selection

### 2. Video Service Support
- YouTube with auto-thumbnail
- Vimeo with API thumbnail fetch
- Wistia with embed thumbnail
- Dailymotion with thumbnail support

### 3. Featured Video Support
Added `featured` boolean property to both internal and external videos for special highlighting in gallery views.

### 4. Responsive Design
All components use modern CSS with:
- CSS Grid for layouts
- CSS Custom Properties for theming
- Mobile-first responsive breakpoints
- Smooth transitions and animations

### 5. Accessibility
- ARIA labels on interactive elements
- Keyboard navigation support
- Semantic HTML structure
- Alt text for all images

## Usage

### Creating an Image Gallery
1. Add an Image Gallery component to your page
2. Choose gallery type (Directory or Select Images)
3. Select images or folder
4. Add optional title and banner text
5. Choose your preferred view (Grid, Masonry, or Carousel)

### Creating a Video Gallery
1. Add a Video Gallery component
2. Add Internal Video or External Video child components
3. For external videos, select service and enter video ID
4. Mark one video as "featured" for Featured + Grid view
5. Configure item width for grid layout

### Creating a Video Hero Banner
1. Add a Video Heading component
2. Select a video file
3. Add title and caption with rich text
4. Optionally add a CTA button with link

## Video Service IDs

### YouTube
- URL: `https://www.youtube.com/watch?v=VIDEO_ID`
- Use the `VIDEO_ID` part

### Vimeo
- URL: `https://vimeo.com/VIDEO_ID`
- Use the numeric `VIDEO_ID`

### Wistia
- Found in embed code: `medias/VIDEO_ID`

### Dailymotion
- URL: `https://www.dailymotion.com/video/VIDEO_ID`
- Use the `VIDEO_ID` part

## Development

### Build Commands
```bash
yarn dev         # Watch mode for development
yarn build       # Production build
yarn lint        # Run ESLint
yarn package     # Create deployment package
yarn deploy      # Deploy to Jahia
```

### TypeScript Errors
The TypeScript compilation errors shown during development are expected as the module depends on Jahia's runtime libraries (`@jahia/javascript-modules-library`). These will resolve when the module is built and deployed in the Jahia environment.

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ JavaScript features
- CSS Grid and Custom Properties

## License
Proprietary - Jahia Module

## Author
Generated following the Jahia JavaScript Module Guide
