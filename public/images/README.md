# Images Directory

Place your images in the following structure:

## Directory Structure

```
public/
  images/
    logo/
      logo.png (or logo.svg) - Main logo for navigation
      logo-white.png - White version of logo
      favicon.ico - Site favicon
    portfolio/
      - Place portfolio project images here
      - Name them: project-1.jpg, project-2.jpg, etc.
    services/
      - Service category images
      - mlo.jpg, shell.jpg, chain.jpg, tattoo.jpg, face.jpg, other.jpg
    blog/
      - Blog post featured images
    hero/
      - Hero section background images (optional)
    testimonials/
      - Client photos (optional)
```

## Image Guidelines

- **Logo**: Recommended size 200x50px (or similar aspect ratio), PNG or SVG format
- **Portfolio Images**: Recommended size 1200x800px, JPG or PNG format
- **Service Images**: Recommended size 800x600px, JPG or PNG format
- **Blog Images**: Recommended size 1200x630px, JPG or PNG format

## Supported Formats

- PNG (recommended for logos and graphics with transparency)
- JPG (recommended for photos)
- SVG (recommended for logos and icons)
- WebP (automatically optimized by Next.js)

## Usage

Images placed in the `public/images/` directory can be referenced as:
- `/images/logo/logo.png`
- `/images/portfolio/project-1.jpg`
- etc.

