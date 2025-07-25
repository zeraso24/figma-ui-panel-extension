import { execSync } from "node:child_process";

export default {
  name: "apply_patch",
  description: "Apply a unified diff patch to the repo",
  input_schema: { type: "object", properties: { patch: { type: "string" } }, required: ["patch"] },
  async execute({ patch }: { patch: string }) {
    const fs = await import("node:fs/promises");
    await fs.writeFile(".tmp.patch", patch);
    execSync("git apply --whitespace=fix .tmp.patch");
    return { status: "ok" };
  }
}; 