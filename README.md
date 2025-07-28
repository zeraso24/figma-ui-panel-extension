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
- **Componentized Input Elements**: All input fields use a reusable `createInputField` component
  - X/Y position (pixels)
  - Width/Height (pixels) 
  - Opacity (percentage)
  - Border Radius (pixels)
  - Rotation (degrees)
- **Buttons**: Alignment controls with visual feedback

### Input Field Behavior & Implementation

#### **Component Architecture**
All input fields use a unified `createInputField` component that provides:
```javascript
function createInputField(options = {}) {
  const {
    value = '',           // Initial value
    suffix = '',          // Unit suffix (°, %, px)
    property = '',        // CSS property to update
    logPrefix = '',       // Console log prefix
    validation = /[^\d.-]/g,  // Input validation regex
    onInput = null        // Custom input handler
  } = options;
}
```

#### **Element Detection & Replacement**
- **Selector Strategy**: Uses `data-layer` attributes to find editable elements
  - X: `[data-layer="-32464"]`
  - Y: `[data-layer="-20162"]`
  - Width: `[data-layer="1600"]`
  - Height: `[data-layer="960"]`
  - Opacity: `[data-layer="100%"]`
  - Border Radius: `[data-layer="0"]`
  - Rotation: `[data-layer="0°"]`

- **Position Preservation**: Copies original element's computed styles to maintain exact positioning
  ```javascript
  const originalStyle = window.getComputedStyle(originalElement);
  inputField.style.position = originalStyle.position;
  inputField.style.left = originalStyle.left;
  inputField.style.top = originalStyle.top;
  // ... additional positioning properties
  ```

#### **User Interaction Behavior**
- **Hover Effects**: Light background highlight (`rgba(0, 0, 0, 0.05)`)
- **Focus Effects**: Blue outline (`#0077EE`) and text selection
- **Input Validation**: Real-time filtering of invalid characters
- **Suffix Management**: Automatic addition of units (°, %, px) on blur
- **Enter Key**: Commits changes and blurs field
- **Real-time Updates**: Changes apply immediately to selected element
- **Input Sizing**: Fixed width (60px) with minimum width (40px) for proper number display

#### **Console Logging & Debugging**
- **Change Tracking**: All input changes logged with element details
- **Debug Information**: Element selectors, property changes, and values
- **Console Panel Integration**: Real-time updates in sidebar console
- **Error Handling**: Validation errors and API failures logged

#### **Reactive Updates**
- **Element Selection**: Input values update when new element is selected
- **Property Changes**: Fields reflect current element properties
- **Cross-Component**: Changes in one field update related fields
- **Cleanup**: Fields clear when no element is selected

#### **Input Field Configurations**

##### **Position Fields (X/Y)**
```javascript
createInputField({
  value: '0',
  suffix: '',
  property: 'left', // or 'top'
  logPrefix: '📍 Position Panel: X position',
  validation: /[^\d.-]/g,
  onInput: (value, el) => onStyleEdit('left', value + 'px')
})
```
- **Behavior**: Direct pixel input, no suffix, immediate CSS updates
- **Validation**: Numbers, decimals, and negative values allowed

##### **Size Fields (Width/Height)**
```javascript
createInputField({
  value: '0',
  suffix: '',
  property: 'width', // or 'height'
  logPrefix: '📏 Position Panel: Width',
  validation: /[^\d.-]/g,
  onInput: (value, el) => onStyleEdit('width', value + 'px')
})
```
- **Behavior**: Pixel-based sizing with real-time element updates
- **Validation**: Positive numbers and decimals

##### **Opacity Field**
```javascript
createInputField({
  value: '100',
  suffix: '%',
  property: 'opacity',
  logPrefix: '🎭 Position Panel: Opacity',
  validation: /[^\d.-]/g,
  onInput: (value, el) => {
    const opacityValue = Math.max(0, Math.min(100, parseFloat(value) || 0)) / 100;
    onStyleEdit('opacity', opacityValue);
  }
})
```
- **Behavior**: Percentage input (0-100%) with automatic conversion to decimal
- **Validation**: Clamped between 0-100, converts to 0-1 range for CSS

