# Solanam Image Processor As Browser Extension

## Tech Stack[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)


<div align="center">
  <img src="/public/cover.webp" alt="SolanaM Logo" height="400"/>
</div>
## Overview
The Solanam Image Processor is a professional image processing tool integrated into your browser, designed to enhance your workflow within the Solanam ecosystem. Developed by the team at [solaxnm](https://github.com/solaxnm), this extension is a part of the broader Solanam platform accessible at [solanam.com](https://solanam.com). It offers advanced image handling, cropping, and validation features to streamline your image processing tasks directly from your browser.


## Features
- **Image Validation**: Ensures files are of supported types (JPEG, PNG, WebP, GIF, BMP, TIFF, AVIF, SVG, ICO) and under 10MB.
- **File Handling**: Loads and processes image files, providing detailed metadata (name, size, type) with size formatted in human-readable units (e.g., KB, MB).
- **Crop Functionality**: Offers precise cropping with an interactive overlay, adjustable settings (x, y, width, height), and draggable/resizable crop boxes.
- **Background Service**: Runs background tasks to support extension operations seamlessly.
- **Content Script Integration**: Processes images on any webpage matching `<all_urls>` with context menu support.

## Installation
1. Clone the repository: `git clone https://github.com/solaxnm/solaxnm-extension.git`
2. Navigate to the project directory: `cd solaxnm-extension`
3. Install dependencies: `npm install`
4. Build the extension: `npm run build`
5. Load the extension in your browser:
   - Open Chrome/Edge: `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder

## Usage
- **Popup Interface**: Click the extension icon to open the popup, where you can upload images, view file info, and apply cropping.
- **Context Menu**: Right-click an image on any webpage to process it directly using the extension's context menu options.
- **Cropping Workflow**:
  - Upload or select an image to display it in the popup.
  - Enable the crop tool to adjust the crop area with an interactive overlay featuring draggable handles (NW, NE, SW, SE, N, S, W, E).
  - Apply the crop to generate a new image or reset to the original.
- **Notifications**: Receive feedback via browser notifications for validation errors or successful operations.

## How It Works
### Structure
- **`src/`**: Contains the source code.
  - **`components/`**: Reusable React components for the UI.
  - **`icons/`**: Extension icon assets in multiple sizes (16x16, 32x32, 48x48, 128x128).
  - **`utils/`**: Utility modules including:
    - `app.ts`: Application logic.
    - `CompressionManager.ts`: Handles image compression (if implemented).
    - `CropManager.ts`: Manages crop settings and applies cropping with overlay.
    - `FileHandler.ts`: Validates and loads image files.
    - `FilterManager.ts`: Applies image filters (if implemented).
    - `ToastManager.ts`: Manages notification displays.
    - `main.ts`: Entry point for the extension logic.
  - **`index.css`**: Global styles.
  - **`style.css`**: Additional styling (optional).
- **`background.js`**: Service worker for background tasks.
- **`content.js`**: Content script injected into webpages.
- **`vite-env.d.ts`**: TypeScript environment definitions for Vite.

### Workflow
1. **Initialization**: The extension loads with a background service worker (`background.js`) and injects `content.js` into matching webpages.
2. **Image Upload**: Users upload images via the popup, where `FileHandler` validates file type and size.
3. **Processing**: Valid images are loaded as Data URLs and displayed. `CropManager` enables cropping with an overlay, allowing percentage-based adjustments.
4. **Output**: Cropped images are rendered as new canvases, convertible to Data URLs for download or further use.
5. **Interaction**: Dragging and resizing the crop box updates settings in real-time, dispatched via custom events.

## Development
- **Run in Development Mode**: `npm run dev` - Starts a local server for live reload.
- **Build for Production**: `npm run build` - Compiles the extension into the `dist` folder.
- **Preview Build**: `npm run preview` - Serves the production build locally.
- The project leverages Vite for fast development, React for the UI, and TypeScript for type safety.

## Scripts
- `npm run dev`: Starts the development server with hot module replacement.
- `npm run build`: Transpiles TypeScript and builds the extension with Vite.
- `npm run preview`: Previews the production build on a local server.

## Dependencies
- **React & React DOM**: For building the popup UI.
- **TypeScript**: For static typing and better code maintainability.
- **Vite**: For bundling and development server.
- **@vitejs/plugin-react**: Enhances Vite with React support.

## License
[MIT License](https://opensource.org/licenses/MIT) - Feel free to modify this section with your preferred license.

## Contributing
Contributions are welcome! Please fork the repository at [github.com/solaxnm](https://github.com/solaxnm), create a branch, and submit a pull request with your changes. Ensure to follow the project’s code style and include tests where applicable.

## Support
For issues or questions, please open an issue on the [GitHub repository](https://github.com/solaxnm/solaxnm-extension/issues) or visit [solanam.com/support](https://solanam.com/support).