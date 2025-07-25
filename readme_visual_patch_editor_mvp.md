# Visual Patch Editor (Chrome Extension + MCP + React)

**MVP goal:** Visually tweak tiny UI details (colors, spacing, text, etc.) on a live React app, then auto-generate real code patches and apply them to the repo via an MCP server (used by Cursor/Windsurf).

---

## Table of Contents

1. [Problem & Motivation](#problem--motivation)
2. [High-Level Architecture](#high-level-architecture)
3. [Tech Stack & Assumptions](#tech-stack--assumptions)
4. [Project Structure](#project-structure)
5. [Quick Start](#quick-start)
6. [Detailed Setup](#detailed-setup)
   - [1. Instrument React Components](#1-instrument-react-components)
   - [2. Chrome Extension Skeleton](#2-chrome-extension-skeleton)
   - [3. Overlay & Edit Capture](#3-overlay--edit-capture)
   - [4. Patch Generation & MCP Calls](#4-patch-generation--mcp-calls)
   - [5. MCP Tools](#5-mcp-tools)
7. [Edit Object Schema](#edit-object-schema)
8. [Development Workflow](#development-workflow)
9. [Roadmap / Next Steps](#roadmap--next-steps)
10. [Troubleshooting](#troubleshooting)
11. [License](#license)

---

## Problem & Motivation

Making tiny UI fixes directly in code (search file → tweak prop → re-run dev server) is slow. Designers rely on tools like Figma to adjust pixels instantly. We want that speed **in the actual app**, but still end up with clean code changes committed to the repo.

**Solution (MVP):** A Chrome extension provides a Figma-like overlay. Users select an element, change a simple CSS property or className value. The extension maps that element to its source file (via a `data-src` attribute), builds a unified diff, and sends it to an MCP server. The MCP applies the patch (via `git apply`).

---

## High-Level Architecture

```
[User tweaks element in browser]
      │ (content script collects edits)
      ▼
[background.js]  -- calls MCP -->  [MCP server]
      │                               │
      ▼                               ▼
  build patch                    read_file / apply_patch
      │                               │
      └──────────────>  Repo updated & dev server reloads
```

---

## Tech Stack & Assumptions

- **Frontend app:** React.
- **Extension:** Chrome Manifest V3 (content script + background service worker).
- **DOM → Source Mapping:** MVP uses `data-src="path/to/file.tsx:line"` attributes injected at render time.
- **Edit scope:** ClassName strings, inline `style={{}}`, or simple CSS vars (no deep AST transforms yet).
- **MCP server:** Local HTTP endpoint exposing at least:
  - `read_file({ path }) -> { content }`
  - `apply_patch({ patch }) -> { status }`

---

## Project Structure

```
repo-root/
├── extension/
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   ├── overlay.js
│   ├── overlay.css
│   ├── diff.js
│   └── replace.js
├── mcp/
│   └── tools/
│       ├── read_file.ts
│       └── apply_patch.ts
└── src/
    ├── utils/withSource.tsx
    └── (your React components)
```

---

## Quick Start

1. **Clone repo & install deps** (Node 18+).
2. **Add **`` and wrap a couple of React components to embed `data-src`.
3. **Create extension files** under `/extension`, load it unpacked in Chrome.
4. **Start MCP server** exposing `read_file` & `apply_patch`.
5. **Run your React dev server** (`npm run dev`, `vite`, `webpack`, etc.).
6. **Open app in Chrome**, click the extension icon to toggle edit mode, tweak an element, then commit the patch via the overlay.
7. **Verify git diff & reloaded app** reflect the change.

---

## Detailed Setup

### 1. Instrument React Components

Create a tiny HOC to stamp components with file/line info.

```tsx
// src/utils/withSource.tsx
import React from "react";

type SourceInfo = { file: string; line: number };

export function withSource<T extends object>(
  Component: React.ComponentType<T>,
  info: SourceInfo
) {
  return (props: T) => (
    <Component {...props} data-src={`${info.file}:${info.line}`} />
  );
}
```

Use it temporarily:

```tsx
import { withSource } from "../utils/withSource";
import Button from "./Button";

export default withSource(Button, {
  file: "src/components/Button.tsx",
  line: 12
});
```

> *Later*: Replace manual wrapping with a Babel/TS transformer or runtime hook to auto-inject `data-src`.

### 2. Chrome Extension Skeleton

**manifest.json**

```json
{
  "manifest_version": 3,
  "name": "Visual Patch Editor",
  "version": "0.1.0",
  "permissions": ["scripting", "activeTab", "storage"],
  "host_permissions": ["<all_urls>"],
  "background": { "service_worker": "background.js" },
  "action": { "default_title": "Toggle Editor" }
}
```

Load in Chrome:

1. Go to `chrome://extensions` → Enable **Developer mode**.
2. "Load unpacked" → select the `/extension` folder.

### 3. Overlay & Edit Capture

**content.js** (simplified)

```js
let editMode = false;
let edits = [];

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "TOGGLE_EDIT") {
    editMode = !editMode;
    if (editMode) injectOverlay();
  }
});

function injectOverlay() {
  import(chrome.runtime.getURL("overlay.js")).then(({ default: start }) =>
    start({ onEdit })
  );
}

function onEdit({ el, prop, newValue, oldValue }) {
  const selector = getSelector(el);
  const src = el.getAttribute("data-src") || null;
  edits.push({ selector, prop, newValue, oldValue, src });
  el.style.setProperty(prop, newValue);
}

function getSelector(el) {
  if (el.id) return `#${el.id}`;
  return (
    el.tagName.toLowerCase() +
    (el.className ? "." + el.className.split(" ").join(".") : "")
  );
}
```

**overlay.js** (very naive prompt-based UI)

```js
export default function start({ onEdit }) {
  document.addEventListener(
    "click",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      highlight(e.target);
      const prop = prompt("CSS prop to change? (e.g., color)");
      if (!prop) return;
      const val = prompt(`New value for ${prop}?`, getComputedStyle(e.target)[prop]);
      if (val == null) return;
      const oldVal = getComputedStyle(e.target)[prop];
      onEdit({ el: e.target, prop, newValue: val, oldValue: oldVal });
    },
    true
  );
}

function highlight(el) {
  el.style.outline = "2px solid magenta";
}
```

Add a "Commit" action (button or command) that sends your collected edits to the background:

```js
chrome.runtime.sendMessage({ type: "CREATE_PATCH", edits });
```

### 4. Patch Generation & MCP Calls

**background.js**

```js
chrome.runtime.onInstalled.addListener(() => {
  chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_EDIT" });
  });
});

async function callMCP(tool, args) {
  const res = await fetch(`http://localhost:3333/tools/${tool}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args)
  });
  return res.json();
}

chrome.runtime.onMessage.addListener((msg, sender, respond) => {
  if (msg.type === "CREATE_PATCH") {
    createPatchFlow(msg.edits).then(respond);
    return true; // async
  }
});

import { makePatch } from "./diff.js";
import { replaceValue } from "./replace.js";

async function createPatchFlow(edits) {
  const patches = [];

  for (const e of edits) {
    if (!e.src) continue;
    const [file] = e.src.split(":");
    const fileText = await callMCP("read_file", { path: file });
    const newText = replaceValue(fileText.content, e);
    const patch = makePatch(file, fileText.content, newText);
    patches.push(patch);
  }

  const combined = patches.join("\n");
  return callMCP("apply_patch", { patch: combined });
}
```

**diff.js**

```js
import { createTwoFilesPatch } from "diff"; // bundle this lib in build step

export function makePatch(path, oldText, newText) {
  return createTwoFilesPatch(path, path, oldText, newText);
}
```

**replace.js** (VERY naive — good enough for MVP)

```js
export function replaceValue(source, edit) {
  // Example: adjust a value inside className or inline style
  // Improve this based on your code style.
  if (source.includes("className=")) {
    return source.replace(/className=["'`](.*?)["'`]/, (m, g1) => {
      const updated = g1.replace(edit.oldValue, edit.newValue);
      return `className="${updated}"`;
    });
  }
  return source;
}
```

### 5. MCP Tools

`mcp/tools/apply_patch.ts`

```ts
import { execSync } from "node:child_process";
import { writeFile } from "node:fs/promises";

export default {
  name: "apply_patch",
  description: "Apply a unified diff patch to the repo",
  input_schema: {
    type: "object",
    properties: { patch: { type: "string" } },
    required: ["patch"]
  },
  async execute({ patch }: { patch: string }) {
    await writeFile(".tmp.patch", patch);
    execSync("git apply --whitespace=fix .tmp.patch");
    return { status: "ok" };
  }
};
```

`mcp/tools/read_file.ts`

```ts
import { readFile } from "node:fs/promises";

export default {
  name: "read_file",
  description: "Return file contents",
  input_schema: {
    type: "object",
    properties: { path: { type: "string" } },
    required: ["path"]
  },
  async execute({ path }: { path: string }) {
    const content = await readFile(path, "utf8");
    return { content };
  }
};
```

Wire these into your MCP server router/registry.

---

## Edit Object Schema

```ts
type Edit = {
  selector: string;        // fallback CSS selector
  prop: string;            // e.g. 'color'
  oldValue: string;
  newValue: string;
  src: string | null;      // "src/components/Button.tsx:42"
};
```

---

## Development Workflow

1. **Start everything:** React dev server, MCP server, load extension.
2. **Toggle edit mode:** Click extension icon.
3. **Select element & change prop:** Prompt appears; confirm.
4. **Commit patch:** Use overlay button/command → background sends to MCP.
5. **Verify:** Dev server reloads; check repo with `git diff`.
6. **Iterate:** More edits → new patch.

---

## Roadmap / Next Steps

- **AST-based transforms:** Use `ts-morph` or `recast` to reliably change props, Tailwind classes, etc.
- **Automatic source mapping:** Use React DevTools fiber tree or source maps/CDP instead of `data-src`.
- **Design token picker:** Fetch tokens file via MCP; show dropdowns instead of free-text prompts.
- **Undo/redo & session history:** Provide UI for reverting edits.
- **Better overlay UI:** Draggable handles, rulers, color pickers.
- **Batching & conflict resolution:** Handle multiple edits to same file gracefully.

---

## Troubleshooting

- **Patch fails (git apply error):**
  - File changed since read? Re-fetch and re-generate patch.
  - Whitespace issues: ensure `--whitespace=fix` or run `prettier` before diffing.
- **No **``**:** Your component not wrapped or transformer not applied.
- **Extension can’t access page:** Check `host_permissions` or CSP; you may need to use a dev subdomain.
- **CORS on MCP calls:** If MCP is on a different origin, consider using background script fetch (as shown) instead of content script.

---

## License

MIT (or pick your preferred license). Add a `LICENSE` file if needed.

