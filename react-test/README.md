# Visual Patch Editor MVP – React Test App

This project is instrumented for use with the **Visual Patch Editor** Chrome Extension and MCP server. It allows you to visually tweak UI in the browser and have those changes applied directly to the source code via instruction-based edits.

## How to Use with Visual Patch Editor

1. **Start the MCP Server**
   - In your project root, run:
     ```sh
     node mcp/server.js
     ```
   - The server should log: `MCP server running on http://localhost:3333`

2. **Start the React App**
   - In this directory, run:
     ```sh
     npm start
     ```
   - Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Load the Chrome Extension**
   - Build the extension (from project root):
     ```sh
     node build-extension.js
     ```
   - In Chrome, go to `chrome://extensions`, remove any old version, and click "Load unpacked". Select the `dist/` folder.

4. **Edit UI Visually**
   - Click the extension icon to activate edit mode.
   - Click any UI element. Use the sidebar to change color, border, opacity, etc.
   - Click "Commit" to send the change as an instruction to the MCP server.
   - The server will log the instruction and apply the change to the source file (if possible).

5. **Troubleshooting**
   - If changes are not applied:
     - Check the MCP server console for logs/errors.
     - Open the extension's background page console for logs (chrome://extensions → your extension → "service worker").
     - Make sure the extension is loaded from the latest `dist/` build.
     - Try a manual fetch to the MCP server as described in the main project README.

---

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
