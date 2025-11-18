# Jahia File URL Building Pattern

## Overview

When working with file references (from `weakreference` picker) in Jahia JavaScript Modules, URLs must be built manually using the `/files/{mode}/{path}` pattern.

## The Pattern

### Basic Structure

```
/files/{mode}/{jcrPath}
```

Where:

- `mode` = `"live"` for published content, `"default"` for edit/preview mode
- `jcrPath` = The JCR path from `fileNode.path`

### Helper Function

```typescript
const buildFileUrl = (fileNode: { path: string } | undefined) => {
  if (!fileNode?.path) return undefined;
  return `/files/default${fileNode.path}`;
};
```

### With Mode Detection (Optional)

```typescript
const buildFileUrl = (fileNode: { path: string } | undefined, renderContext?: any) => {
  if (!fileNode?.path) return undefined;
  const mode = renderContext?.getMode?.() ?? (renderContext?.isEditMode?.() ? "edit" : "live");
  const segment = mode === "live" ? "live" : "default";
  return `/files/${segment}${fileNode.path}`;
};
```

## Implementation in This Module

### 1. InternalVideo Component

```typescript
const buildFileUrl = (fileNode: { path: string } | undefined) => {
  if (!fileNode?.path) return undefined;
  return `/files/default${fileNode.path}`;
};

const videoUrl = buildFileUrl(video);
const posterUrl = buildFileUrl(videoPoster);

<video controls poster={posterUrl}>
  <source src={videoUrl} type="video/mp4" />
</video>
```

### 2. VideoHeading Component

```typescript
const videoUrl = buildFileUrl(video);

<video autoPlay muted loop playsInline>
  <source src={videoUrl} type="video/mp4" />
</video>
```

### 3. VideoGallery Components

Transform videos before passing to Island:

```typescript
const transformVideo = (video: VideoItem): VideoItem => ({
  ...video,
  video: video.video
    ? { ...video.video, url: buildFileUrl(video.video) || video.video.url }
    : undefined,
  videoPoster: video.videoPoster
    ? { ...video.videoPoster, url: buildFileUrl(video.videoPoster) || video.videoPoster.url }
    : undefined,
});

const transformedVideos = videos.map(transformVideo);
```

### 4. ExternalVideo Component

```typescript
const posterUrl = buildFileUrl(videoPoster);

<Island component={ExternalVideoPlayer} props={{ posterUrl }}>
  <div>
    {posterUrl && <img src={posterUrl} alt="Video" />}
  </div>
</Island>
```

## Why This Pattern?

1. **File objects have `.path` property** - The weakreference picker returns objects with a `path` property containing the JCR path
2. **No direct URL** - Unlike external URLs, internal file references don't have a direct `.url` property that works
3. **Mode-dependent routing** - Jahia routes requests differently based on whether content is published (live) or being edited (default)
4. **Security & Permissions** - The `/files/` servlet handles proper access control and permissions

## Reference

This pattern is used consistently across the `employee-portal` reference module:

- `NewsArticle/fullPage.server.tsx`
- `Training/utils.ts`
- `Hero/default.server.tsx`
- `CafeteriaMenu/utils.ts`

## Key Points

- Always check if `fileNode?.path` exists before building URL
- Use `"default"` mode for edit/preview contexts (safest default)
- Use `"live"` mode only when rendering published content
- Server components should build URLs before passing to Island components
- The path already includes the leading `/`, so URL becomes `/files/default/path/to/file.mp4`
