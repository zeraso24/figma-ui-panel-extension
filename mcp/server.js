console.log("Server starting...");

const express = require("express");
const editInstruction = require("./tools/edit_instruction.js");

const app = express();
app.use(express.json());

// Add CORS headers for browser/extension compatibility
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

const tools = {
  edit_instruction: editInstruction,
};

// GET /tools endpoint for Cursor compatibility
app.get("/tools", (req, res) => {
  res.json({
    tools: Object.keys(tools).map(name => ({
      name,
      description: tools[name].description || ""
    }))
  });
});

app.post("/tools/:tool", async (req, res) => {
  const tool = tools[req.params.tool];
  const now = new Date().toISOString();
  if (!tool) {
    console.log(`[${now}] [MCP] Tool not found: ${req.params.tool}`);
    return res.status(404).json({ error: "Tool not found" });
  }
  console.log(`[${now}] [MCP] [${req.params.tool}] Request received.`);
  console.log(`[${now}] [MCP] [${req.params.tool}] Body:`, JSON.stringify(req.body));
  try {
    const result = await tool.execute(req.body);
    console.log(`[${now}] [MCP] [${req.params.tool}] Success:`, JSON.stringify(result));
    res.json(result);
  } catch (e) {
    console.error(`[${now}] [MCP] [${req.params.tool}] Error:`, e);
    res.status(500).json({ error: e.message });
  }
});

// Catch-all route for debugging
app.use((req, res) => {
  console.log("Received request:", req.method, req.url);
  res.status(404).send("Not found");
});

const PORT = 3333;
app.listen(PORT, () => {
  console.log(`MCP server running on http://localhost:${PORT}`);
}); 