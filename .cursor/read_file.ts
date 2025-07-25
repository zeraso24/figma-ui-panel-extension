import { readFile } from "node:fs/promises";

export default {
  name: "read_file",
  description: "Return file contents",
  input_schema: { type: "object", properties: { path: { type: "string" } }, required: ["path"] },
  async execute({ path }: { path: string }) {
    const content = await readFile(path, "utf8");
    return { content };
  }
}; 