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

## Instruction Generation Logic

### Data Collection
The extension tracks all UI changes in a global `window.edits` array with the following structure:
```javascript
{
  prop: 'transform',           // CSS property being changed
  oldValue: 'rotate(0deg)',    // Previous value
  newValue: 'rotate(90deg)',   // New value
  selector: '.my-element',     // CSS selector for the element
  timestamp: 1234567890        // When the change occurred
}
```

### Deduplication Process
Before generating instructions, the system deduplicates changes:
1. **Group by element**: Changes are grouped by CSS selector
2. **Keep final values**: Only the last change for each property is kept
3. **Remove intermediate steps**: No duplicate entries for the same property

### AI Prompt Generation
The system builds a structured prompt for the AI:
```
I made the following UI changes to a web page:

Element: [CSS Selector]
- Changed [property] from "[oldValue]" to "[newValue]" (context)
- Changed [property] from "[oldValue]" to "[newValue]" (context)

Please generate clear, step-by-step instructions for a developer to implement these changes in their code.
```

### Fallback Instructions
If the AI service is unavailable, the system generates manual instructions:
```
Manual Instructions:
Based on your UI changes, here are the steps to implement them:

1. Open your CSS file or add a <style> tag

2. Apply the following changes to element: [selector]
   - transform (rotation): rotate(90deg)
   - text alignment: center
   - background color: #ff0000

3. Test the changes in your browser
4. Adjust as needed for your specific use case
```

## Reactive UI System

### Element Selection Flow
1. **Hover Detection**: Mouse over elements shows green dotted border
2. **Selection**: Click to select (blue solid border)
3. **Panel Update**: Sidebar immediately updates to show current element's values
4. **Real-time Editing**: Changes apply instantly to the selected element

### Panel Reactivity
The sidebar panel updates reactively when:
- **New element selected**: All input fields update to show current values
- **Property changes**: Input fields reflect the new values immediately
- **Element deselection**: Fields clear when no element is selected

### Input Field Types
- **ContentEditable**: X/Y position, width/height, opacity, border radius
- **Input Elements**: Rotation (with degree symbol and validation)
- **Buttons**: Alignment controls with visual feedback

### Update Triggers
Panel updates are triggered by:
- Element selection (click)
- Property changes (input events)
- Manual refresh calls
- Keyboard navigation

## Panel Components

### Position Controls
- **X/Y Coordinates**: Direct pixel input with validation
- **Width/Height**: Size controls with real-time updates
- **Rotation**: Input field with degree symbol and validation

### Alignment Controls
- **Horizontal**: Left, Center, Right alignment buttons
- **Vertical**: Top, Middle, Bottom alignment buttons
- **Visual Feedback**: Active alignment highlighted

### Transform Controls
- **Rotation**: 90° increment button
- **Flip**: Horizontal and vertical flip buttons
- **Real-time**: Changes apply immediately

### Style Controls
- **Opacity**: Percentage input with conversion
- **Border Radius**: Pixel input for corner rounding
- **Color Controls**: Fill and stroke color pickers

## Console Integration

### Logging System
- **Element Info**: Tag, ID, classes, position, size
- **Change Tracking**: All edits logged with timestamps
- **Error Handling**: API failures and validation errors
- **Debug Info**: Detailed element properties and styles

### Console Panel
- **Real-time Logs**: Live updates in sidebar
- **Error Display**: Color-coded error messages
- **Info Display**: Success and info messages
- **Timestamp**: All logs include timestamps

## Contributing
Pull requests and issues are welcome! Please document any new features or changes in this README.

---

*This project is in active development. For questions or feature requests, open an issue or contact the maintainer.* 