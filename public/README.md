# Public Assets Directory

This directory contains static assets that are served directly by the web server.

## Directory Structure

- `images/` - Static images (PNG, JPG, GIF, SVG)
- `icons/` - Icon files (SVG, ICO, PNG)
- `videos/` - Video files (MP4, WebM, MOV)
- `fonts/` - Custom font files (WOFF, WOFF2, TTF, OTF)
- `logos/` - Brand logos and graphics

## Usage

Files in this directory can be referenced directly in your React components using absolute paths:

```jsx
// Example usage
<img src="/images/hero-banner.jpg" alt="Hero Banner" />
<video src="/videos/demo.mp4" controls />
```

## Best Practices

1. **Optimize images** - Use appropriate formats and compression
2. **Use descriptive names** - Make file names clear and meaningful
3. **Organize by type** - Keep related assets in appropriate subdirectories
4. **Consider CDN** - For production, consider serving assets from a CDN

## File Naming Convention

- Use lowercase letters
- Use hyphens for word separation
- Include descriptive prefixes when helpful
- Examples: `hero-banner.jpg`, `logo-adbuddy.svg`, `icon-upload.png`
