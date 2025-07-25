// Figma-like Properties Panel UI for the extension
// Handles rendering and event wiring for Position and Auto Layout sections

export function renderFigmaPanelUI({ sidebar, getSelectedEl, onStyleEdit }) {
  // Clear sidebar
  sidebar.innerHTML = '';

  // Load the HTML UI from FigmaPanel.html
  loadFigmaPanelHTML(sidebar, { getSelectedEl, onStyleEdit });
}

// Function to load and integrate the HTML UI
async function loadFigmaPanelHTML(sidebar, { getSelectedEl, onStyleEdit }) {
  try {
    // Load the HTML content
    const response = await fetch(chrome.runtime.getURL('FigmaPanel.html'));
    const htmlContent = await response.text();
    
    // Create a temporary container to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Get the main frame element
    const frameElement = tempDiv.querySelector('[data-layer="Frame"]');
    if (!frameElement) {
      throw new Error('Could not find Frame element in HTML');
    }
    
    // Clone the frame and add it to the sidebar
    const clonedFrame = frameElement.cloneNode(true);
    sidebar.appendChild(clonedFrame);
    
    // Wire up all the event handlers
    wireUpEventHandlers(clonedFrame, { getSelectedEl, onStyleEdit });
    
    // Initialize the UI with current element values
    updateUIFromSelectedElement(clonedFrame, getSelectedEl());
    
  } catch (error) {
    console.error('Error loading FigmaPanel HTML:', error);
    // Fallback to basic UI if HTML loading fails
    createFallbackUI(sidebar, { getSelectedEl, onStyleEdit });
  }
}

