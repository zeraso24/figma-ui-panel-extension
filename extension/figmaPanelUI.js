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

  // Wire up Fill Controls
  wireUpFillControls(container, { getSelectedEl, onStyleEdit });

  // Wire up Stroke Controls
  wireUpStrokeControls(container, { getSelectedEl, onStyleEdit });
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
  
  // Update Fill Controls
  updateFillControls(container, element, style);
  
  // Update Stroke Controls
  updateStrokeControls(container, element, style);
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

// Wire up Fill Controls functionality
function wireUpFillControls(container, { getSelectedEl, onStyleEdit }) {
  let fillColorPicker = null;
  
  // Fill Color Swatch
  const fillColorSwatch = container.querySelector('.FillColorSwatch');
  if (fillColorSwatch) {
    console.log('🎨 Found FillColorSwatch element:', fillColorSwatch);
    fillColorSwatch.style.cursor = 'pointer';
    fillColorSwatch.addEventListener('click', (e) => {
      console.log('🎨 FillColorSwatch clicked!');
      e.preventDefault();
      e.stopPropagation();
      
      // Get current color from the swatch
      const currentColor = fillColorSwatch.style.background || '#FFFFFF';
      console.log('🎨 Current color:', currentColor);
      
      // Check if ColorPicker is available
      if (typeof window.ColorPicker === 'undefined') {
        console.error('❌ ColorPicker not available!');
        console.error('❌ Available window properties:', Object.keys(window).filter(key => key.includes('Color')));
        
        // Fallback to native color picker
        console.log('🎨 Using fallback native color picker...');
        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.value = currentColor;
        colorPicker.style.position = 'absolute';
        colorPicker.style.left = '-9999px';
        document.body.appendChild(colorPicker);
        
        colorPicker.addEventListener('change', (e) => {
          const color = e.target.value;
          fillColorSwatch.style.background = color;
          const colorValue = container.querySelector('.FillColorValue');
          if (colorValue) {
            colorValue.textContent = color.toUpperCase();
          }
          
          const el = getSelectedEl();
          if (el) {
            onStyleEdit('backgroundColor', color);
          }
          
          document.body.removeChild(colorPicker);
        });
        
        colorPicker.click();
        return;
      }
      
      console.log('🎨 ColorPicker is available, creating instance...');
      
      // Create and open custom color picker
      if (!fillColorPicker) {
        fillColorPicker = new window.ColorPicker({
          initialColor: currentColor,
          onChange: (color) => {
            const hexColor = fillColorPicker.getColor();
            fillColorSwatch.style.background = hexColor;
            const colorValue = container.querySelector('.FillColorValue');
            if (colorValue) {
              colorValue.textContent = hexColor.toUpperCase();
            }
            
            const el = getSelectedEl();
            if (el) {
              onStyleEdit('backgroundColor', hexColor);
            }
            
            // Only log final color change, not during dragging
            console.log('🎨 Final fill color changed to:', hexColor);
          },
          onClose: () => {
            fillColorPicker = null;
          }
        });
      } else {
        fillColorPicker.close();
        fillColorPicker = null;
        return;
      }
      
      // Position the picker on the left side of the UI
      const sidebar = document.querySelector('#figma-sidebar');
      const sidebarRect = sidebar.getBoundingClientRect();
      fillColorPicker.open(sidebarRect.left - 300, sidebarRect.top + 50);
    });
  }

  // Fill Color Input
  const fillColorInput = container.querySelector('.FillColorInput');
  if (fillColorInput) {
    fillColorInput.addEventListener('click', () => {
      fillColorInput.contentEditable = true;
      fillColorInput.focus();
    });
    
    fillColorInput.addEventListener('blur', (e) => {
      const color = e.target.textContent;
      if (color.match(/^#[0-9A-Fa-f]{6}$/)) {
        const el = getSelectedEl();
        if (el) {
          onStyleEdit('backgroundColor', color);
        }
        const swatch = container.querySelector('.FillColorSwatch');
        if (swatch) {
          swatch.style.background = color;
        }
      }
      fillColorInput.contentEditable = false;
    });
  }

  // Fill Opacity Input
  const fillOpacityInput = container.querySelector('.FillOpacityInput');
  if (fillOpacityInput) {
    fillOpacityInput.addEventListener('click', () => {
      fillOpacityInput.contentEditable = true;
      fillOpacityInput.focus();
    });
    
    fillOpacityInput.addEventListener('blur', (e) => {
      const opacity = parseFloat(e.target.textContent) / 100;
      if (!isNaN(opacity) && opacity >= 0 && opacity <= 1) {
        const el = getSelectedEl();
        if (el) {
          onStyleEdit('opacity', opacity.toString());
        }
      }
      fillOpacityInput.contentEditable = false;
    });
  }

  // Fill Visibility Toggle
  const fillVisibilityToggle = container.querySelector('.FillVisibilityToggle');
  if (fillVisibilityToggle) {
    fillVisibilityToggle.addEventListener('click', () => {
      const el = getSelectedEl();
      if (el) {
        const currentOpacity = parseFloat(el.style.opacity) || 1;
        const newOpacity = currentOpacity === 0 ? 1 : 0;
        onStyleEdit('opacity', newOpacity.toString());
        
        // Update UI
        const opacityValue = container.querySelector('.FillOpacityValue');
        if (opacityValue) {
          opacityValue.textContent = `${Math.round(newOpacity * 100)}%`;
        }
      }
    });
  }

  // Remove Fill Button
  const removeFillButton = container.querySelector('.RemoveFillButton');
  if (removeFillButton) {
    removeFillButton.addEventListener('click', () => {
      const el = getSelectedEl();
      if (el) {
        onStyleEdit('backgroundColor', 'transparent');
        
        // Update UI
        const swatch = container.querySelector('.FillColorSwatch');
        if (swatch) {
          swatch.style.background = 'transparent';
        }
        const colorValue = container.querySelector('.FillColorValue');
        if (colorValue) {
          colorValue.textContent = 'transparent';
        }
      }
    });
  }

  // Fill Type Dropdown
  const fillTypeDropdown = container.querySelector('.FillTypeDropdown');
  if (fillTypeDropdown) {
    fillTypeDropdown.addEventListener('click', () => {
      // Toggle between Solid, Gradient, Image
      const typeValue = container.querySelector('.FillTypeValue');
      if (typeValue) {
        const types = ['Solid', 'Gradient', 'Image'];
        const currentIndex = types.indexOf(typeValue.textContent);
        const nextIndex = (currentIndex + 1) % types.length;
        typeValue.textContent = types[nextIndex];
        
        // Log the change
        console.log(`Fill type changed to: ${types[nextIndex]}`);
        if (window.logToConsolePanel) {
          window.logToConsolePanel(`Fill type changed to: ${types[nextIndex]}`, 'info');
        }
      }
    });
  }

  // Blend Mode Dropdown
  const blendModeDropdown = container.querySelector('.BlendModeDropdown');
  if (blendModeDropdown) {
    blendModeDropdown.addEventListener('click', () => {
      const modeValue = container.querySelector('.BlendModeValue');
      if (modeValue) {
        const modes = ['Normal', 'Multiply', 'Screen', 'Overlay', 'Darken', 'Lighten'];
        const currentIndex = modes.indexOf(modeValue.textContent);
        const nextIndex = (currentIndex + 1) % modes.length;
        modeValue.textContent = modes[nextIndex];
        
        const el = getSelectedEl();
        if (el) {
          onStyleEdit('mixBlendMode', modes[nextIndex].toLowerCase());
        }
      }
    });
  }

  // No Fill Toggle
  const noFillToggle = container.querySelector('.NoFillToggle');
  if (noFillToggle) {
    noFillToggle.addEventListener('click', () => {
      const el = getSelectedEl();
      if (el) {
        onStyleEdit('backgroundColor', 'transparent');
        
        // Update UI
        const swatch = container.querySelector('.FillColorSwatch');
        if (swatch) {
          swatch.style.background = 'transparent';
        }
        const colorValue = container.querySelector('.FillColorValue');
        if (colorValue) {
          colorValue.textContent = 'transparent';
        }
      }
    });
  }
}

// Wire up Stroke Controls functionality
function wireUpStrokeControls(container, { getSelectedEl, onStyleEdit }) {
  let strokeColorPicker = null;
  
  // Stroke Color Swatch
  const strokeColorSwatch = container.querySelector('.StrokeColorSwatch');
  if (strokeColorSwatch) {
    strokeColorSwatch.style.cursor = 'pointer';
    strokeColorSwatch.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Get current color from the swatch
      const currentColor = strokeColorSwatch.style.background || '#000000';
      
      // Create and open custom color picker
      if (!strokeColorPicker) {
        strokeColorPicker = new window.ColorPicker({
          initialColor: currentColor,
          onChange: (color) => {
            const hexColor = strokeColorPicker.getColor();
            strokeColorSwatch.style.background = hexColor;
            const colorValue = container.querySelector('.StrokeColorValue');
            if (colorValue) {
              colorValue.textContent = hexColor.toUpperCase();
            }
            
            const el = getSelectedEl();
            if (el) {
              onStyleEdit('borderColor', hexColor);
            }
            
            // Only log final color change, not during dragging
            console.log('🎨 Final stroke color changed to:', hexColor);
          },
          onClose: () => {
            strokeColorPicker = null;
          }
        });
      } else {
        strokeColorPicker.close();
        strokeColorPicker = null;
        return;
      }
      
      // Position the picker on the left side of the UI
      const sidebar = document.querySelector('#figma-sidebar');
      const sidebarRect = sidebar.getBoundingClientRect();
      strokeColorPicker.open(sidebarRect.left - 300, sidebarRect.top + 50);
    });
  }

  // Stroke Color Input
  const strokeColorInput = container.querySelector('.StrokeColorInput');
  if (strokeColorInput) {
    strokeColorInput.addEventListener('click', () => {
      strokeColorInput.contentEditable = true;
      strokeColorInput.focus();
    });
    
    strokeColorInput.addEventListener('blur', (e) => {
      const color = e.target.textContent;
      if (color.match(/^#[0-9A-Fa-f]{6}$/)) {
        const el = getSelectedEl();
        if (el) {
          onStyleEdit('borderColor', color);
        }
        const swatch = container.querySelector('.StrokeColorSwatch');
        if (swatch) {
          swatch.style.background = color;
        }
      }
      strokeColorInput.contentEditable = false;
    });
  }

  // Stroke Opacity Input
  const strokeOpacityInput = container.querySelector('.StrokeOpacityInput');
  if (strokeOpacityInput) {
    strokeOpacityInput.addEventListener('click', () => {
      strokeOpacityInput.contentEditable = true;
      strokeOpacityInput.focus();
    });
    
    strokeOpacityInput.addEventListener('blur', (e) => {
      const opacity = parseFloat(e.target.textContent) / 100;
      if (!isNaN(opacity) && opacity >= 0 && opacity <= 1) {
        const el = getSelectedEl();
        if (el) {
          // For stroke opacity, we need to use rgba color
          const currentColor = el.style.borderColor || '#000000';
          const rgbaColor = hexToRgba(currentColor, opacity);
          onStyleEdit('borderColor', rgbaColor);
        }
      }
      strokeOpacityInput.contentEditable = false;
    });
  }

  // Stroke Visibility Toggle
  const strokeVisibilityToggle = container.querySelector('.StrokeVisibilityToggle');
  if (strokeVisibilityToggle) {
    strokeVisibilityToggle.addEventListener('click', () => {
      const el = getSelectedEl();
      if (el) {
        const currentBorder = el.style.border;
        const newBorder = currentBorder === 'none' ? '1px solid #000000' : 'none';
        onStyleEdit('border', newBorder);
        
        // Update UI
        const widthValue = container.querySelector('.StrokeWidthValue');
        if (widthValue) {
          widthValue.textContent = newBorder === 'none' ? '0' : '1';
        }
      }
    });
  }

  // Remove Stroke Button
  const removeStrokeButton = container.querySelector('.RemoveStrokeButton');
  if (removeStrokeButton) {
    removeStrokeButton.addEventListener('click', () => {
      const el = getSelectedEl();
      if (el) {
        onStyleEdit('border', 'none');
        
        // Update UI
        const widthValue = container.querySelector('.StrokeWidthValue');
        if (widthValue) {
          widthValue.textContent = '0';
        }
      }
    });
  }

  // Stroke Alignment Dropdown
  const strokeAlignmentDropdown = container.querySelector('.StrokeAlignmentDropdown');
  if (strokeAlignmentDropdown) {
    strokeAlignmentDropdown.addEventListener('click', () => {
      const alignmentValue = container.querySelector('.StrokeAlignmentValue');
      if (alignmentValue) {
        const alignments = ['Inside', 'Center', 'Outside'];
        const currentIndex = alignments.indexOf(alignmentValue.textContent);
        const nextIndex = (currentIndex + 1) % alignments.length;
        alignmentValue.textContent = alignments[nextIndex];
        
        console.log(`Stroke alignment changed to: ${alignments[nextIndex]}`);
        if (window.logToConsolePanel) {
          window.logToConsolePanel(`Stroke alignment changed to: ${alignments[nextIndex]}`, 'info');
        }
      }
    });
  }

  // Stroke Width Input
  const strokeStyleInput = container.querySelector('.StrokeStyleInput');
  if (strokeStyleInput) {
    strokeStyleInput.addEventListener('click', () => {
      const widthValue = container.querySelector('.StrokeWidthValue');
      if (widthValue) {
        widthValue.contentEditable = true;
        widthValue.focus();
      }
    });
    
    const widthValue = container.querySelector('.StrokeWidthValue');
    if (widthValue) {
      widthValue.addEventListener('blur', (e) => {
        const width = parseFloat(e.target.textContent);
        if (!isNaN(width) && width >= 0) {
          const el = getSelectedEl();
          if (el) {
            const currentBorder = el.style.border;
            const borderColor = el.style.borderColor || '#000000';
            onStyleEdit('border', `${width}px solid ${borderColor}`);
          }
        }
        widthValue.contentEditable = false;
      });
    }
  }

  // No Stroke Toggle
  const noStrokeToggle = container.querySelector('.NoStrokeToggle');
  if (noStrokeToggle) {
    noStrokeToggle.addEventListener('click', () => {
      const el = getSelectedEl();
      if (el) {
        onStyleEdit('border', 'none');
        
        // Update UI
        const widthValue = container.querySelector('.StrokeWidthValue');
        if (widthValue) {
          widthValue.textContent = '0';
        }
      }
    });
  }
}

