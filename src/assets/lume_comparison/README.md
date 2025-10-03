# Lume Comparison Images

This directory contains images for the lume comparison slideshow.

## Adding Images

1. Add your images to this directory (supported formats: `.jpg`, `.png`)
2. The slideshow will automatically detect images named:
   - `image1.jpg`, `image2.jpg`, `image3.jpg`, etc.
   - `image1.png`, `image2.png`, `image3.png`, etc.

## Custom Captions

To add custom captions, edit `/src/js/lume-comparison.js` and modify the `images` array:

```javascript
const images = [
    { src: '/assets/lume_comparison/gen-vs-rep.jpg', caption: 'Gen vs Rep - Side by side comparison' },
    { src: '/assets/lume_comparison/closeup.jpg', caption: 'Close-up of lume application' },
    { src: '/assets/lume_comparison/brightness.jpg', caption: 'Lume brightness test after 5 minutes' },
];
```

## Features

- **Grid View**: Images display in a responsive grid on the page
- **Lightbox Modal**: Click any image to view full-screen
- **Navigation Arrows**: Use arrows to cycle through images in the modal
- **Keyboard Support**: 
  - `←` / `→` arrows to navigate
  - `Esc` to close
- **Captions**: Each image shows its caption in the modal
- **Mobile Responsive**: Optimized for mobile viewing