// Wire up all event handlers for the HTML UI
function wireUpEventHandlers(container, { getSelectedEl, onStyleEdit }) {
  
  // Position alignment buttons
  const alignButtons = {
    'ButtonAlignLeft': () => onStyleEdit('textAlign', 'left'),
    'ButtonAlignHorizontalCenters': () => onStyleEdit('textAlign', 'center'),
    'ButtonAlignRight': () => onStyleEdit('textAlign', 'right'),
    'ButtonAlignTop': () => onStyleEdit('verticalAlign', 'top'),
    'ButtonAlignVerticalCenters': () => onStyleEdit('verticalAlign', 'middle'),
    'ButtonAlignBottom': () => onStyleEdit('verticalAlign', 'bottom')
  };
  
  // Wire up alignment buttons
  Object.entries(alignButtons).forEach(([className, handler]) => {
    const button = container.querySelector(`.${className}`);
    if (button) {
      button.style.cursor = 'pointer';
      button.addEventListener('click', handler);
      
      // Add hover effects
      button.addEventListener('mouseenter', () => {
        button.style.background = '#E0E0E0';
      });
      button.addEventListener('mouseleave', () => {
        button.style.background = '#F5F5F5';
      });
    }
  });
  
  // Wire up X/Y position inputs
  const xInput = container.querySelector('[data-layer="32464"]');
  const yInput = container.querySelector('[data-layer="20162"]');
  
  if (xInput) {
    xInput.contentEditable = true;
    xInput.addEventListener('input', (e) => {
      const el = getSelectedEl();
      if (el) {
        onStyleEdit('left', e.target.textContent + 'px');
      }
    });
  }
  
  if (yInput) {
    yInput.contentEditable = true;
    yInput.addEventListener('input', (e) => {
      const el = getSelectedEl();
      if (el) {
        onStyleEdit('top', e.target.textContent + 'px');
      }
    });
  }
  
  // Wire up rotation input
  const rotationInput = container.querySelector('[data-layer="0°"]');
  if (rotationInput) {
    rotationInput.contentEditable = true;
    rotationInput.addEventListener('input', (e) => {
      const el = getSelectedEl();
      if (el) {
        const value = e.target.textContent.replace('°', '');
        onStyleEdit('transform', `rotate(${value}deg)`);
      }
    });
  }
  
  // Wire up rotation buttons
  const rotateButton = container.querySelector('.ButtonRotate90Right');
  if (rotateButton) {
    rotateButton.style.cursor = 'pointer';
    rotateButton.addEventListener('click', () => {
      const el = getSelectedEl();
      if (el) {
        const currentRotation = getCurrentRotation(el);
        const newRotation = (currentRotation + 90) % 360;
        onStyleEdit('transform', `rotate(${newRotation}deg)`);
        updateUIFromSelectedElement(container, el);
      }
    });
  }
  
  // Wire up flip buttons
  const flipHorizontal = container.querySelector('.ButtonFlipHorizontal');
  const flipVertical = container.querySelector('.ButtonFlipVertical');
  
  if (flipHorizontal) {
    flipHorizontal.style.cursor = 'pointer';
    flipHorizontal.addEventListener('click', () => {
      const el = getSelectedEl();
      if (el) {
        const currentTransform = el.style.transform || '';
        const hasFlipX = currentTransform.includes('scaleX(-1)');
        const newTransform = hasFlipX 
          ? currentTransform.replace('scaleX(-1)', '')
          : currentTransform + ' scaleX(-1)';
        onStyleEdit('transform', newTransform.trim());
      }
    });
  }
  
  if (flipVertical) {
    flipVertical.style.cursor = 'pointer';
    flipVertical.addEventListener('click', () => {
      const el = getSelectedEl();
      if (el) {
        const currentTransform = el.style.transform || '';
        const hasFlipY = currentTransform.includes('scaleY(-1)');
        const newTransform = hasFlipY 
          ? currentTransform.replace('scaleY(-1)', '')
          : currentTransform + ' scaleY(-1)';
        onStyleEdit('transform', newTransform.trim());
      }
    });
  }
  
  // Wire up width/height inputs
  const widthInput = container.querySelector('[data-layer="1600"]');
  const heightInput = container.querySelector('[data-layer="960"]');
  
  if (widthInput) {
    widthInput.contentEditable = true;
    widthInput.addEventListener('input', (e) => {
      const el = getSelectedEl();
      if (el) {
        onStyleEdit('width', e.target.textContent + 'px');
      }
    });
  }
  
  if (heightInput) {
    heightInput.contentEditable = true;
    heightInput.addEventListener('input', (e) => {
      const el = getSelectedEl();
      if (el) {
        onStyleEdit('height', e.target.textContent + 'px');
      }
    });
  }
  
  // Wire up opacity input
  const opacityInput = container.querySelector('[data-layer="100%"]');
  if (opacityInput) {
    opacityInput.contentEditable = true;
    opacityInput.addEventListener('input', (e) => {
      const el = getSelectedEl();
      if (el) {
        const value = e.target.textContent.replace('%', '');
        onStyleEdit('opacity', value / 100);
      }
    });
  }
  
  // Wire up corner radius input
  const radiusInput = container.querySelector('[data-layer="0"]');
  if (radiusInput) {
    radiusInput.contentEditable = true;
    radiusInput.addEventListener('input', (e) => {
      const el = getSelectedEl();
      if (el) {
        onStyleEdit('borderRadius', e.target.textContent + 'px');
      }
    });
  }
  
  // Wire up the "Generate Ai instructions" button
  const aiButton = container.querySelector('.GenerateAiInstructions');
  if (aiButton) {
    // Find the parent button element
    const buttonParent = aiButton.closest('.Button');
    if (buttonParent) {
      buttonParent.style.cursor = 'pointer';
      buttonParent.addEventListener('click', async () => {
        console.log('🤖 AI Button clicked!');
        
        // Log to console UI if available
        if (window.logToConsolePanel) {
          window.logToConsolePanel('🤖 AI Button clicked!', 'info');
        }
        
        // Get current edits from global window.edits
        const currentEdits = window.edits || [];
        
        if (currentEdits.length === 0) {
          console.log('❌ No edits to generate instructions for');
          if (window.logToConsolePanel) {
            window.logToConsolePanel('❌ No edits to generate instructions for', 'error');
          }
          return;
        }
        
        console.log('📝 Generating AI instructions for', currentEdits.length, 'edits');
        if (window.logToConsolePanel) {
          window.logToConsolePanel(`📝 Generating AI instructions for ${currentEdits.length} edits`, 'info');
        }
        
        // Build prompt for AI
        const prompt = `I made the following UI changes to a web page:

${currentEdits.map(edit => {
  let description = `- Changed ${edit.prop} from "${edit.oldValue}" to "${edit.newValue}" on element: ${edit.selector}`;
  
  // Add more context for position-related changes
  if (edit.prop === 'left' || edit.prop === 'top') {
    description += ` (position adjustment)`;
  } else if (edit.prop === 'width' || edit.prop === 'height') {
    description += ` (size adjustment)`;
  } else if (edit.prop === 'backgroundColor') {
    description += ` (background color change)`;
  } else if (edit.prop === 'borderColor') {
    description += ` (border color change)`;
  } else if (edit.prop === 'textAlign') {
    description += ` (text alignment)`;
  }
  
  return description;
}).join('\n')}

Please generate clear, step-by-step instructions for a developer to implement these changes in their code. Focus on practical CSS/HTML changes. Include specific CSS selectors and property values.`;

        try {
          // Call OpenRouter API using the global function
          if (window.fetchOpenRouterInstruction) {
            const instruction = await window.fetchOpenRouterInstruction(prompt);
            console.log('🤖 AI Instructions generated:', instruction);
            
            if (window.logToConsolePanel) {
              window.logToConsolePanel('🤖 AI Instructions generated successfully!', 'success');
            }
            
            // Try to copy to clipboard
            try {
              await navigator.clipboard.writeText(instruction);
              console.log('✅ Instructions copied to clipboard');
              if (window.logToConsolePanel) {
                window.logToConsolePanel('✅ Instructions copied to clipboard', 'success');
              }
            } catch (clipboardErr) {
              console.log('❌ Could not copy to clipboard:', clipboardErr);
              if (window.logToConsolePanel) {
                window.logToConsolePanel('❌ Could not copy to clipboard', 'error');
              }
            }
          } else {
            console.error('❌ fetchOpenRouterInstruction function not available');
            if (window.logToConsolePanel) {
              window.logToConsolePanel('❌ AI function not available', 'error');
            }
          }
        } catch (error) {
          console.error('❌ Error generating AI instructions:', error);
          if (window.logToConsolePanel) {
            window.logToConsolePanel(`❌ Error: ${error.message}`, 'error');
          }
        }
      });
      
      // Add hover effects
      buttonParent.addEventListener('mouseenter', () => {
        buttonParent.style.background = '#0077EE';
      });
      buttonParent.addEventListener('mouseleave', () => {
        buttonParent.style.background = '#0088FF';
      });
    }
  }
}

