# Image Guidelines for Stichting De Raam

This directory contains images used throughout the website. Follow these guidelines for optimal display and performance.

## Directory Structure

```
public/images/
├── gallery/          # Gallery and showcase photos
├── watermarks/       # Pre-watermarked versions (optional)
├── placeholder.svg   # Default placeholder image
└── README.md        # This file
```

## Recommended Image Specifications

### Homepage Hero Images
- **Dimensions**: 1920 × 1080 pixels (landscape)
- **Format**: JPG or WebP
- **Max file size**: 500KB
- **Naming**: `hero-{description}.jpg`
- **Examples**: `hero-arena.jpg`, `hero-horses.jpg`

### Facility Photos
- **Dimensions**: 1200 × 800 pixels (3:2 ratio)
- **Format**: JPG or WebP
- **Max file size**: 300KB
- **Naming**: `facility-{name}.jpg`
- **Examples**: `facility-indoor-arena.jpg`, `facility-outdoor-ring.jpg`, `facility-canteen.jpg`

### Competition/Event Photos
- **Dimensions**: 1200 × 800 pixels (3:2 ratio)
- **Format**: JPG or WebP
- **Max file size**: 300KB
- **Naming**: `event-{name}-{date}.jpg`
- **Examples**: `event-dressage-2024-01.jpg`, `event-summer-competition.jpg`

### Gallery Photos
- **Dimensions**: 800 × 600 pixels (4:3 ratio)
- **Format**: JPG or WebP
- **Max file size**: 200KB
- **Location**: `public/images/gallery/`
- **Naming**: `gallery-{number}.jpg` or descriptive names

## Watermarking

All images displayed on the website will automatically have the De Raam logo watermarked using the `WatermarkedImage` component. You can:

1. **Automatic watermarking**: Use the `WatermarkedImage` component (recommended)
   - Logo is overlaid dynamically on display
   - Original image remains unwatermarked
   - Watermark position and size can be customized

2. **Pre-watermarked images**: Place in `watermarks/` directory
   - Use if you prefer to watermark images beforehand
   - Name format: `watermarked-{original-name}.jpg`

## Image Optimization Tips

1. **Compress images** before uploading using tools like:
   - TinyPNG (https://tinypng.com)
   - Squoosh (https://squoosh.app)
   - ImageOptim (Mac)

2. **Use appropriate formats**:
   - JPG for photographs with many colors
   - WebP for better compression (supported in modern browsers)
   - PNG only for images requiring transparency

3. **Responsive images**: The website automatically serves appropriate sizes based on device

## Required Photos (Priority List)

### High Priority
- [ ] `hero-main.jpg` - Main homepage hero image (arena with horses)
- [ ] `facility-indoor-arena.jpg` - Interior of the 25×50m arena
- [ ] `facility-outdoor-ring.jpg` - Outdoor training ring (Z-ring)
- [ ] `facility-canteen.jpg` - Canteen interior

### Medium Priority
- [ ] `about-history.jpg` - Historical photo of the manege
- [ ] `event-competition.jpg` - Competition in progress
- [ ] Gallery images (6-12 photos showing various activities)

### Low Priority
- [ ] Seasonal photos
- [ ] Training session photos
- [ ] Additional facility details

## Usage in Code

```tsx
import { WatermarkedImage } from '@/components/ui/WatermarkedImage'

// Basic usage
<WatermarkedImage
  src="/images/facility-indoor-arena.jpg"
  alt="Binnenrijhal 25×50 meter"
  width={1200}
  height={800}
/>

// Custom watermark settings
<WatermarkedImage
  src="/images/hero-main.jpg"
  alt="Manege De Raam"
  fill
  watermarkPosition="bottom-right"
  watermarkSize="medium"
/>

// Disable watermark (for logos, icons, etc.)
<WatermarkedImage
  src="/images/logo.jpg"
  alt="Logo"
  width={200}
  height={200}
  showWatermark={false}
/>
```

## Notes

- All photos should be taken in good lighting conditions
- Avoid photos with identifiable people without consent
- Ensure photos represent the manege professionally
- Update this README if you add new image categories
