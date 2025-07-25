// Add a robust getSelector function at the top
function getSelector(el) {
  if (!el) return '';
  if (el.id) return `#${el.id}`;
  if (el.className && typeof el.className === 'string') {
    return '.' + el.className.trim().split(/\s+/).join('.');
  }
  return el.tagName ? el.tagName.toLowerCase() : '';
}

// Enhanced element information function
function getElementInfo(el) {
  if (!el) return null;
  
  const tagName = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : '';
  const className = el.className ? `.${el.className.split(' ')[0]}` : '';
  const selector = `${tagName}${id}${className}`;
  
  const rect = el.getBoundingClientRect();
  const styles = getComputedStyle(el);
  
  return {
    element: el,
    selector: selector,
    tagName: tagName,
    id: el.id,
    className: el.className,
    bounds: {
      x: Math.round(rect.left),
      y: Math.round(rect.top),
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    },
    styles: {
      backgroundColor: styles.backgroundColor,
      color: styles.color,
      fontSize: styles.fontSize,
      padding: styles.padding,
      margin: styles.margin,
      border: styles.border
    },
    textContent: el.textContent ? el.textContent.substring(0, 50) + '...' : '',
    children: el.children ? el.children.length : 0
  };
}



// Add a console panel to the sidebar
function addConsolePanel(sidebar) {
  let consolePanel = document.getElementById("console-panel");
  if (!consolePanel) {
    consolePanel = document.createElement("div");
    consolePanel.id = "console-panel";
    consolePanel.style.height = "120px";
    consolePanel.style.overflow = "auto";
    consolePanel.style.background = "#222";
    consolePanel.style.color = "#fff";
    consolePanel.style.fontSize = "12px";
    consolePanel.style.padding = "8px";
    consolePanel.style.borderRadius = "6px";
    consolePanel.style.marginTop = "16px";
    consolePanel.style.marginBottom = "16px";
    sidebar.appendChild(consolePanel);
  }
  return consolePanel;
}

function logToConsolePanel(msg, type = "info") {
  let consolePanel = document.getElementById("console-panel");
  if (!consolePanel) return;
  const line = document.createElement("div");
  const now = new Date().toLocaleTimeString();
  line.textContent = `[${now}] ${msg}`;
  if (type === "error") {
    line.style.color = "#ff5252";
  } else if (type === "success") {
    line.style.color = "#4caf50";
  }
  consolePanel.appendChild(line);
  consolePanel.scrollTop = consolePanel.scrollHeight;
}

// Make logToConsolePanel globally available
window.logToConsolePanel = logToConsolePanel;

// Add OpenRouter fallback function at the top-level
// Make fetchOpenRouterInstruction globally available
window.fetchOpenRouterInstruction = async function(prompt) {
  try {
    // Use a more reliable API key - you may need to update this
    const apiKey = "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";
    
    if (window.logToConsolePanel) {
      window.logToConsolePanel("Calling OpenRouter API...", "info");
    }
    console.log("OpenRouter API call started with prompt:", prompt);
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "Visual Patch Editor"
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-haiku", // Faster model
        messages: [
          { 
            role: "system", 
            content: "You are an expert UI developer. Generate concise, practical CSS/HTML instructions for UI changes. Be specific and actionable." 
          },
          { role: "user", content: prompt }
        ],
        max_tokens: 500, // Shorter response for speed
        temperature: 0.2 // More focused
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response format from OpenRouter");
    }

    if (window.logToConsolePanel) {
      window.logToConsolePanel("OpenRouter API call successful", "success");
    }
    console.log("OpenRouter API response:", data.choices[0].message.content);
    return data.choices[0].message.content;
    
  } catch (error) {
    if (window.logToConsolePanel) {
      window.logToConsolePanel(`OpenRouter error: ${error.message}`, "error");
    }
    
    // Fallback to a simple instruction format
    return `Manual Instructions:
    
Based on your UI changes, here are the steps to implement them:

1. Open your CSS file or add a <style> tag
2. Apply the following changes to the selected element:
   - Use the CSS selector: ${getSelector(selectedEl || document.body)}
   - Update the properties as shown in the console log
3. Test the changes in your browser
4. Adjust as needed for your specific use case

Note: This is a fallback instruction. Check the console for detailed change information.`;
  }
};

