import { registerCommand, showNotification, registerPanel, writeFile, openFile, editFile } from "cursor-api";
import { spawn } from "child_process";

let polling = false;
let serverProcess: any = null;

const SERVER_SCRIPT = `
const express = require('express');
const app = express();
app.use(express.json());
let lastInstruction = null;
app.post('/send-instruction', (req, res) => {
  lastInstruction = { new: true, data: req.body };
  res.json({ status: 'ok' });
});
app.get('/next-instruction', (req, res) => {
  if (lastInstruction) {
    res.json(lastInstruction);
    lastInstruction = null;
  } else {
    res.json({ new: false });
  }
});
app.listen(3333, () => {
  console.log('Visual Patch Server running on http://localhost:3333');
});
`;

async function pollForInstructions() {
  if (polling) return;
  polling = true;
  showNotification("Visual Patch Plugin: Polling for instructions on http://localhost:3333/next-instruction");
  setInterval(async () => {
    try {
      const res = await fetch("http://localhost:3333/next-instruction");
      if (res.ok) {
        const instruction = await res.json();
        if (instruction && instruction.new && instruction.data) {
          const { prop, newValue, oldValue, selector, file, dataSrc, className, tagName } = instruction.data;
          if (file) {
            await openFile(file);
            await editFile(file, (code) => {
              // Simple string replace for demo; use AST for production
              if (prop === "className" || prop === "class") {
                // Replace className value
                return code.replace(oldValue, newValue);
              } else {
                // Replace inline style value
                return code.replace(oldValue, newValue);
              }
            });
            showNotification(`Visual patch applied to ${file}: ${prop} changed to ${newValue}`);
          } else {
            showNotification("No file provided in instruction. Patch not applied.");
          }
        }
      }
    } catch (err) {
      // Optionally log or show error
    }
  }, 2000); // poll every 2 seconds
}

registerCommand("applyVisualPatch", async () => {
  pollForInstructions();
});

registerCommand("startVisualPatchServer", async () => {
  // Write the server script to the project root
  await writeFile("visual-patch-server.js", SERVER_SCRIPT);
  showNotification(
    "Visual Patch Server script created as visual-patch-server.js.\n" +
    "To start the server, run: node visual-patch-server.js\n" +
    "Then use the extension and plugin as normal."
  );
});

registerPanel({
  id: "visualPatchPanel",
  title: "Visual Patch",
  render: () => {
    return `<button onclick=\"window.cursorApi.runCommand('startVisualPatchServer')\">Start Connection</button>`;
  }
}); 