# Media Gallery Module for Jahia

A comprehensive, modern media gallery module featuring image galleries and video galleries with multiple viewing options and support for various video services.

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Get started in 5 minutes
- **[MODULE_README.md](./MODULE_README.md)** - Complete feature documentation
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Architecture and technical details
- **[DEVELOPER_TIPS.md](./DEVELOPER_TIPS.md)** - Best practices and customization guide

## ✨ Features

### Image Gallery

- Grid, Masonry, and Carousel views
- Directory or manual image selection
- Responsive design with smooth animations

### Video Gallery

- Featured + Grid and Grid views
- Support for YouTube, Vimeo, Wistia, Dailymotion, Storylane
- Internal video hosting
- Auto-thumbnail extraction with first-frame GIF processing

### Video Hero Banner

- Large video background (70% viewport height)
- Overlay text with CTA button
- Centered video with responsive design
- Perfect for landing pages

## Accessibility (RGAA 4.1.2 / WCAG 2.1 AA)

- Image text alternatives come from the **title** of each image in the media library. Give every image a title that describes it.
- Images and video cards are links (to the full-size image, the video file or the provider's page), so they work without JavaScript. With JavaScript they open a modal viewer or player: native `<dialog>`, named, focus kept inside, Escape and the close button close it, focus returns to the link.
- The carousel rotates only when the visitor has not asked for reduced motion, and has a visible pause button. In edit mode its slides are shown side by side.
- The hero background video is muted, starts only with JavaScript and without reduced motion, and has a pause button.
- Internal videos accept a **captions** file (WebVTT, one per language) and a **transcript**. External videos accept a transcript; turn their captions on at the provider.
- The external video ID field also accepts the address of the video on the selected service.
- Headings start at `h2` (galleries, hero) and follow the `headingLevel` Render parameter when a parent view passes one. Rich text headings are placed under the component heading.
- Colours are CSS custom properties (`--jsmg-*`, see `src/utils/ui.module.css`) that a host theme can map. Text that sits on the host page takes the host's text colour.

## 🚀 Quick Start

```bash
# Install dependencies
yarn install

# Build the module
yarn build

# Deploy to Jahia
yarn deploy
```

For Docker-based development environment:

```bash
# Start Jahia in Docker
docker compose up --wait

# Start dev mode with auto-rebuild
yarn dev
```

See [QUICK_START.md](./QUICK_START.md) for detailed setup instructions.

## 📦 Component Structure

```
src/components/
├── ImageGallery/          # Grid, Masonry, Carousel views
├── VideoGallery/          # Featured + Grid, Grid views
├── InternalVideo/         # Hosted video player
├── ExternalVideo/         # YouTube, Vimeo, Wistia, Dailymotion, Storylane
└── VideoHeading/          # Video hero banner
```

Each component follows Jahia JavaScript Module best practices with:

- Component-level `definition.cnd`
- Server views (`.server.tsx`)
- Client islands (`.island.client.tsx`)
- CSS modules
- TypeScript types

## Commands

This module comes with some scripts to help you develop your module. You can run them with `yarn <script>`:

| Category     | Script                | Description                                                             |
| ------------ | --------------------- | ----------------------------------------------------------------------- |
| Build        | `build`               | Produces a deployable artifact that can be uploaded to a Jahia instance |
| Build        | `deploy`              | Pushes the build artifact to a Jahia instance                           |
| Development  | `dev` (alias `watch`) | Watches for changes and rebuilds the module                             |
| Code quality | `format`              | Runs Prettier (a code formatter) on your code                           |
| Code quality | `lint`                | Runs ESLint (a linter) on your code                                     |
| Utils        | `clean`               | Removes build artifacts                                                 |
| Utils        | `package`             | Packs distributions files in a `.tgz` archive inside the `dist/` folder |
| Utils        | `watch:callback`      | Called every time a build succeeds in watch mode                        |

## Configuration

If you don't use default configuration for the Docker container port and credentials, please modify the provided `.env` file.
