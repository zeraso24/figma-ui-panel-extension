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

// Add keyboard shortcuts help panel
function addKeyboardShortcutsPanel(sidebar) {
  let shortcutsPanel = document.getElementById("keyboard-shortcuts-panel");
  if (!shortcutsPanel) {
    shortcutsPanel = document.createElement("div");
    shortcutsPanel.id = "keyboard-shortcuts-panel";
    shortcutsPanel.style.background = "#f8f9fa";
    shortcutsPanel.style.border = "1px solid #e9ecef";
    shortcutsPanel.style.borderRadius = "8px";
    shortcutsPanel.style.padding = "12px";
    shortcutsPanel.style.marginTop = "12px";
    shortcutsPanel.style.marginBottom = "12px";
    shortcutsPanel.style.fontSize = "11px";
    shortcutsPanel.style.color = "#495057";
    
    shortcutsPanel.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 8px; color: #212529;">⌨️ Keyboard Shortcuts</div>
      <div style="margin-bottom: 4px;"><strong>Shift</strong> - Select hovered element</div>
      <div style="margin-bottom: 4px;"><strong>Enter</strong> - Go inside element (first child)</div>
      <div style="margin-bottom: 4px;"><strong>Shift + Enter</strong> - Go to parent element</div>
      <div style="margin-bottom: 4px;"><strong>Escape</strong> - Deselect element</div>
    `;
    
    sidebar.appendChild(shortcutsPanel);
  }
  return shortcutsPanel;
}

// Add OpenRouter fallback function at the top-level
// Make fetchOpenRouterInstruction globally available
window.fetchOpenRouterInstruction = async function(prompt) {
  try {
    // Use the new API key with Qwen model
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
        model: "qwen/qwen3-coder:free", // Qwen model for code generation
        messages: [
          { 
            role: "system", 
            content: "You are an expert UI developer. Generate concise, practical CSS/HTML instructions for UI changes. Be specific and actionable. Focus on clean, production-ready code." 
          },
          { role: "user", content: prompt }
        ],
        max_tokens: 800, // More tokens for detailed instructions
        temperature: 0.1 // Very focused for code generation
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
    
    // Fallback to a detailed instruction format based on actual changes
    const currentEdits = window.edits || [];
    let fallbackInstructions = `Manual Instructions:
    
Based on your UI changes, here are the steps to implement them:

1. Open your CSS file or add a <style> tag`;

    if (currentEdits.length > 0) {
      // Deduplicate edits: only keep the last edit for each (selector, prop)
      const finalEdits = new Map();
      for (const edit of currentEdits) {
        const key = `${edit.selector}||${edit.prop}`;
        finalEdits.set(key, edit);
      }
      
      // Group final edits by element
      const elementGroups = new Map();
      for (const edit of finalEdits.values()) {
        if (!elementGroups.has(edit.selector)) {
          elementGroups.set(edit.selector, []);
        }
        elementGroups.get(edit.selector).push(edit);
      }

      elementGroups.forEach((edits, selector) => {
        fallbackInstructions += `\n\n2. Apply the following changes to element: ${selector}`;
        edits.forEach((edit) => {
          let propertyDescription = edit.prop;
          let valueDescription = edit.newValue;
          
          if (edit.prop === 'transform' && edit.newValue.includes('rotate')) {
            const match = edit.newValue.match(/rotate\(([^)]+)deg\)/);
            if (match) {
              propertyDescription = 'transform (rotation)';
              valueDescription = `rotate(${match[1]}deg)`;
            }
          } else if (edit.prop === 'left' || edit.prop === 'top') {
            propertyDescription = `position (${edit.prop})`;
          } else if (edit.prop === 'width' || edit.prop === 'height') {
            propertyDescription = `size (${edit.prop})`;
          } else if (edit.prop === 'backgroundColor') {
            propertyDescription = 'background color';
          } else if (edit.prop === 'borderColor') {
            propertyDescription = 'border color';
          } else if (edit.prop === 'textAlign') {
            propertyDescription = 'text alignment';
          } else if (edit.prop === 'opacity') {
            propertyDescription = 'opacity';
            valueDescription = `${Math.round(parseFloat(edit.newValue) * 100)}%`;
          } else if (edit.prop === 'borderRadius') {
            propertyDescription = 'border radius';
          }
          
          fallbackInstructions += `\n   - ${propertyDescription}: ${valueDescription}`;
        });
      });
    } else {
      fallbackInstructions += `\n2. Apply the following changes to the selected element:`;
      fallbackInstructions += `\n   - Use the CSS selector: ${getSelector(selectedEl || document.body)}`;
      fallbackInstructions += `\n   - Update the properties as shown in the console log`;
    }

    fallbackInstructions += `

3. Test the changes in your browser
4. Adjust as needed for your specific use case

Note: This is a fallback instruction. The AI service was unavailable, but all your changes have been logged in the console.`;

    return fallbackInstructions;
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
  
  // Add keyboard shortcuts help panel
  addKeyboardShortcutsPanel(sidebar);

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
    
    // Prevent default behavior for all clickable elements during selection mode
    // This prevents navigation, form submissions, and other default actions
    e.preventDefault();
    e.stopPropagation();
    
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
    
    // Also update the panel directly if the function exists
    const sidebar = document.getElementById('figma-sidebar');
    if (sidebar && window.updateUIFromSelectedElement) {
      // Find the container with the input fields - try multiple selectors
      const container = sidebar.querySelector('[data-layer="32464"]')?.parentNode?.parentNode?.parentNode || 
                       sidebar.querySelector('.Container') || 
                       sidebar;
      window.updateUIFromSelectedElement(container, selectedEl);
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

  // Enhanced keyboard navigation for element selection
  document.addEventListener('keydown', (e) => {
    // Only prevent default for our specific shortcuts, not all arrow keys
    if (['Shift', 'Enter', 'Escape'].includes(e.key)) {
      e.preventDefault();
    }
    
    switch (e.key) {
      case 'Shift':
        // Shift: Select the currently hovered element
        if (hoveredEl && hoveredEl !== selectedEl) {
          // Remove previous selection
          if (selectedEl) {
            selectedEl.style.outline = '';
          }
          
          selectedEl = hoveredEl;
          selectedEl.style.outline = '3px solid #0066FF'; // Blue solid border for selection
          
          // Update the global selected element reference
          window.selectedEl = selectedEl;
          
          // Update the Figma panel inputs with the new element's properties
          if (window.updateFigmaPanelInputs) {
            window.updateFigmaPanelInputs();
          }
          
          // Log detailed selection information
          const elementInfo = getElementInfo(selectedEl);
          console.log('🔵 SELECTED (Shift):', elementInfo.selector);
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
          
          logToConsolePanel(`Selected (Shift): ${elementInfo.selector}`);
        }
        break;
        
      case 'Enter':
        if (!selectedEl) return;
        
        if (e.shiftKey) {
          // Shift + Enter: Go to parent element
          const parentElement = selectedEl.parentElement;
          if (parentElement && parentElement !== document.body) {
            // Remove current selection
            selectedEl.style.outline = '';
            
            selectedEl = parentElement;
            selectedEl.style.outline = '3px solid #0066FF';
            window.selectedEl = selectedEl;
            
            // Update panel
            if (window.updateFigmaPanelInputs) {
              window.updateFigmaPanelInputs();
            }
            
            const elementInfo = getElementInfo(selectedEl);
            console.log('⬆️  MOVED TO PARENT:', elementInfo.selector);
            logToConsolePanel(`Moved to parent: ${elementInfo.selector}`);
          }
        } else {
          // Enter: Go to first child element
          const firstChild = selectedEl.firstElementChild;
          if (firstChild) {
            // Remove current selection
            selectedEl.style.outline = '';
            
            selectedEl = firstChild;
            selectedEl.style.outline = '3px solid #0066FF';
            window.selectedEl = selectedEl;
            
            // Update panel
            if (window.updateFigmaPanelInputs) {
              window.updateFigmaPanelInputs();
            }
            
            const elementInfo = getElementInfo(selectedEl);
            console.log('⬇️  MOVED TO CHILD:', elementInfo.selector);
            logToConsolePanel(`Moved to child: ${elementInfo.selector}`);
          }
        }
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
        break;
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