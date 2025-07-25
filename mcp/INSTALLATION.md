# MCP Server Installation Guide

Follow these steps to add the MCP (Model Context Protocol) server to any project for instruction-based code editing and visual patching.

---

## 1. Copy MCP Server Files

Copy the `mcp/` directory from your source project into the root of your new project. This directory should contain:
- `mcp/server.js`
- `mcp/tools/edit_instruction.js`

If you want to use the Chrome extension, also copy:
- `extension/` directory
- `build-extension.js`

---

## 2. Install Required Dependencies

In your new project root, run:

```sh
npm install express recast
```

---

## 3. (Optional) Set Up Cursor IDE Integration

If you use Cursor IDE, create the file `.cursor/mcp.json` in your project root with the following content:

```json
{
  "mcpServers": {
    "external_mcp": {
      "url": "http://localhost:3333/tools",
      "tools": [
        { "name": "edit_instruction", "description": "Apply an edit instruction to the codebase" }
      ]
    }
  }
}
```

---

## 4. Start the MCP Server

From your project root, run:

```sh
node mcp/server.js
```

You should see:
```
MCP server running on http://localhost:3333
```

---

## 5. (Optional) Build and Load the Chrome Extension

If you want to use the visual editor:

```sh
node build-extension.js
```
- Go to `chrome://extensions` in Chrome.
- Remove any old version of the extension.
- Click "Load unpacked" and select the `dist/` folder.

---

## 6. Test the MCP Server

You can test the server with a sample curl command (replace the file and values as needed):

```sh
curl -X POST http://localhost:3333/tools/edit_instruction \
  -H "Content-Type: application/json" \
  -d '{
    "file": "src/components/YourComponent.tsx",
    "prop": "backgroundColor",
    "oldValue": "#ff0000",
    "newValue": "#00ff00"
  }'
```

---

## ✅ That’s it!
Your project is now MCP-enabled and ready for visual-to-code editing. 