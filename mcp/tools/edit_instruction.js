const fs = require("fs/promises");
const recast = require("recast");
const path = require("path");
const glob = require("glob");

function logStep(...args) {
  console.log("[edit_instruction]", ...args);
}

async function findFileByHints({ selector, id, dataComponent, className, tagName, dataTestid }) {
  logStep("AST-based: Attempting to find file by hints");
  const files = glob.sync("**/*.{tsx,jsx,js,ts}", { cwd: process.cwd(), absolute: true, ignore: "node_modules/**" });
  const candidates = [];

  // Helper to check if a JSXAttribute matches a name and value
  function attrMatches(attr, name, value) {
    if (!attr || !attr.name || attr.name.name !== name) return false;
    if (!attr.value) return false;
    if (attr.value.type === "StringLiteral" || attr.value.type === "Literal") {
      return attr.value.value === value;
    }
    if (attr.value.type === "JSXExpressionContainer" && attr.value.expression.type === "StringLiteral") {
      return attr.value.expression.value === value;
    }
    return false;
  }

  // Helper to check selector
  function selectorMatches(node, selector) {
    if (!selector) return false;
    if (selector.startsWith(".")) {
      // .class
      return node.openingElement.attributes.some(attr => attrMatches(attr, "className", selector.slice(1)));
    } else if (selector.startsWith("#")) {
      // #id
      return node.openingElement.attributes.some(attr => attrMatches(attr, "id", selector.slice(1)));
    } else if (selector.startsWith("[")) {
      // [data-testid="foo"]
      const match = selector.match(/\[([^=]+)=["']?([^"'\]]+)["']?\]/);
      if (match) {
        const [_, attrName, attrValue] = match;
        return node.openingElement.attributes.some(attr => attrMatches(attr, attrName, attrValue));
      }
    } else {
      // tagName
      return node.openingElement.name && node.openingElement.name.name === selector;
    }
    return false;
  }

  for (const f of files) {
    let content;
    try {
      content = await fs.readFile(f, "utf8");
    } catch (err) { continue; }
    let ast;
    try {
      ast = recast.parse(content, { parser: require("recast/parsers/typescript") });
    } catch (err) { continue; }
    let matched = false;
    let matchReasons = [];
    recast.types.visit(ast, {
      visitJSXElement(path) {
        const node = path.node;
        // tagName
        if (tagName && node.openingElement.name && node.openingElement.name.name === tagName) {
          matched = true;
          matchReasons.push(`tagName:${tagName}`);
        }
        // className
        if (className && node.openingElement.attributes.some(attr => attrMatches(attr, "className", className))) {
          matched = true;
          matchReasons.push(`className:${className}`);
        }
        // id
        if (id && node.openingElement.attributes.some(attr => attrMatches(attr, "id", id))) {
          matched = true;
          matchReasons.push(`id:${id}`);
        }
        // dataComponent
        if (dataComponent && node.openingElement.attributes.some(attr => attrMatches(attr, "data-component", dataComponent))) {
          matched = true;
          matchReasons.push(`data-component:${dataComponent}`);
        }
        // dataTestid
        if (dataTestid && node.openingElement.attributes.some(attr => attrMatches(attr, "data-testid", dataTestid))) {
          matched = true;
          matchReasons.push(`data-testid:${dataTestid}`);
        }
        // selector
        if (selector && selectorMatches(node, selector)) {
          matched = true;
          matchReasons.push(`selector:${selector}`);
        }
        this.traverse(path);
      }
    });
    if (matched) {
      candidates.push({ file: f, reasons: matchReasons });
    }
  }
  if (candidates.length === 1) {
    logStep("Unique file found:", candidates[0].file, "reasons:", candidates[0].reasons);
    return candidates[0].file;
  } else if (candidates.length === 0) {
    logStep("No file found by AST hints");
    return null;
  } else {
    logStep("Multiple candidate files found:", candidates.map(c => ({ file: c.file, reasons: c.reasons })));
    return null;
  }
}

