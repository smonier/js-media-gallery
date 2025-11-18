# JSON Overrides Guide

This document explains how we replaced the deprecated `ChoiceListInitializer` with modern JSON overrides.

## Old Pattern (Deprecated)

```cnd
[jsmediagallerynt:externalVideo] > jnt:content, mix:title
 - videoService(string, choicelist[myCustomInitializer,resourceBundle]) = 'youtube' mandatory
```

With a Java class:
```java
public class MyCustomInitializer implements ChoiceListInitializer {
    // Java implementation
}
```

## New Pattern (Recommended)

### 1. Clean CND Definition

```cnd
[jsmediagallerynt:externalVideo] > jnt:content, mix:title
 - videoService(string, choicelist[resourceBundle]) = 'youtube' mandatory < youtube, vimeo, wistia, dailymotion
```

### 2. JSON Override File

Create `settings/content-editor-forms/jsmediagallerynt_externalVideo.json`:

```json
{
  "nodeType": "jsmediagallerynt:externalVideo",
  "fields": [
    {
      "name": "videoService",
      "selectorType": "Choicelist",
      "valueConstraints": [
        {
          "value": {
            "string": "youtube"
          },
          "displayValue": "YouTube",
          "properties": {}
        },
        {
          "value": {
            "string": "vimeo"
          },
          "displayValue": "Vimeo",
          "properties": {}
        }
      ]
    }
  ]
}
```

### 3. Resource Bundle

In `settings/resources/en.properties`:

```properties
jsmediagallerynt_externalVideo.videoService=Video Service
jsmediagallerynt_externalVideo.videoService.youtube=YouTube
jsmediagallerynt_externalVideo.videoService.vimeo=Vimeo
```

## Benefits

1. **No Java Code**: Pure configuration, no compilation needed
2. **Version Control**: JSON files are easier to track and merge
3. **Dynamic Updates**: Can be modified without recompiling
4. **Clearer Structure**: All UI configuration in one place
5. **Better Maintainability**: Non-developers can update labels

## Field Types

### Dropdown (Single Select)
```json
{
  "name": "fieldName",
  "selectorType": "Dropdown",
  "valueConstraints": [...]
}
```

### Checkbox (Multiple Select)
```json
{
  "name": "fieldName",
  "selectorType": "Checkbox",
  "valueConstraints": [...]
}
```

### Radio Buttons
```json
{
  "name": "fieldName",
  "selectorType": "RadioButton",
  "valueConstraints": [...]
}
```

## Conditional Display

You can show/hide fields based on other field values:

```json
{
  "name": "imagesList",
  "displayConditions": [
    {
      "property": "imgGalleryType",
      "value": "imgFile"
    }
  ]
}
```

## Complete Example: Gallery Type

### CND
```cnd
[jsmediagallerymix:galleryType] mixin
 - imgGalleryType (string, choicelist[resourceBundle]) indexed=no < 'imgDirectory', 'imgFile'
```

### JSON Override
```json
{
  "nodeType": "jsmediagallerymix:galleryType",
  "fields": [
    {
      "name": "imgGalleryType",
      "selectorType": "Choicelist",
      "valueConstraints": [
        {
          "value": {
            "string": "imgDirectory"
          },
          "displayValue": "From Directory",
          "properties": {}
        },
        {
          "value": {
            "string": "imgFile"
          },
          "displayValue": "Select Images",
          "properties": {}
        }
      ]
    }
  ]
}
```

### Resource Bundle
```properties
jsmediagallerymix_galleryType.imgGalleryType=Gallery Type
jsmediagallerymix_galleryType.imgGalleryType.imgDirectory=From Directory
jsmediagallerymix_galleryType.imgGalleryType.imgFile=Select Images
```

## Migration Checklist

When converting from ChoiceListInitializer to JSON overrides:

- [ ] Remove Java ChoiceListInitializer class
- [ ] Update CND to use `choicelist[resourceBundle]` only
- [ ] Add value constraints in CND with `< value1, value2`
- [ ] Create JSON override file in `settings/content-editor-forms/`
- [ ] Update resource bundle with display labels
- [ ] Test in content editor
- [ ] Remove old Java dependencies

## References

- Jahia JavaScript Module Guide
- Content Editor Forms Documentation
- This module implementation as reference
