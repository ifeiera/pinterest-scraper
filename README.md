<br />
<div align="center">
  <a href="https://github.com/ifeiera/pinterest-scraper">
    <img src="https://i.pinimg.com/736x/4e/2c/e4/4e2ce4f48dc8a7151fb82b13174626d1.jpg" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Pinterest Image Downloader API</h3>

  <p align="center">
    This is a simple API for downloading Pinterest images in their best quality. Created because Pinterest's default download is absolute garbage - giving you potato quality images        and sometimes random non-image files.
  </p>
  </br>
</div>

## Why This Exists?
Let's face it - Pinterest's default download feature sucks. It's frustrating as hell when you find that perfect image, hit download, and get some crappy low-res version instead of the crisp, high-quality original. This API fixes that BS by always fetching the best possible version of any Pinterest image.

This API was specifically built to power the [Pinterest Downloader Extension](repository-url-here) - a browser extension that makes downloading high-quality Pinterest images actually bearable. Check out the extension repo for the complete solution!

## Features
- 🔍 Get complete Pinterest pin details
- 📥 Download images in various sizes:
  - HD/Original quality (best quality available)
  - 736x resolution (large)
  - 474x resolution (medium)
  - 236x resolution (small)

> **⚠️ Current Limitations**: 
> - Only works with single-image pins
> - No support for video pins
> - No support for carousel/slider pins
> - No support for GIFs or animated content
>
> These features might be added when there's time and energy to deal with Pinterest's messy HTML structure.

## API Endpoints

### Get Pin Details
```
GET /pin/:id
```
Returns all available information about a Pinterest pin, including all possible image URLs.

### Download Image
```
GET /pin/:id/download
GET /pin/:id/download?size=[size]
```
Downloads the image in the specified size. The size parameter is optional - without it, the API will try to get the HD/original version. If that's not available, it'll fall back to the next best quality (because that's how it should work).

Available sizes:
- `hd` (default) - Original/highest quality
- `x736` - Large thumbnail
- `x474` - Medium thumbnail
- `x236` - Small thumbnail (why would you even want this?)

> **Note about HD/Original quality**: The final image quality depends on what was uploaded to Pinterest. If someone uploaded a potato quality image, there's no magic wand to make it HD. The API will get you the best version available, but can't fix what's already broken.

## Getting Started

### Prerequisites
- [Bun](https://bun.sh) runtime installed on your system

### Quick Setup
```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
bun install
```

### Running the Server

For development (with hot reload):
```bash
bun run dev
```

For production:
```bash
bun run start
```

The server will start at `http://localhost:3000` by default. To use different settings, configure these environment variables:
- `PORT` - Change the port (default: 3000)
- `HOST` - Change the host (default: 0.0.0.0)
