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
