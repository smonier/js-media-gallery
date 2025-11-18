# Quick Start Guide

Get your Media Gallery module up and running in minutes!

## 1. Build the Module

```bash
cd /Users/stephane/Runtimes/0.Modules/js-media-gallery
yarn install
yarn build
```

## 2. Deploy to Jahia

```bash
yarn deploy
```

Or use watch mode for development:
```bash
yarn watch:callback
```

## 3. Using the Components

### Image Gallery

1. **In Jahia Content Editor**, add component: `Image Gallery`
2. **Set Gallery Type**:
   - "From Directory" - select a folder with images
   - "Select Images" - pick individual images
3. **Add Title and Banner Text** (optional)
4. **Choose View**:
   - Grid View - even card layout
   - Masonry - Pinterest style
   - Carousel - auto-playing slider

### Video Gallery

1. **Add component**: `Video Gallery`
2. **Add child videos**:
   - Internal Video - for hosted videos
   - External Video - for YouTube, Vimeo, etc.
3. **For external videos**:
   - Select service (YouTube, Vimeo, Wistia, Dailymotion)
   - Enter Video ID
   - Optional: Upload custom poster image
4. **Mark one as Featured** (optional)
5. **Choose View**:
   - Featured + Grid - highlight one video
   - Grid View - uniform grid

### Video Hero Banner

1. **Add component**: `Video Hero Banner`
2. **Upload video file**
3. **Add title and caption**
4. **Optional**: Add CTA button with link
5. Video will auto-play on loop in background

## 4. Component Hierarchy

```
Page/Area
├── Image Gallery
│   └── (images from folder or selection)
│
├── Video Gallery
│   ├── Internal Video
│   ├── External Video
│   └── External Video (marked as featured)
│
└── Video Hero Banner
```

## 5. Quick Examples

### Example 1: Photo Gallery
```
Component: Image Gallery
- Gallery Type: Select Images
- Images: [photo1.jpg, photo2.jpg, photo3.jpg]
- View: Masonry
```

### Example 2: YouTube Playlist
```
Component: Video Gallery
├── External Video 1
│   - Service: YouTube
│   - Video ID: dQw4w9WgXcQ
│   - Featured: Yes
├── External Video 2
│   - Service: YouTube
│   - Video ID: abc123xyz
└── External Video 3
    - Service: YouTube
    - Video ID: def456uvw
View: Featured + Grid
```

### Example 3: Landing Page Hero
```
Component: Video Hero Banner
- Video: hero-background.mp4
- Title: "Welcome to Our Site"
- Caption: "Discover amazing content"
- Link: /about
- Link Text: "Learn More"
```

## 6. Video Service IDs Reference

| Service | Example URL | Video ID |
|---------|-------------|----------|
| YouTube | `youtube.com/watch?v=ABC123` | `ABC123` |
| Vimeo | `vimeo.com/123456789` | `123456789` |
| Wistia | `wistia.com/medias/abc123` | `abc123` |
| Dailymotion | `dailymotion.com/video/x8abc` | `x8abc` |

## 7. Common Tasks

### Change Grid Item Size
Edit `itemWidth` property in Video Gallery (default: 250px)

### Customize Colors
Edit the `.module.css` files in each component folder

### Add More Languages
1. Copy `settings/locales/en.json` to `fr.json`
2. Copy `settings/resources/en.properties` to `fr.properties`
3. Translate the values

### Update Video Services
Edit `settings/content-editor-forms/fieldsets/jsmediagallerynt_externalVideo.json`

## 8. Troubleshooting

**Module doesn't appear in Jahia?**
- Run `yarn build` first
- Check Jahia logs for errors
- Verify module is deployed

**TypeScript errors?**
- Normal during development
- Will resolve when deployed in Jahia
- Module will build successfully

**Video doesn't play?**
- Check video ID is correct
- Verify video is public/embeddable
- Test video URL in browser

**Carousel not working?**
- Ensure JavaScript loaded
- Check browser console
- Need at least 2 images

## 9. File Structure Quick Reference

```
js-media-gallery/
├── src/components/          ← Your components
│   ├── ImageGallery/
│   ├── VideoGallery/
│   ├── InternalVideo/
│   ├── ExternalVideo/
│   └── VideoHeading/
├── settings/               ← Configuration
│   ├── definitions.cnd
│   ├── content-editor-forms/
│   ├── locales/
│   └── resources/
├── MODULE_README.md        ← Full documentation
├── IMPLEMENTATION_SUMMARY.md
├── DEVELOPER_TIPS.md
└── QUICK_START.md         ← You are here!
```

## 10. Next Steps

1. ✅ Build and deploy (steps 1-2)
2. 📝 Create sample content in Jahia
3. 🎨 Customize styles to match brand
4. 🌍 Add more languages if needed
5. 📚 Read full docs for advanced features

## Support

- **Full docs**: See `MODULE_README.md`
- **Developer tips**: See `DEVELOPER_TIPS.md`
- **Architecture**: See `IMPLEMENTATION_SUMMARY.md`
- **Jahia guide**: Check the Jahia JavaScript Module Guide

---

**You're ready to go!** 🚀

Build → Deploy → Create Content → Enjoy!