module.exports = {
  name: "edit_instruction",
  description: "Apply Tailwind or CSS style changes to the codebase, with robust mapping and logging",
  input_schema: {
    type: "object",
    properties: {
      file: { type: "string" },
      dataSrc: { type: "string" },
      prop: { type: "string" },
      oldValue: { type: "string" },
      newValue: { type: "string" },
      selector: { type: "string" },
      dataComponent: { type: "string" },
      dataTestid: { type: "string" },
      id: { type: "string" },
      className: { type: "string" },
      tagName: { type: "string" }
    },
    required: ["prop", "oldValue", "newValue"]
  },
  async execute(instruction) {
    logStep("TOOL CALLED", instruction);
    let { file, dataSrc, prop, oldValue, newValue, selector, id, dataComponent, className, tagName, dataTestid } = instruction;
    // Prefer file from dataSrc if present
    if (!file && dataSrc) {
      [file] = dataSrc.split(":");
      logStep("Extracted file from dataSrc:", file);
    }
    // 1. Try file directly
    if (!file) {
      file = await findFileByHints({ selector, id, dataComponent, className, tagName, dataTestid });
      if (!file) {
        logStep("No file found for instruction, aborting");
        return { status: "error", error: "No file found for instruction", instruction };
      }
    }
    logStep("Editing file:", file);
    let code;
    try {
      code = await fs.readFile(file, "utf8");
    } catch (err) {
      logStep("Error reading file", err);
      return { status: "error", error: err.message, file };
    }
    let ast;
    try {
      ast = recast.parse(code, { parser: require("recast/parsers/typescript") });
    } catch (err) {
      logStep("Error parsing AST", err);
      return { status: "error", error: err.message, file };
    }
    let changed = false;
    recast.types.visit(ast, {
      visitJSXAttribute(path) {
        // Tailwind/className
        if (prop === "className" && path.node.name.name === "className") {
          if (path.node.value && path.node.value.value) {
            const classStr = path.node.value.value;
            if (classStr.includes(oldValue)) {
              logStep("Found className, replacing", oldValue, "with", newValue);
              path.node.value.value = classStr.replace(oldValue, newValue);
              changed = true;
            }
          }
        }
        // Inline style
        if (
          prop !== "className" &&
          path.node.name.name === "style" &&
          path.node.value &&
          path.node.value.expression &&
          path.node.value.expression.properties
        ) {
          for (const propNode of path.node.value.expression.properties) {
            if (
              propNode.key &&
              propNode.key.name === prop &&
              propNode.value.value === oldValue
            ) {
              logStep("Found style prop", prop, ", replacing", oldValue, "with", newValue);
              propNode.value.value = newValue;
              changed = true;
            }
          }
        }
        this.traverse(path);
      }
    });
    logStep("Changed =", changed);
    if (changed) {
      const output = recast.print(ast).code;
      try {
        await fs.writeFile(file, output, "utf8");
        logStep("File updated");
      } catch (err) {
        logStep("Error writing file", err);
        return { status: "error", error: err.message, file };
      }
      return { status: "applied", file };
    } else {
      logStep("Not found or unchanged");
      return { status: "not found or unchanged", file };
    }
  }
};

// CLI handler for direct execution
if (require.main === module) {
  const fsSync = require("fs");
  const path = process.argv[2];
  if (!path) {
    console.error("Usage: node edit_instruction.js <instruction.json>");
    process.exit(1);
  }
  let instruction;
  try {
    instruction = JSON.parse(fsSync.readFileSync(path, "utf8"));
  } catch (err) {
    console.error("Failed to read or parse instruction file:", err.message);
    process.exit(1);
  }
  module.exports.execute(instruction).then(result => {
    console.log("Result:", result);
  }).catch(err => {
    console.error("Execution error:", err);
    process.exit(1);
  });
}  