// Update UI values from selected element
function updateUIFromSelectedElement(container, element) {
  if (!element) return;
  
  const rect = element.getBoundingClientRect();
  const style = getComputedStyle(element);
  
  // Update X/Y position
  const xInput = container.querySelector('[data-layer="32464"]');
  const yInput = container.querySelector('[data-layer="20162"]');
  
  if (xInput) xInput.textContent = Math.round(rect.left);
  if (yInput) yInput.textContent = Math.round(rect.top);
  
  // Update width/height
  const widthInput = container.querySelector('[data-layer="1600"]');
  const heightInput = container.querySelector('[data-layer="960"]');
  
  if (widthInput) widthInput.textContent = Math.round(rect.width);
  if (heightInput) heightInput.textContent = Math.round(rect.height);
  
  // Update rotation
  const rotationInput = container.querySelector('[data-layer="0°"]');
  if (rotationInput) {
    const rotation = getCurrentRotation(element);
    rotationInput.textContent = rotation + '°';
  }
  
  // Update opacity
  const opacityInput = container.querySelector('[data-layer="100%"]');
  if (opacityInput) {
    const opacity = Math.round(parseFloat(style.opacity) * 100);
    opacityInput.textContent = opacity + '%';
  }
  
  // Update border radius
  const radiusInput = container.querySelector('[data-layer="0"]');
  if (radiusInput) {
    const radius = parseInt(style.borderRadius) || 0;
    radiusInput.textContent = radius;
  }
}

// Helper function to get current rotation
function getCurrentRotation(element) {
  const transform = element.style.transform || '';
  const match = transform.match(/rotate\(([^)]+)deg\)/);
  return match ? parseInt(match[1]) : 0;
}

// Fallback UI if HTML loading fails
function createFallbackUI(sidebar, { getSelectedEl, onStyleEdit }) {
  const fallbackDiv = document.createElement('div');
  fallbackDiv.innerHTML = `
    <div style="padding: 16px; color: #666;">
      <h3>Position Controls</h3>
      <p>HTML UI could not be loaded. Using fallback controls.</p>
      <div style="margin: 8px 0;">
        <label>X: <input type="number" id="fallback-x" style="width: 60px;"></label>
        <label>Y: <input type="number" id="fallback-y" style="width: 60px;"></label>
      </div>
      <div style="margin: 8px 0;">
        <label>Width: <input type="number" id="fallback-w" style="width: 60px;"></label>
        <label>Height: <input type="number" id="fallback-h" style="width: 60px;"></label>
      </div>
    </div>
  `;
  
  sidebar.appendChild(fallbackDiv);
  
  // Wire up fallback inputs
  const xInput = fallbackDiv.querySelector('#fallback-x');
  const yInput = fallbackDiv.querySelector('#fallback-y');
  const wInput = fallbackDiv.querySelector('#fallback-w');
  const hInput = fallbackDiv.querySelector('#fallback-h');
  
  if (xInput) xInput.addEventListener('input', (e) => onStyleEdit('left', e.target.value + 'px'));
  if (yInput) yInput.addEventListener('input', (e) => onStyleEdit('top', e.target.value + 'px'));
  if (wInput) wInput.addEventListener('input', (e) => onStyleEdit('width', e.target.value + 'px'));
  if (hInput) hInput.addEventListener('input', (e) => onStyleEdit('height', e.target.value + 'px'));
}

// Function to update inputs when element changes
function updateInputs() {
  // This function will be called from overlay.js when a new element is selected
  const container = document.querySelector('#figma-sidebar');
  if (container) {
    const selectedEl = window.selectedEl; // This should be set by overlay.js
    updateUIFromSelectedElement(container, selectedEl);
  }
}

// Expose update function globally so overlay.js can call it
window.updateFigmaPanelInputs = updateInputs; 