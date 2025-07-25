const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

// List of JS files to bundle
const filesToBundle = [
  "background.js",
  "content.js",
  "overlay.js"
];

const srcDir = "extension";
const outDir = "dist";

// Ensure dist directory exists
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

// Copy manifest
fs.copyFileSync(path.join(srcDir, "manifest.json"), path.join(outDir, "manifest.json"));
// Copy overlay.css only if it exists
const cssPath = path.join(srcDir, "overlay.css");
if (fs.existsSync(cssPath)) {
  fs.copyFileSync(cssPath, path.join(outDir, "overlay.css"));
}
// Copy FigmaPanel.html
const htmlPath = path.join(srcDir, "FigmaPanel.html");
if (fs.existsSync(htmlPath)) {
  fs.copyFileSync(htmlPath, path.join(outDir, "FigmaPanel.html"));
}

// NOTE: You must ensure all shadcn/ui components are present in your extension directory
// or update the imports in FigmaPanel.jsx to match your file structure.

// Bundle JS files with JSX loader
require('esbuild').build({
  entryPoints: ['extension/content.js'],
  bundle: true,
  outfile: 'dist/content.js',
  format: 'iife',
  target: ['chrome58'],
  allowOverwrite: true,
  loader: { '.js': 'jsx', '.jsx': 'jsx' }
}).catch(() => process.exit(1)); 