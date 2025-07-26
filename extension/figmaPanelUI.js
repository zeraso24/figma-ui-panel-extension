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
  
  // Position alignment buttons - Horizontal alignment
  const horizontalAlignButtons = {
    'ButtonAlignLeft': () => onStyleEdit('textAlign', 'left'),
    'ButtonAlignHorizontalCenters': () => onStyleEdit('textAlign', 'center'),
    'ButtonAlignRight': () => onStyleEdit('textAlign', 'right')
  };
  
  // Position alignment buttons - Vertical alignment
  const verticalAlignButtons = {
    'ButtonAlignTop': () => onStyleEdit('verticalAlign', 'top'),
    'ButtonAlignVerticalCenters': () => onStyleEdit('verticalAlign', 'middle'),
    'ButtonAlignBottom': () => onStyleEdit('verticalAlign', 'bottom')
  };
  
  // Wire up horizontal alignment buttons
  Object.entries(horizontalAlignButtons).forEach(([className, handler]) => {
    const button = container.querySelector(`.${className}`);
    if (button) {
      button.style.cursor = 'pointer';
      button.addEventListener('click', () => {
        handler();
        // Update UI to reflect the change
        const el = getSelectedEl();
        if (el) {
          updateUIFromSelectedElement(container, el);
        }
      });
      
      // Add hover effects
      button.addEventListener('mouseenter', () => {
        button.style.background = '#E0E0E0';
      });
      button.addEventListener('mouseleave', () => {
        button.style.background = '#F5F5F5';
      });
    }
  });
  
  // Wire up vertical alignment buttons
  Object.entries(verticalAlignButtons).forEach(([className, handler]) => {
    const button = container.querySelector(`.${className}`);
    if (button) {
      button.style.cursor = 'pointer';
      button.addEventListener('click', () => {
        handler();
        // Update UI to reflect the change
        const el = getSelectedEl();
        if (el) {
          updateUIFromSelectedElement(container, el);
        }
      });
      
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
        const value = e.target.textContent.replace(/[^\d.-]/g, '');
        onStyleEdit('left', value + 'px');
      }
    });
    
    // Handle Enter key to commit changes
    xInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        xInput.blur();
      }
    });
  }
  
  if (yInput) {
    yInput.contentEditable = true;
    yInput.addEventListener('input', (e) => {
      const el = getSelectedEl();
      if (el) {
        const value = e.target.textContent.replace(/[^\d.-]/g, '');
        onStyleEdit('top', value + 'px');
      }
    });
    
    // Handle Enter key to commit changes
    yInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        yInput.blur();
      }
    });
  }
  
  // Wire up rotation input with proper input field approach
  const rotationInput = container.querySelector('[data-layer="0°"]');
  if (rotationInput) {
    // Create a proper input field by replacing the contentEditable div
    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.value = '0°';
    inputField.style.cssText = `
      width: auto;
      height: 14px;
      left: 0px;
      top: 0px;
      position: relative;
      justify-content: center;
      display: flex;
      flex-direction: column;
      color: rgba(0, 0, 0, 0.9);
      font-size: 11px;
      font-family: Inter;
      font-weight: 500;
      letter-spacing: 0.05px;
      overflow-wrap: break-word;
      min-width: 12px;
      max-width: 80px;
      padding: 0px 4px;
      box-sizing: border-box;
      overflow: visible;
      border: none;
      background-color: transparent;
      outline: none;
      transition: all 0.2s ease;
    `;
    
    // Replace the contentEditable div with the input
    rotationInput.parentNode.replaceChild(inputField, rotationInput);
    
    // Add hover and focus effects
    inputField.addEventListener('mouseenter', () => {
      inputField.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
    });
    
    inputField.addEventListener('mouseleave', () => {
      if (!inputField.matches(':focus')) {
        inputField.style.backgroundColor = 'transparent';
      }
    });
    
    inputField.addEventListener('focus', () => {
      inputField.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
      inputField.style.outline = '1px solid #0077EE';
      inputField.select(); // Select all text when focused
    });
    
    inputField.addEventListener('blur', () => {
      inputField.style.backgroundColor = 'transparent';
      inputField.style.outline = 'none';
      
      // Set default value if empty or only contains degree symbol
      if (inputField.value === '' || inputField.value === '°' || inputField.value.replace(/[^\d.-]/g, '') === '') {
        inputField.value = '0°';
        const el = getSelectedEl();
        if (el) {
          onStyleEdit('transform', 'rotate(0deg)');
        }
      }
    });
    
    // Handle input changes
    inputField.addEventListener('input', (e) => {
      const el = getSelectedEl();
      if (el) {
        // Remove degree symbol for processing, only allow numbers, decimal point, and minus sign
        const cleanValue = e.target.value.replace(/[^\d.-]/g, '');
        
        // Update the input to show the clean value with degree symbol
        if (cleanValue === '') {
          e.target.value = '0°';
          onStyleEdit('transform', 'rotate(0deg)');
        } else {
          e.target.value = cleanValue + '°';
          onStyleEdit('transform', `rotate(${cleanValue}deg)`);
        }
      }
    });
    
    // Handle keydown for validation
    inputField.addEventListener('keydown', (e) => {
      // Allow all navigation and editing keys
      if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Tab', 'Enter', 'Escape'].includes(e.key)) {
        return; // Don't prevent default for these keys
      }
      
      // Allow modifier keys (Ctrl, Cmd, etc.)
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
        return; // Don't prevent default for modifier combinations
      }
      
      // Only allow numbers, decimal point, minus sign, and degree symbol
      if (!/[\d.-°]/.test(e.key)) {
        e.preventDefault();
      }
    });
    
    // Handle Enter to commit
    inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        inputField.blur();
      }
    });
    
    // Handle paste event to clean input
    inputField.addEventListener('paste', (e) => {
      e.preventDefault();
      const pastedText = (e.clipboardData || window.clipboardData).getData('text');
      const cleanValue = pastedText.replace(/[^\d.-]/g, '');
      if (cleanValue) {
        inputField.value = cleanValue;
        inputField.dispatchEvent(new Event('input'));
      }
    });
    
    // Store reference to the new input field for updates
    container.rotationInputField = inputField;
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
    
    // Add hover effects
    rotateButton.addEventListener('mouseenter', () => {
      rotateButton.style.background = '#E0E0E0';
    });
    rotateButton.addEventListener('mouseleave', () => {
      rotateButton.style.background = '#F5F5F5';
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
        let newTransform;
        
        if (hasFlipX) {
          // Remove horizontal flip
          newTransform = currentTransform.replace('scaleX(-1)', '').trim();
        } else {
          // Add horizontal flip
          newTransform = currentTransform + ' scaleX(-1)';
        }
        
        onStyleEdit('transform', newTransform);
        updateUIFromSelectedElement(container, el);
      }
    });
    
    // Add hover effects
    flipHorizontal.addEventListener('mouseenter', () => {
      flipHorizontal.style.background = '#E0E0E0';
    });
    flipHorizontal.addEventListener('mouseleave', () => {
      flipHorizontal.style.background = '#F5F5F5';
    });
  }
  
  if (flipVertical) {
    flipVertical.style.cursor = 'pointer';
    flipVertical.addEventListener('click', () => {
      const el = getSelectedEl();
      if (el) {
        const currentTransform = el.style.transform || '';
        const hasFlipY = currentTransform.includes('scaleY(-1)');
        let newTransform;
        
        if (hasFlipY) {
          // Remove vertical flip
          newTransform = currentTransform.replace('scaleY(-1)', '').trim();
        } else {
          // Add vertical flip
          newTransform = currentTransform + ' scaleY(-1)';
        }
        
        onStyleEdit('transform', newTransform);
        updateUIFromSelectedElement(container, el);
      }
    });
    
    // Add hover effects
    flipVertical.addEventListener('mouseenter', () => {
      flipVertical.style.background = '#E0E0E0';
    });
    flipVertical.addEventListener('mouseleave', () => {
      flipVertical.style.background = '#F5F5F5';
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

                  // Wire up individual corners button
                const individualCornersButton = container.querySelector('[data-layer="Button dialog - Individual corners"]');
                if (individualCornersButton) {
                  individualCornersButton.style.cursor = 'pointer';
                  individualCornersButton.addEventListener('click', () => {
                    // Toggle dropdown for individual corners
                    const existingDropdown = document.querySelector('.individual-corners-dropdown');
                    if (existingDropdown) {
                      existingDropdown.remove();
                    } else {
                      // Show individual corner dropdown
                      showIndividualCornerDropdown(individualCornersButton, { getSelectedEl, onStyleEdit });
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

  // Fix rotation input container styling
  fixRotationInputContainer(container);

  // Hide eye icons for now
  const eyeIcons = container.querySelectorAll('[data-layer="EyeIcon"]');
  eyeIcons.forEach(eyeIcon => {
    eyeIcon.style.display = 'none';
  });

  // Hide fill dialog button for now
  const fillDialogButton = container.querySelector('[data-layer="Button dialog - Fill, Apply styles and variables"]');
  if (fillDialogButton) {
    fillDialogButton.style.display = 'none';
  }

  // Hide fill visibility toggle container
  const fillVisibilityToggle = container.querySelector('[data-layer="FillVisibilityToggle"]');
  if (fillVisibilityToggle) {
    fillVisibilityToggle.style.display = 'none';
  }

  // Hide stroke visibility toggle container
  const strokeVisibilityToggle = container.querySelector('[data-layer="StrokeVisibilityToggle"]');
  if (strokeVisibilityToggle) {
    strokeVisibilityToggle.style.display = 'none';
  }
}

// Update UI values from selected element
function updateUIFromSelectedElement(container, element) {
  // X/Y position
  const xInput = container.querySelector('[data-layer="32464"]');
  const yInput = container.querySelector('[data-layer="20162"]');
  // Width/height
  const widthInput = container.querySelector('[data-layer="1600"]');
  const heightInput = container.querySelector('[data-layer="960"]');
  // Rotation
  const rotationInput = container.querySelector('[data-layer="0°"]');
  // Opacity
  const opacityInput = container.querySelector('[data-layer="100%"]');
  // Border radius
  const radiusInput = container.querySelector('[data-layer="0"]');
  // Alignment
  const alignLeft = container.querySelector('.ButtonAlignLeft');
  const alignCenter = container.querySelector('.ButtonAlignHorizontalCenters');
  const alignRight = container.querySelector('.ButtonAlignRight');
  const alignTop = container.querySelector('.ButtonAlignTop');
  const alignMiddle = container.querySelector('.ButtonAlignVerticalCenters');
  const alignBottom = container.querySelector('.ButtonAlignBottom');

  if (!element) {
    if (xInput) xInput.textContent = '';
    if (yInput) yInput.textContent = '';
    if (widthInput) widthInput.textContent = '';
    if (heightInput) heightInput.textContent = '';
    if (rotationInput) rotationInput.textContent = '';
    if (opacityInput) opacityInput.textContent = '';
    if (radiusInput) radiusInput.textContent = '';
    // Remove alignment highlights
    [alignLeft, alignCenter, alignRight, alignTop, alignMiddle, alignBottom].forEach(btn => {
      if (btn) btn.style.outline = '';
    });
    // Fill/Stroke controls
    updateFillControls(container, null, null);
    updateStrokeControls(container, null, null);
    return;
  }

  const rect = element.getBoundingClientRect();
  const style = getComputedStyle(element);

  if (xInput) xInput.textContent = style.left && style.left !== 'auto' ? parseInt(style.left) : Math.round(rect.left);
  if (yInput) yInput.textContent = style.top && style.top !== 'auto' ? parseInt(style.top) : Math.round(rect.top);
  if (widthInput) widthInput.textContent = style.width ? parseInt(style.width) : Math.round(rect.width);
  if (heightInput) heightInput.textContent = style.height ? parseInt(style.height) : Math.round(rect.height);
  if (rotationInput) {
    const rotation = getCurrentRotation(element);
    rotationInput.textContent = (rotation !== undefined && rotation !== null) ? rotation + '°' : '0°';
    
    // Ensure the styling is applied immediately
    if (!rotationInput.style.fontSize) {
      rotationInput.style.fontSize = '11px';
      rotationInput.style.fontWeight = '500';
      rotationInput.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, sans-serif';
    }
  }
  
  // Update the rotation input field (it's a proper input element)
  if (container.rotationInputField) {
    const rotation = getCurrentRotation(element);
    container.rotationInputField.value = (rotation !== undefined && rotation !== null) ? rotation.toString() + '°' : '0°';
  }
  if (opacityInput) {
    const opacity = style.opacity ? Math.round(parseFloat(style.opacity) * 100) : '';
    opacityInput.textContent = opacity !== '' ? opacity + '%' : '';
  }
  if (radiusInput) {
    const radius = style.borderRadius ? parseInt(style.borderRadius) : '';
    radiusInput.textContent = radius !== '' ? radius : '';
  }

  // Alignment (highlight the active button)
  [alignLeft, alignCenter, alignRight, alignTop, alignMiddle, alignBottom].forEach(btn => {
    if (btn) {
      btn.style.outline = '';
      btn.style.background = '#F5F5F5'; // Reset to default
    }
  });
  if (style.textAlign && alignLeft && style.textAlign === 'left') {
    alignLeft.style.outline = '2px solid #0077EE';
    alignLeft.style.background = '#CAD5E2';
  }
  if (style.textAlign && alignCenter && style.textAlign === 'center') {
    alignCenter.style.outline = '2px solid #0077EE';
    alignCenter.style.background = '#CAD5E2';
  }
  if (style.textAlign && alignRight && style.textAlign === 'right') {
    alignRight.style.outline = '2px solid #0077EE';
    alignRight.style.background = '#CAD5E2';
  }
  if (style.verticalAlign && alignTop && style.verticalAlign === 'top') {
    alignTop.style.outline = '2px solid #0077EE';
    alignTop.style.background = '#CAD5E2';
  }
  if (style.verticalAlign && alignMiddle && style.verticalAlign === 'middle') {
    alignMiddle.style.outline = '2px solid #0077EE';
    alignMiddle.style.background = '#CAD5E2';
  }
  if (style.verticalAlign && alignBottom && style.verticalAlign === 'bottom') {
    alignBottom.style.outline = '2px solid #0077EE';
    alignBottom.style.background = '#CAD5E2';
  }

  // Update individual corner inputs if they exist
  const cornerInputs = container.querySelectorAll('.corner-input');
  if (cornerInputs.length > 0) {
    updateIndividualCornerValues(container, element);
  }

  // Update Fill Controls
  updateFillControls(container, element, style);
  // Update Stroke Controls
  updateStrokeControls(container, element, style);
  
  // Fix rotation input container styling
  fixRotationInputContainer(container);
}

// Make updateUIFromSelectedElement globally available
window.updateUIFromSelectedElement = updateUIFromSelectedElement;

// Helper function to get current rotation
function getCurrentRotation(element) {
  const transform = element.style.transform || '';
  const match = transform.match(/rotate\(([^)]+)deg\)/);
  if (match) {
    const rotation = parseFloat(match[1]);
    // Normalize rotation to 0-360 range
    return ((rotation % 360) + 360) % 360;
  }
  return 0;
}

// Fix rotation input container to properly hug text content
function fixRotationInputContainer(container) {
  const rotationInput = container.querySelector('[data-layer="0°"]');
  const inputContainer = container.querySelector('.Input');
  const containerDiv = container.querySelector('.Container');
  
  if (rotationInput && inputContainer && containerDiv) {
    // Apply professional input styling
    inputContainer.style.cssText = `
      width: 100%;
      max-width: 120px;
      position: relative;
      font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
    `;
    
    containerDiv.style.cssText = `
      width: 100%;
      position: relative;
      display: flex;
      align-items: center;
    `;
    
    // Create a proper input field experience
    rotationInput.style.cssText = `
      width: 100%;
      height: 32px;
      padding: 0 12px;
      border: 1px solid #E0E0E0;
      border-radius: 4px;
      background-color: #FFFFFF;
      color: #333333;
      font-size: 11px;
      font-weight: 500;
      font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
      box-sizing: border-box;
      outline: none;
      transition: all 0.2s ease;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      white-space: nowrap;
      overflow: hidden;
    `;
    
    // Add hover effect
    rotationInput.addEventListener('mouseenter', () => {
      rotationInput.style.borderColor = '#CCCCCC';
      rotationInput.style.backgroundColor = '#FAFAFA';
    });
    
    rotationInput.addEventListener('mouseleave', () => {
      if (!rotationInput.matches(':focus')) {
        rotationInput.style.borderColor = '#E0E0E0';
        rotationInput.style.backgroundColor = '#FFFFFF';
      }
    });
    
    // Add focus effect
    rotationInput.addEventListener('focus', () => {
      rotationInput.style.borderColor = '#0077EE';
      rotationInput.style.boxShadow = '0 0 0 3px rgba(0, 119, 238, 0.1)';
      rotationInput.style.backgroundColor = '#FFFFFF';
    });
    
    rotationInput.addEventListener('blur', () => {
      rotationInput.style.borderColor = '#E0E0E0';
      rotationInput.style.boxShadow = 'none';
      rotationInput.style.backgroundColor = '#FFFFFF';
    });
    
    // Ensure it's properly editable
    rotationInput.contentEditable = true;
    rotationInput.spellcheck = false;
    rotationInput.setAttribute('role', 'textbox');
    rotationInput.setAttribute('aria-label', 'Rotation value in degrees');
  }
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
  
  if (!element || !style) {
    // Clear fill controls when no element is selected
    if (fillColorSwatch) {
      fillColorSwatch.style.background = '#FFFFFF';
    }
    if (fillColorValue) {
      fillColorValue.textContent = '';
    }
    return;
  }
  
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
  
  if (!element || !style) {
    // Clear stroke controls when no element is selected
    if (strokeColorSwatch) {
      strokeColorSwatch.style.background = '#000000';
    }
    if (strokeColorValue) {
      strokeColorValue.textContent = '';
    }
    
    // Clear stroke width
    const strokeWidthValue = container.querySelector('.StrokeWidthValue');
    if (strokeWidthValue) {
      strokeWidthValue.textContent = '';
    }
    
    // Clear stroke opacity
    const strokeOpacityValue = container.querySelector('.StrokeOpacityValue');
    if (strokeOpacityValue) {
      strokeOpacityValue.textContent = '';
    }
    return;
  }
  
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

// Helper function to show individual corner inputs
// Helper function to show individual corner dropdown
function showIndividualCornerDropdown(button, { getSelectedEl, onStyleEdit }) {
  // Remove any existing dropdown
  const existingDropdown = document.querySelector('.individual-corners-dropdown');
  if (existingDropdown) {
    existingDropdown.remove();
  }
  
  // Get button position
  const buttonRect = button.getBoundingClientRect();
  
  // Create dropdown container
  const dropdown = document.createElement('div');
  dropdown.className = 'individual-corners-dropdown';
  dropdown.style.cssText = `
    position: fixed;
    top: ${buttonRect.bottom + 5}px;
    left: ${buttonRect.left - 120}px;
    width: 140px;
    background: white;
    border: 1px solid #E6E6E6;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    padding: 12px;
  `;
  
  // Add title
  const title = document.createElement('div');
  title.style.cssText = `
    font-size: 11px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.90);
    margin-bottom: 8px;
    font-family: Inter;
  `;
  title.textContent = 'Individual Corners';
  dropdown.appendChild(title);
  
  // Create the 4-corner grid
  const cornersGrid = document.createElement('div');
  cornersGrid.style.cssText = `
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 6px;
  `;
  
  // Create individual corner inputs
  const corners = [
    { name: 'top-left', label: '↖' },
    { name: 'top-right', label: '↗' },
    { name: 'bottom-left', label: '↙' },
    { name: 'bottom-right', label: '↘' }
  ];
  
  corners.forEach(corner => {
    const cornerContainer = document.createElement('div');
    cornerContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    `;
    
    const cornerLabel = document.createElement('div');
    cornerLabel.style.cssText = `
      font-size: 10px;
      color: rgba(0, 0, 0, 0.6);
      font-family: Inter;
    `;
    cornerLabel.textContent = corner.label;
    
    const cornerInput = document.createElement('div');
    cornerInput.className = 'corner-input';
    cornerInput.setAttribute('data-corner', corner.name);
    cornerInput.style.cssText = `
      width: 40px;
      height: 24px;
      background: #F5F5F5;
      border: 1px solid #E6E6E6;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: text;
      font-size: 11px;
      color: rgba(0, 0, 0, 0.90);
      font-family: Inter;
      font-weight: 500;
    `;
    
    const valueSpan = document.createElement('span');
    valueSpan.className = 'corner-value';
    valueSpan.textContent = '0';
    
    cornerInput.appendChild(valueSpan);
    cornerContainer.appendChild(cornerLabel);
    cornerContainer.appendChild(cornerInput);
    cornersGrid.appendChild(cornerContainer);
    
    // Wire up the corner input
    cornerInput.addEventListener('click', (e) => {
      e.stopPropagation();
      cornerInput.contentEditable = true;
      cornerInput.focus();
    });
    
    cornerInput.addEventListener('input', (e) => {
      const el = getSelectedEl();
      if (el) {
        const value = parseInt(e.target.textContent) || 0;
        const style = getComputedStyle(el);
        const borderRadius = style.borderRadius;
        const values = parseBorderRadius(borderRadius);
        values[corner.name] = value;
        const newBorderRadius = formatBorderRadius(values);
        onStyleEdit('borderRadius', newBorderRadius);
      }
    });
    
    cornerInput.addEventListener('blur', () => {
      cornerInput.contentEditable = false;
      const el = getSelectedEl();
      if (el) {
        const style = getComputedStyle(el);
        const borderRadius = style.borderRadius;
        const values = parseBorderRadius(borderRadius);
        valueSpan.textContent = values[corner.name];
      }
    });
    
    cornerInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        cornerInput.blur();
      } else if (e.key === 'Escape') {
        const el = getSelectedEl();
        if (el) {
          const style = getComputedStyle(el);
          const borderRadius = style.borderRadius;
          const values = parseBorderRadius(borderRadius);
          valueSpan.textContent = values[corner.name];
        }
        cornerInput.blur();
      }
    });
  });
  
  dropdown.appendChild(cornersGrid);
  document.body.appendChild(dropdown);
  
  // Close dropdown when clicking outside
  const closeDropdown = (e) => {
    if (!dropdown.contains(e.target) && !button.contains(e.target)) {
      dropdown.remove();
      document.removeEventListener('click', closeDropdown);
    }
  };
  
  // Delay adding the event listener to avoid immediate closure
  setTimeout(() => {
    document.addEventListener('click', closeDropdown);
  }, 100);
  
  // Initialize with current values
  updateIndividualCornerValuesFromDropdown(dropdown, getSelectedEl());
}

// Helper function to update individual corner values in dropdown
function updateIndividualCornerValuesFromDropdown(dropdown, element) {
  if (!element || !dropdown) return;

  const style = getComputedStyle(element);
  const borderRadius = style.borderRadius;
  const values = parseBorderRadius(borderRadius);

  const cornerInputs = dropdown.querySelectorAll('.corner-input');
  cornerInputs.forEach(cornerInput => {
    const corner = cornerInput.getAttribute('data-corner');
    const valueSpan = cornerInput.querySelector('.corner-value');
    if (valueSpan && values[corner] !== undefined) {
      valueSpan.textContent = values[corner];
    }
  });
}

// Helper function to parse border radius values
function parseBorderRadius(borderRadius) {
  const values = borderRadius.split(' ').map(v => parseInt(v) || 0);
  
  // Handle different formats: single value, two values, four values
  if (values.length === 1) {
    return {
      'top-left': values[0],
      'top-right': values[0],
      'bottom-right': values[0],
      'bottom-left': values[0]
    };
  } else if (values.length === 2) {
    return {
      'top-left': values[0],
      'top-right': values[1],
      'bottom-right': values[0],
      'bottom-left': values[1]
    };
  } else if (values.length === 4) {
    return {
      'top-left': values[0],
      'top-right': values[1],
      'bottom-right': values[2],
      'bottom-left': values[3]
    };
  }
  
  return {
    'top-left': 0,
    'top-right': 0,
    'bottom-right': 0,
    'bottom-left': 0
  };
}

// Helper function to format border radius values
function formatBorderRadius(values) {
  const { 'top-left': tl, 'top-right': tr, 'bottom-right': br, 'bottom-left': bl } = values;
  
  // If all values are the same, use single value
  if (tl === tr && tr === br && br === bl) {
    return `${tl}px`;
  }
  
  // If top-left equals bottom-right and top-right equals bottom-left, use two values
  if (tl === br && tr === bl) {
    return `${tl}px ${tr}px`;
  }
  
  // Otherwise, use four values
  return `${tl}px ${tr}px ${br}px ${bl}px`;
}

// Helper function to update individual corner values
function updateIndividualCornerValues(container, element) {
  if (!element) return;
  
  const style = getComputedStyle(element);
  const borderRadius = style.borderRadius;
  const values = parseBorderRadius(borderRadius);
  
  // Find corner inputs in the entire document since they might be in a different container
  const cornerInputs = document.querySelectorAll('.corner-input');
  cornerInputs.forEach(cornerInput => {
    const corner = cornerInput.getAttribute('data-corner');
    const valueSpan = cornerInput.querySelector('.corner-value');
    if (valueSpan && values[corner] !== undefined) {
      valueSpan.textContent = values[corner];
    }
  });
}

// Helper function to update single corner value
function updateSingleCornerValue(container, element) {
  if (!element) return;
  
  const style = getComputedStyle(element);
  const borderRadius = style.borderRadius;
  const values = parseBorderRadius(borderRadius);
  
  // Use the first value (all should be the same in single mode)
  const radiusInput = container.querySelector('[data-layer="0"]');
  if (radiusInput) {
    radiusInput.textContent = values['top-left'];
  }
} 