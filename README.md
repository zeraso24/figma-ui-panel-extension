# Visual Patch Editor Chrome Extension

## Overview

This project is a Chrome extension that enables users to visually edit UI elements on any web page using a Figma-like sidebar panel. The extension tracks all changes made to the UI and generates clear, AI-powered code instructions for those changes—ready to be pasted into your code editor.

## Key Features
- **Figma-like Sidebar Panel:** Edit position, size, rotation, fill, and more using a modern, intuitive UI.
- **Live UI Editing:** Click any element on the page and adjust its styles in real time.
- **Change Tracking:** All edits are recorded for later review or export.
- **AI-Powered Instructions:** Generate step-by-step code instructions for your UI changes using OpenRouter API.
- **Clipboard Integration:** Copy generated instructions directly to your clipboard for use in your code editor.
- **Console Panel:** View logs and debug information inside the extension UI.
- **Standalone Operation:** No external server required - works completely in the browser.

## Quickstart for Developers

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Build the extension:**
   ```sh
   npm run build
   ```
   This will generate a `dist/` folder with the production-ready extension.
3. **Load the extension in Chrome:**
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist/` folder
4. **Usage:**
   - Click the extension icon to activate edit mode.
   - Select any element on the page.
   - Use the sidebar to adjust styles and generate AI instructions.

## How It Works

1. **Activation:** Click the extension icon to toggle edit mode on any webpage
2. **Element Selection:** Click any UI element to select it (highlighted with blue outline)
3. **Visual Editing:** Use the Figma-like sidebar to adjust position, size, colors, and other styles
4. **Change Tracking:** All modifications are automatically recorded
5. **AI Generation:** Click "Generate AI Instructions" to create step-by-step code instructions
6. **Copy to Clipboard:** Instructions are automatically copied for use in your code editor

## File Structure
- `extension/` — Chrome extension source code (content script, overlay, manifest, FigmaPanel HTML, etc.)
- `build-extension.js` — Build script for bundling the extension
- `README.md` — This file

## Technical Details

- **Manifest v3** compliant Chrome extension
- **Content script injection** for webpage interaction
- **Service worker** for background processing
- **OpenRouter API** integration for AI instruction generation
- **Modern ES6+ JavaScript** with module imports
- **Professional UI** with Figma-inspired design

## Contributing
Pull requests and issues are welcome! Please document any new features or changes in this README.

---

*This project is in active development. For questions or feature requests, open an issue or contact the maintainer.* 