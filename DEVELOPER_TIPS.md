# Developer Tips & Best Practices

## Working with Video Services

### Getting Video IDs

#### YouTube
1. Open video: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
2. Video ID is the part after `v=`: **dQw4w9WgXcQ**

Or from share link: `https://youtu.be/dQw4w9WgXcQ`
Video ID: **dQw4w9WgXcQ**

#### Vimeo
1. Open video: `https://vimeo.com/123456789`
2. Video ID is the number: **123456789**

#### Wistia
1. From embed code: `<script src="...medias/abc123xyz..."`
2. Video ID: **abc123xyz**

Or from URL: `https://yourcompany.wistia.com/medias/abc123xyz`

#### Dailymotion
1. Open video: `https://www.dailymotion.com/video/x8abcde`
2. Video ID: **x8abcde**

## Customizing Styles

### Brand Colors
Edit CSS modules to match your brand:

```css
/* ImageGallery.module.css */
.gridItem:hover {
  box-shadow: 0 4px 16px rgba(YOUR_BRAND_COLOR);
}

/* VideoHeading.module.css */
.placeholder {
  background: linear-gradient(135deg, #YOUR_COLOR1 0%, #YOUR_COLOR2 100%);
}
```

### Layout Adjustments

#### Grid Item Sizes
```css
/* ImageGallery.module.css - Grid View */
.grid {
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  /* Change 250px to your preferred min width */
}
```

#### Video Aspect Ratios
```css
/* VideoGallery.module.css */
.videoPlayer {
  padding-bottom: 56.25%; /* 16:9 */
  /* Other options:
     75% = 4:3
     100% = 1:1 (square)
     177.78% = 9:16 (vertical) */
}
```

## Content Editor Tips

### Image Gallery Best Practices
1. **Use consistent image sizes** for best grid display
2. **Optimize images** before upload (recommended max width: 2000px)
3. **Add alt text** (`jcr:title`) to images for SEO
4. **Choose Masonry** for varying image sizes
5. **Use Carousel** for featured/hero content

### Video Gallery Best Practices
1. **Mark one video as Featured** for better hierarchy
2. **Add custom thumbnails** for branded appearance
3. **Keep video IDs accurate** - test each one
4. **Use item width** to control grid density (150-400px recommended)

### Video Poster Images
Custom thumbnails improve loading appearance:
1. Upload image at 16:9 ratio (1920x1080 or 1280x720)
2. Use engaging frame from video
3. Add text overlay if needed (external tool)

## Performance Tips

### Image Optimization
```bash
# Recommended image sizes
- Thumbnails: 400x300px
- Gallery images: 1200x900px
- Hero images: 2000x1500px
```

### Video Recommendations
- **Internal videos**: Use MP4 with H.264 codec
- **Max file size**: 50MB for web
- **Encoding**: Use video compression tools
- **Alternative**: Consider external hosting for large videos

## Troubleshooting

### Video Doesn't Play
1. Check video ID is correct
2. Verify video is public/embeddable
3. Check browser console for errors
4. Test video URL directly

### Thumbnails Not Loading
1. **YouTube**: Should auto-load
2. **Vimeo**: Check video is public
3. **Custom**: Verify image picker selection
4. Check network tab for 404 errors

### Carousel Not Working
1. Ensure JavaScript is loaded
2. Check browser console for errors
3. Verify multiple images are present
4. Test in preview mode, not edit mode

### Styling Issues
1. Clear browser cache
2. Check CSS module import paths
3. Verify Vite build completed
4. Check for CSS conflicts with global styles

## Advanced Customization

### Adding New Video Service

1. **Update Definition**:
```cnd
// ExternalVideo/definition.cnd
- videoService(string, choicelist[resourceBundle]) = 'youtube' mandatory 
  < youtube, vimeo, wistia, dailymotion, YOUR_NEW_SERVICE
```

2. **Update JSON Override**:
```json
// settings/content-editor-forms/fieldsets/jsmediagallerynt_externalVideo.json
{
  "value": { "string": "YOUR_NEW_SERVICE" },
  "displayValue": "Your Service Name",
  "properties": {}
}
```

3. **Update TypeScript**:
```typescript
// ExternalVideo/types.ts
videoService: "youtube" | "vimeo" | "wistia" | "dailymotion" | "YOUR_NEW_SERVICE";
```

4. **Update Player Logic**:
```typescript
// ExternalVideo/ExternalVideoPlayer.island.client.tsx
case "YOUR_NEW_SERVICE":
  embedUrl = `https://your-service.com/embed/${videoId}`;
  break;
```

5. **Add Resource Bundle**:
```properties
# settings/resources/en.properties
jsmediagallerynt_externalVideo.videoService.YOUR_NEW_SERVICE=Your Service Name
```

### Creating New View Types

Example: Adding a "Slider" view to ImageGallery:

1. **Create Server View**:
```typescript
// src/components/ImageGallery/slider.server.tsx
export default jahiaComponent<ImageGalleryProps>(
  {
    componentType: "view",
    nodeType: "jsmediagallerynt:imageGallery",
    name: "slider",
    displayName: "Slider View",
  },
  (props) => {
    // Your implementation
  }
);
```

2. **Add Styles**:
```css
/* ImageGallery.module.css */
.slider { /* your styles */ }
```

3. **Update Localization**:
```properties
# settings/resources/en.properties
jsmediagallerynt_imageGallery.slider=Slider View
```

## Testing Checklist

Before deploying:
- [ ] Test all gallery views (Grid, Masonry, Carousel)
- [ ] Test each video service (YouTube, Vimeo, etc.)
- [ ] Verify responsive behavior on mobile
- [ ] Check browser console for errors
- [ ] Test in both edit and preview modes
- [ ] Verify featured video highlighting
- [ ] Test keyboard navigation
- [ ] Check accessibility with screen reader

## Deployment

```bash
# Build
yarn build

# Deploy to Jahia
yarn deploy

# Or combined
yarn watch:callback
```

## Getting Help

1. Check `MODULE_README.md` for overview
2. Review `IMPLEMENTATION_SUMMARY.md` for architecture
3. See Jahia JavaScript Module Guide
4. Check component-specific comments in code

## Common Patterns

### Conditional Rendering
```typescript
{video?.url && (
  <video src={video.url} />
)}
```

### Rich Text Output
```typescript
<div dangerouslySetInnerHTML={{ __html: caption }} />
```

### CSS Module Classes
```typescript
import classes from "./Component.module.css";
<div className={classes.myClass} />
```

### Multiple Classes
```typescript
className={`${classes.base} ${isActive ? classes.active : ''}`}
```

---

**Happy coding!** 🎨📹
