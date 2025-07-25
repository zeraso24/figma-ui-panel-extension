module.exports = {
  name: "read_file",
  description: "Return file contents",
  input_schema: { type: "object", properties: { path: { type: "string" } }, required: ["path"] },
  async execute({ path }) {
    const fs = require("fs/promises");
    const content = await fs.readFile(path, "utf8");
    return { content };
  }
}; 