// Helper function to convert hex to rgba
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Update Fill Controls with current element values
function updateFillControls(container, element, style) {
  // Update Fill Color Swatch and Value
  const fillColorSwatch = container.querySelector('.FillColorSwatch');
  const fillColorValue = container.querySelector('.FillColorValue');
  const backgroundColor = style.backgroundColor;
  
  if (fillColorSwatch && fillColorValue) {
    if (backgroundColor === 'transparent' || backgroundColor === 'rgba(0, 0, 0, 0)') {
      fillColorSwatch.style.background = 'transparent';
      fillColorValue.textContent = 'transparent';
    } else {
      // Convert rgba to hex if needed
      const hexColor = rgbaToHex(backgroundColor);
      fillColorSwatch.style.background = hexColor;
      fillColorValue.textContent = hexColor.toUpperCase();
    }
  }
  
  // Update Fill Opacity
  const fillOpacityValue = container.querySelector('.FillOpacityValue');
  if (fillOpacityValue) {
    const opacity = Math.round(parseFloat(style.opacity) * 100);
    fillOpacityValue.textContent = `${opacity}%`;
  }
}

// Update Stroke Controls with current element values
function updateStrokeControls(container, element, style) {
  // Update Stroke Color Swatch and Value
  const strokeColorSwatch = container.querySelector('.StrokeColorSwatch');
  const strokeColorValue = container.querySelector('.StrokeColorValue');
  const borderColor = style.borderColor;
  
  if (strokeColorSwatch && strokeColorValue) {
    if (borderColor === 'transparent' || borderColor === 'rgba(0, 0, 0, 0)') {
      strokeColorSwatch.style.background = 'transparent';
      strokeColorValue.textContent = 'transparent';
    } else {
      // Convert rgba to hex if needed
      const hexColor = rgbaToHex(borderColor);
      strokeColorSwatch.style.background = hexColor;
      strokeColorValue.textContent = hexColor.toUpperCase();
    }
  }
  
  // Update Stroke Width
  const strokeWidthValue = container.querySelector('.StrokeWidthValue');
  if (strokeWidthValue) {
    const border = style.border;
    if (border === 'none') {
      strokeWidthValue.textContent = '0';
    } else {
      const widthMatch = border.match(/(\d+)px/);
      if (widthMatch) {
        strokeWidthValue.textContent = widthMatch[1];
      } else {
        strokeWidthValue.textContent = '1';
      }
    }
  }
  
  // Update Stroke Opacity
  const strokeOpacityValue = container.querySelector('.StrokeOpacityValue');
  if (strokeOpacityValue) {
    const borderColor = style.borderColor;
    if (borderColor.includes('rgba')) {
      const alphaMatch = borderColor.match(/rgba\([^)]+,\s*([^)]+)\)/);
      if (alphaMatch) {
        const alpha = parseFloat(alphaMatch[1]);
        strokeOpacityValue.textContent = `${Math.round(alpha * 100)}%`;
      } else {
        strokeOpacityValue.textContent = '100%';
      }
    } else {
      strokeOpacityValue.textContent = '100%';
    }
  }
}

// Helper function to convert rgba to hex
function rgbaToHex(rgba) {
  if (rgba.startsWith('#')) {
    return rgba;
  }
  
  if (rgba.startsWith('rgb')) {
    const match = rgba.match(/rgba?\(([^)]+)\)/);
    if (match) {
      const values = match[1].split(',').map(v => parseInt(v.trim()));
      if (values.length >= 3) {
        const r = values[0];
        const g = values[1];
        const b = values[2];
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      }
    }
  }
  
  return '#000000'; // fallback
} 