// Load ColorPicker first
import './colorPicker.js';
import { renderFigmaPanelUI } from './figmaPanelUI.js';

export function start({ onEdit, onCommit }) {

  let sidebar = document.getElementById("figma-sidebar");
  if (sidebar) sidebar.remove();

  sidebar = document.createElement("div");
  sidebar.id = "figma-sidebar";
  sidebar.style.position = "fixed";
  sidebar.style.top = "0";
  sidebar.style.right = "0";
  sidebar.style.height = "100vh";
  sidebar.style.width = "260px";
  sidebar.style.zIndex = 999999;
  sidebar.style.background = "#fff";
  sidebar.style.boxShadow = "-2px 0 16px rgba(0,0,0,0.1)";
  sidebar.style.fontFamily = "Inter, -apple-system, BlinkMacSystemFont, sans-serif";
  sidebar.style.fontSize = "12px";
  sidebar.style.overflowY = "auto";

  document.body.appendChild(sidebar);

  // Render the Figma-like UI
  renderFigmaPanelUI({
    sidebar,
    getSelectedEl: () => selectedEl,
    onStyleEdit: (prop, value) => {
      if (selectedEl) {
        selectedEl.style[prop] = value;
        onEdit({ el: selectedEl, prop, newValue: value, oldValue: getComputedStyle(selectedEl)[prop] });
        // Update the panel inputs after style change
        if (window.updateFigmaPanelInputs) {
          window.updateFigmaPanelInputs();
        }
      }
    }
  });

  // Add console panel
  addConsolePanel(sidebar);
  logToConsolePanel("Overlay loaded. Ready to edit UI.");

  let selectedEl = null;
  let hoveredEl = null;

  // Hover effect logic with live console updates
  document.addEventListener('mouseover', (e) => {
    // Don't hover elements when over our UI or color picker
    if (e.target.closest('#figma-sidebar') || e.target.closest('.color-picker-popup')) {
      return;
    }
    
    // Remove previous hover effect
    if (hoveredEl && hoveredEl !== selectedEl) {
      hoveredEl.style.outline = '';
    }
    
    hoveredEl = e.target;
    
    // Only show hover effect if not the selected element
    if (hoveredEl !== selectedEl) {
      hoveredEl.style.outline = '2px dotted #00FF00'; // Green dotted border for hover
      
      // Live console updates with timestamp
      const elementInfo = getElementInfo(hoveredEl);
      const timestamp = new Date().toLocaleTimeString();
      
      // Clear previous hover logs and show new ones
      console.clear();
      console.log(`🟢 HOVERING [${timestamp}]:`, elementInfo.selector);
      console.log('📍 Position:', `${elementInfo.bounds.x}, ${elementInfo.bounds.y}`);
      console.log('📏 Size:', `${elementInfo.bounds.width} × ${elementInfo.bounds.height}`);
      console.log('🏷️  Tag:', elementInfo.tagName);
      console.log('🆔 ID:', elementInfo.id || 'none');
      console.log('🎨 Class:', elementInfo.className || 'none');
      console.log('📝 Text:', elementInfo.textContent);
      console.log('👶 Children:', elementInfo.children);
      console.log('🎨 Background:', elementInfo.styles.backgroundColor);
      console.log('🎨 Color:', elementInfo.styles.color);
      console.log('🎨 Font Size:', elementInfo.styles.fontSize);
      console.log('🎨 Padding:', elementInfo.styles.padding);
      console.log('🎨 Margin:', elementInfo.styles.margin);
      console.log('🎨 Border:', elementInfo.styles.border);
      console.log('---');
      
      // Also update the console panel in the sidebar
      logToConsolePanel(`Hovering: ${elementInfo.selector}`, "info");
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('#figma-sidebar') || e.target.closest('.color-picker-popup')) {
      return;
    }
    
    // Remove hover effect when mouse leaves
    if (hoveredEl && hoveredEl !== selectedEl) {
      hoveredEl.style.outline = '';
    }
    hoveredEl = null;
  });

  // Element selection logic
  document.addEventListener('click', (e) => {
    if (e.target.closest('#figma-sidebar') || e.target.closest('.color-picker-popup')) {
      return; // Don't select elements when clicking on our UI or color picker
    }
    
    // Remove previous selection
    if (selectedEl) {
      selectedEl.style.outline = '';
    }
    
    selectedEl = e.target;
    selectedEl.style.outline = '3px solid #0066FF'; // Intense blue solid border for selection
    
    // Update the global selected element reference
    window.selectedEl = selectedEl;
    
    // Update the Figma panel inputs with the new element's properties
    if (window.updateFigmaPanelInputs) {
      window.updateFigmaPanelInputs();
    }
    
    // Log detailed selection information
    const elementInfo = getElementInfo(selectedEl);
    console.log('🔵 SELECTED:', elementInfo.selector);
    console.log('📍 Position:', `${elementInfo.bounds.x}, ${elementInfo.bounds.y}`);
    console.log('📏 Size:', `${elementInfo.bounds.width} × ${elementInfo.bounds.height}`);
    console.log('🏷️  Tag:', elementInfo.tagName);
    console.log('🆔 ID:', elementInfo.id || 'none');
    console.log('🎨 Class:', elementInfo.className || 'none');
    console.log('📝 Text:', elementInfo.textContent);
    console.log('👶 Children:', elementInfo.children);
    console.log('🎨 Styles:', elementInfo.styles);
    console.log('🔗 Element:', selectedEl);
    console.log('=====================================');
    
    logToConsolePanel(`Selected: ${elementInfo.selector}`);
  });

  // Keyboard navigation for element selection
  document.addEventListener('keydown', (e) => {
    if (!selectedEl) return;
    
    let nextElement = null;
    
    switch (e.key) {
      case 'Tab':
        e.preventDefault();
        // Navigate to next sibling or first child
        nextElement = selectedEl.nextElementSibling || selectedEl.firstElementChild;
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextElement = selectedEl.nextElementSibling;
        break;
      case 'ArrowLeft':
        e.preventDefault();
        nextElement = selectedEl.previousElementSibling;
        break;
      case 'ArrowDown':
        e.preventDefault();
        nextElement = selectedEl.nextElementSibling;
        break;
      case 'ArrowUp':
        e.preventDefault();
        nextElement = selectedEl.previousElementSibling;
        break;
      case 'Escape':
        // Deselect current element
        if (selectedEl) {
          selectedEl.style.outline = '';
          selectedEl = null;
          window.selectedEl = null;
          console.log('❌ Deselected element');
          logToConsolePanel('Deselected element');
        }
        return;
    }
    
    if (nextElement) {
      // Simulate click on next element
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      nextElement.dispatchEvent(clickEvent);
    }
  });

  function updateSelectedStyle(prop, value) {
    if (!selectedEl) return;
    selectedEl.style[prop] = value;
    handleEdit(prop, value);
  }

  function handleEdit(prop, value) {
    if (!selectedEl) return;
    const oldValue = getComputedStyle(selectedEl)[prop];
    onEdit({ el: selectedEl, prop, newValue: value, oldValue });
    logToConsolePanel(`Edit: ${prop} changed from ${oldValue} to ${value}`);
  }

  function updateFieldsFromElement() {
    if (!selectedEl) return;
    
    const rect = selectedEl.getBoundingClientRect();
    const style = getComputedStyle(selectedEl);
    
    // Update position fields
    const xInput = document.getElementById("x-input");
    const yInput = document.getElementById("y-input");
    if (xInput) xInput.value = Math.round(rect.left);
    if (yInput) yInput.value = Math.round(rect.top);
    
    // Update size fields
    const wInput = document.getElementById("w-input");
    const hInput = document.getElementById("h-input");
    if (wInput) wInput.value = Math.round(rect.width);
    if (hInput) hInput.value = Math.round(rect.height);
    
    // Update style fields
    const fillInput = document.getElementById("fill-input");
    const strokeInput = document.getElementById("stroke-input");
    const opacityInput = document.getElementById("opacity-input");
    
    if (fillInput) fillInput.value = rgb2hex(style.backgroundColor);
    if (strokeInput) strokeInput.value = rgb2hex(style.borderColor);
    if (opacityInput) opacityInput.value = style.opacity;
  }

  // Wire up position controls
  const xInput = document.getElementById("x-input");
  const yInput = document.getElementById("y-input");
  if (xInput) xInput.addEventListener('input', e => {
    if (selectedEl) {
      selectedEl.style.position = 'absolute';
      selectedEl.style.left = e.target.value + 'px';
      handleEdit('left', e.target.value + 'px');
    }
  });
  if (yInput) yInput.addEventListener('input', e => {
    if (selectedEl) {
      selectedEl.style.position = 'absolute';
      selectedEl.style.top = e.target.value + 'px';
      handleEdit('top', e.target.value + 'px');
    }
  });

  // Wire up size controls
  const wInput = document.getElementById("w-input");
  const hInput = document.getElementById("h-input");
  if (wInput) wInput.addEventListener('input', e => {
    updateSelectedStyle('width', e.target.value + 'px');
  });
  if (hInput) hInput.addEventListener('input', e => {
    updateSelectedStyle('height', e.target.value + 'px');
  });

  // Wire up style controls
  const fillInput = document.getElementById("fill-input");
  const strokeInput = document.getElementById("stroke-input");
  const opacityInput = document.getElementById("opacity-input");
  
  if (fillInput) fillInput.addEventListener('input', e => {
    updateSelectedStyle('backgroundColor', e.target.value);
  });
  if (strokeInput) strokeInput.addEventListener('input', e => {
    updateSelectedStyle('borderColor', e.target.value);
    updateSelectedStyle('borderStyle', 'solid');
    updateSelectedStyle('borderWidth', '2px');
  });
  if (opacityInput) opacityInput.addEventListener('input', e => {
    updateSelectedStyle('opacity', e.target.value);
  });

  // Wire up alignment buttons
  const alignLeftBtn = document.getElementById("align-left");
  const alignCenterBtn = document.getElementById("align-center");
  const alignRightBtn = document.getElementById("align-right");
  
  if (alignLeftBtn) alignLeftBtn.addEventListener('click', () => {
    updateSelectedStyle('textAlign', 'left');
    logToConsolePanel('Aligned left');
  });
  if (alignCenterBtn) alignCenterBtn.addEventListener('click', () => {
    updateSelectedStyle('textAlign', 'center');
    logToConsolePanel('Aligned center');
  });
  if (alignRightBtn) alignRightBtn.addEventListener('click', () => {
    updateSelectedStyle('textAlign', 'right');
    logToConsolePanel('Aligned right');
  });

  // Wire up commit button
  const commitBtn = document.getElementById("commit-btn");
  if (commitBtn) commitBtn.addEventListener('click', () => {
    if (!selectedEl) {
      logToConsolePanel("No element selected", "error");
      return;
    }
    logToConsolePanel("Committing changes...");
    onCommit();
  });

  // AI button is now handled by figmaPanelUI.js from the HTML template

  // Update the UI when element changes
  window.selectedEl = selectedEl;
  if (window.updateFigmaPanelInputs) {
    window.updateFigmaPanelInputs();
  }
}

function rgb2hex(rgb) {
  if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return '#000000';
  const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
  if (!match) return '#000000';
  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
} 