##### **Border Radius Field**
```javascript
createInputField({
  value: '0',
  suffix: '',
  property: 'borderRadius',
  logPrefix: '🔲 Position Panel: Border radius',
  validation: /[^\d.-]/g,
  onInput: (value, el) => onStyleEdit('borderRadius', value + 'px')
})
```
- **Behavior**: Pixel-based corner rounding
- **Validation**: Positive numbers and decimals

##### **Rotation Field**
```javascript
createInputField({
  value: '0',
  suffix: '°',
  property: 'transform',
  logPrefix: '🔄 Position Panel: Rotation',
  validation: /[^\d.-]/g,
  onInput: (value, el) => onStyleEdit('transform', `rotate(${value}deg)`)
})
```
- **Behavior**: Degree input with automatic ° symbol
- **Validation**: Any numeric value, converts to CSS rotate() function

##### **Margin Fields (Top, Right, Bottom, Left)**
```javascript
createInputField({
  value: '0',
  suffix: '',
  property: 'marginTop',
  logPrefix: '📏 Margin Panel: Top margin',
  validation: /[^\d.-]/g,
  onInput: (value, el) => {
    onStyleEdit('marginTop', value + 'px');
  }
})
```
- **Behavior**: Individual pixel-based margin input for each side (top, right, bottom, left)
- **Validation**: Positive numbers and decimals
- **Individual Control**: Each margin side can be edited independently
- **Reactive Updates**: Fields update to show actual margin values of selected element

##### **Padding Fields (Top, Right, Bottom, Left)**
```javascript
createInputField({
  value: '16',
  suffix: '',
  property: 'paddingTop',
  logPrefix: '📏 Padding Panel: Top padding',
  validation: /[^\d.-]/g,
  onInput: (value, el) => {
    onStyleEdit('paddingTop', value + 'px');
  }
})
```
- **Behavior**: Individual pixel-based padding input for each side (top, right, bottom, left)
- **Validation**: Positive numbers and decimals
- **Individual Control**: Each padding side can be edited independently
- **Reactive Updates**: Fields update to show actual padding values of selected element
- **Layout**: Padding section is positioned inside the margin section with blue border and background
- **Visual Design**: 
  - Smaller, more compact input fields (43x18px)
  - Blue-bordered container with light blue background
  - Arial font, bold styling for values
  - Content area indicator in the center
  - Margin controls positioned around the outside
- **Accordion View**: Button to switch between visual box model and individual input views
  - **Visual View**: Shows margin/padding as a visual box model with cross-pattern inputs
  - **Individual View**: Shows individual input fields with labels and icons for each side
  - **Toggle Button**: Located in top-right corner with grid icon, changes color when active
  - **Accordion Behavior**: Only one view is visible at a time, smooth transitions
  - **Reactive Updates**: Active view updates when element properties change

#### **Troubleshooting & Best Practices**

##### **Common Issues**
- **Input Fields Not Found**: Check console for debug messages showing element detection
- **Positioning Problems**: Ensure original element styles are properly copied
- **Validation Errors**: Verify regex patterns match expected input types
- **Reactive Updates**: Confirm `updateUIFromSelectedElement` is called on element selection

##### **Debugging Steps**
1. **Check Console Logs**: Look for "🔍 Looking for input elements" messages
2. **Verify Selectors**: Ensure `data-layer` attributes match HTML structure
3. **Test Element Replacement**: Confirm input fields replace original elements
4. **Check Event Handlers**: Verify input, focus, and blur events are attached

##### **Development Guidelines**
- **Consistent Styling**: All input fields use the same base styling
- **Position Preservation**: Always copy computed styles from original elements
- **Validation**: Use appropriate regex patterns for each input type
- **Logging**: Include descriptive log prefixes for debugging
- **Error Handling**: Provide fallbacks for missing elements or failed operations

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
- **Margin & Padding Controls**: 
  - **Margin**: Individual margin inputs for top, right, bottom, and left sides
  - **Padding**: Individual padding inputs for top, right, bottom, and left sides (nested within margin section)
- **Color Controls**: Fill and stroke color pickers

### AI Instruction Generation
- **Button Feedback**: Button turns green when instructions are successfully generated
- **Visual Confirmation**: 3-second green state with smooth transition back to blue
- **Success Indication**: Clear visual feedback for successful AI instruction generation
- **Error Handling**: Maintains original button state on errors

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