import { start as overlayStart } from "./overlay.js";

console.log("Visual Patch Editor content.js loaded");

let editMode = false;
let edits = [];

chrome.runtime.onMessage.addListener((msg) => {
  console.log("content.js received message", msg);
  if (msg.type === "TOGGLE_EDIT") {
    editMode = !editMode;
    console.log("Toggling edit mode:", editMode);
    if (editMode) injectOverlay();
  }
});

function injectOverlay() {
  console.log("[Overlay] injectOverlay called");
  overlayStart({
    onEdit,
    onCommit: () => {
      console.log("[Overlay] Committing edits:", edits);
      window.chrome.runtime.sendMessage({ type: "CREATE_PATCH", edits });
      edits = [];
    }
  });
  console.log("[Overlay] overlayStart called");
}

function getSelector(el) {
  if (el.id) return `#${el.id}`;
  // Build a unique selector using tag, classes, and nth-child
  let path = [];
  while (el && el.nodeType === 1 && el !== document.body) {
    let selector = el.tagName.toLowerCase();
    if (el.className) {
      selector += '.' + el.className.trim().split(/\s+/).join('.');
    }
    // Add nth-of-type for uniqueness
    let sibling = el;
    let nth = 1;
    while ((sibling = sibling.previousElementSibling)) {
      if (sibling.tagName === el.tagName) nth++;
    }
    selector += `:nth-of-type(${nth})`;
    path.unshift(selector);
    el = el.parentElement;
  }
  return path.length ? path.join(' > ') : null;
}

function onEdit({ el, prop, newValue, oldValue }) {
  console.log("[Overlay] onEdit called", { el, prop, newValue, oldValue });
  const selector = getSelector(el);
  const dataSrc = el.getAttribute("data-src") || null;
  const dataComponent = el.getAttribute("data-component") || null;
  const dataTestid = el.getAttribute("data-testid") || null;
  const id = el.id || null;
  const className = el.className || null;
  const tagName = el.tagName ? el.tagName.toLowerCase() : null;
  // Remove any previous edit for this prop/element
  edits = edits.filter(e => !(e.selector === selector && e.prop === prop));
  edits.push({ selector, prop, newValue, oldValue, dataSrc, dataComponent, dataTestid, id, className, tagName });
  
  // Also track edits globally for AI generation
  if (!window.edits) window.edits = [];
  const aiEdit = {
    prop,
    oldValue,
    newValue,
    selector: getSelector(el),
    timestamp: Date.now()
  };
  window.edits.push(aiEdit);
  
  // Keep only last 50 edits to avoid memory issues
  if (window.edits.length > 50) {
    window.edits = window.edits.slice(-50);
  }
  
  el.style.setProperty(prop, newValue);
  console.log("[Overlay] Edits array updated:", edits);
  console.log("[Overlay] AI edits array updated:", window.edits);
}

window.getCurrentEdits = () => edits; 