# Image Setup Guide for RoyalT Customz

This guide will help you add images, logos, and other visual assets to your website.

## 📁 Directory Structure

Create the following folders in the `public` directory:

```
public/
  images/
    logo/
      - logo.png (or logo.svg) - Main logo for navigation
      - logo-white.png - White version (optional)
      - favicon.ico - Browser favicon
    portfolio/
      - project-1.jpg
      - project-2.jpg
      - project-3.jpg
      - project-4.jpg
      - project-5.jpg
      - project-6.jpg
    services/
      - mlo.jpg
      - shell.jpg
      - chain.jpg
      - tattoo.jpg
      - face.jpg
      - other.jpg
    blog/
      - post-1.jpg
      - post-2.jpg
      - post-3.jpg
      - post-4.jpg
    marketplace/
      - premium.jpg
      - deluxe.jpg
      - ultimate.jpg
      - starter.jpg
    hero/
      - hero-bg.jpg - Hero section background image (recommended: 1920x1080px)
    testimonials/
      - client-1.jpg (optional client photos)
```

## 🖼️ Image Specifications

### Logo
- **Size**: 200x50px (or similar aspect ratio)
- **Format**: PNG (with transparency) or SVG
- **Location**: `public/images/logo/logo.png`
- **Note**: If no logo is provided, the text "RoyalT Customz" will be displayed

### Portfolio Images
- **Size**: 1200x800px (3:2 aspect ratio recommended)
- **Format**: JPG or PNG
- **Naming**: `project-1.jpg`, `project-2.jpg`, etc.
- **Location**: `public/images/portfolio/`

### Service Images
- **Size**: 800x600px (4:3 aspect ratio)
- **Format**: JPG or PNG
- **Naming**: `mlo.jpg`, `shell.jpg`, `chain.jpg`, `tattoo.jpg`, `face.jpg`, `other.jpg`
- **Location**: `public/images/services/`

### Blog Images
- **Size**: 1200x630px (1.91:1 aspect ratio - Facebook/Twitter card size)
- **Format**: JPG or PNG
- **Naming**: `post-1.jpg`, `post-2.jpg`, etc.
- **Location**: `public/images/blog/`

### Marketplace Images
- **Size**: 800x600px
- **Format**: JPG or PNG
- **Naming**: `premium.jpg`, `deluxe.jpg`, `ultimate.jpg`, `starter.jpg`
- **Location**: `public/images/marketplace/`

### Hero Background Image
- **Size**: 1920x1080px (Full HD) or larger
- **Format**: JPG (recommended for photos) or PNG
- **Naming**: `hero-bg.jpg`
- **Location**: `public/images/hero/`
- **Note**: This is the main background image for the homepage hero section. If not provided, the gradient background will be used.

## 🚀 Quick Start

1. **Add Your Logo**:
   - Place your logo file at `public/images/logo/logo.png`
   - The navigation will automatically use it
   - If the file doesn't exist, text logo will be shown

2. **Add Portfolio Images**:
   - Add your project images to `public/images/portfolio/`
   - Name them: `project-1.jpg`, `project-2.jpg`, etc.
   - Images will automatically appear in the portfolio page

3. **Add Service Images**:
   - Add service category images to `public/images/services/`
   - Name them according to the service: `mlo.jpg`, `shell.jpg`, etc.
   - These appear in the products and services sections

4. **Add Blog Images**:
   - Add featured images for blog posts to `public/images/blog/`
   - Name them: `post-1.jpg`, `post-2.jpg`, etc.

5. **Add Marketplace Images**:
   - Add product images to `public/images/marketplace/`
   - Name them: `premium.jpg`, `deluxe.jpg`, etc.

6. **Add Hero Background Image**:
   - Add your hero background image to `public/images/hero/`
   - Name it: `hero-bg.jpg`
   - This will be the background for the homepage hero section
   - If not provided, a gradient background will be used

## ✨ Features

- **Automatic Fallback**: If an image doesn't exist, a placeholder will be shown
- **Image Optimization**: Next.js automatically optimizes images for performance
- **Responsive**: Images automatically adapt to different screen sizes
- **Lazy Loading**: Images load as you scroll for better performance

## 🔧 Customization

### Changing Image Paths

If you want to use different image paths, update the image URLs in:

- **Portfolio**: `app/portfolio/page.tsx` - Update the `image` property in `portfolioItems`
- **Home Featured**: `app/page.tsx` - Update the `image` property in `featuredPortfolio`
- **Products**: `components/Products.tsx` - Update the `image` property in `products`
- **Blog**: `app/blog/page.tsx` - Update the `image` property in `blogPosts`
- **Escrow Items**: `components/EscrowItems.tsx` - Update the `image` property in `escrowItems`

### Adding More Images

To add more portfolio items or blog posts with images:

1. Add the image file to the appropriate directory
2. Update the data array in the component
3. Add the image path to the item's `image` property

Example:
```typescript
{
  id: 7,
  title: 'New Project',
  image: '/images/portfolio/project-7.jpg',
  // ... other properties
}
```

## 📝 Notes

- All images in the `public` folder are served from the root URL
- Use `/images/...` paths (not `./images/...` or `../images/...`)
- Images are automatically optimized by Next.js Image component
- Supported formats: JPG, PNG, WebP, AVIF, SVG
- For best performance, use WebP format when possible

## 🎨 Image Optimization Tips

1. **Compress Images**: Use tools like TinyPNG or ImageOptim before uploading
2. **Use Appropriate Sizes**: Don't upload images larger than needed
3. **Choose Right Format**: 
   - Use JPG for photos
   - Use PNG for graphics with transparency
   - Use SVG for logos and icons
4. **Optimize for Web**: Aim for file sizes under 500KB for best performance

## 🆘 Troubleshooting

**Images not showing?**
- Check that the file path is correct
- Ensure the file exists in the `public/images/` directory
- Check the browser console for errors
- Verify the file name matches exactly (case-sensitive)

**Logo not appearing?**
- Make sure the file is at `public/images/logo/logo.png`
- Check file permissions
- Try using a different format (PNG or SVG)

**Images loading slowly?**
- Optimize your images before uploading
- Use WebP format for better compression
- Check image file sizes

