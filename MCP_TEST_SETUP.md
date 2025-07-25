# MCP Instruction Tool: Quick Test Setup Guide (For Existing Projects)

This guide will help you set up and test the MCP instruction-based editing tool in **any React project that already has components**.

---

## 1. Copy the MCP Server Folder
Copy the entire `mcp/` folder from your source project into the **root** of your target project. It should contain:
- `server.js`
- `apply_patch.js`
- `read_file.js`
- `edit_instruction.js`

## 2. Install Dependencies
In your project root, run:
```sh
npm install express recast
```
(If you use TypeScript, you may also want `@types/express`.)

## 3. Start the MCP Server
From your project root:
```sh
node mcp/server.js
```
You should see:
```
Server starting...
MCP server running on http://localhost:3333
```

## 4. (Optional) Set Up Cursor
If you want to use Cursor with your MCP server:
- Copy your `.cursor/` folder (with `mcp.json` pointing to `http://localhost:3333/tools`) into your project root.
- Example `.cursor/mcp.json`:
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
- Restart Cursor after copying the folder.

## 5. Test with curl
From your project root, run (replace the file and values with real ones from your project):
```sh
curl -X POST http://localhost:3333/tools/edit_instruction \
  -H "Content-Type: application/json" \
  -d '{"action":"set_style","file":"src/YourComponent.tsx","prop":"className","oldValue":"bg-red-500","newValue":"bg-blue-500"}'
```
Or for inline style:
```sh
curl -X POST http://localhost:3333/tools/edit_instruction \
  -H "Content-Type: application/json" \
  -d '{"action":"set_style","file":"src/YourComponent.tsx","prop":"backgroundColor","oldValue":"#ff0000","newValue":"#00ff00"}'
```

## 6. Check the File
Open the file you targeted and verify the class or style has changed.

---

**You can now use this setup in any React project to test the MCP instruction tool and Cursor integration!** 