// Custom Color Picker Component
// Creates a professional color picker similar to design tools

// Make ColorPicker globally available
window.ColorPicker = class ColorPicker {
  constructor(options = {}) {
    this.onChange = options.onChange || (() => {});
    this.onClose = options.onClose || (() => {});
    this.initialColor = options.initialColor || '#FFFFFF';
    this.element = null;
    this.isOpen = false;
    this.isDragging = false;
    this.lastChangeTime = 0;
    
    this.currentColor = this.parseColor(this.initialColor);
    this.createPicker();
  }

  parseColor(color) {
    // Parse hex, rgb, rgba colors
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return { r, g, b, a: 1 };
    }
    
    if (color.startsWith('rgb')) {
      const match = color.match(/rgba?\(([^)]+)\)/);
      if (match) {
        const values = match[1].split(',').map(v => parseFloat(v.trim()));
        return {
          r: values[0],
          g: values[1],
          b: values[2],
          a: values[3] || 1
        };
      }
    }
    
    return { r: 255, g: 255, b: 255, a: 1 };
  }

  rgbToHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    const sum = max + min;

    let h = 0;
    let s = max === 0 ? 0 : diff / max;
    let v = max;

    if (diff !== 0) {
      switch (max) {
        case r:
          h = (g - b) / diff + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / diff + 2;
          break;
        case b:
          h = (r - g) / diff + 4;
          break;
      }
      h /= 6;
    }

    return { h, s, v };
  }

  hsvToRgb(h, s, v) {
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    let r, g, b;
    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  createPicker() {
    console.log('🎨 Creating color picker element...');
    const picker = document.createElement('div');
    picker.className = 'color-picker-popup';
    picker.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border: 3px solid #007AFF;
      border-radius: 8px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      padding: 16px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-width: 280px;
      display: none;
      visibility: hidden;
      opacity: 0;
    `;

    const hsv = this.rgbToHsv(this.currentColor.r, this.currentColor.g, this.currentColor.b);
    
    picker.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <h3 style="margin: 0; font-size: 14px; font-weight: 600; color: #333;">Color Picker</h3>
        <button class="color-picker-close" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #666;">×</button>
      </div>
      
      <div class="color-picker-main" style="margin-bottom: 16px;">
        <div class="color-picker-saturation" style="
          width: 240px;
          height: 160px;
          border-radius: 6px;
          position: relative;
          cursor: crosshair;
          background: linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hsv.h * 360}, 100%, 50%));
        ">
          <div class="color-picker-saturation-handle" style="
            position: absolute;
            width: 12px;
            height: 12px;
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 0 0 1px rgba(0,0,0,0.3);
            left: ${hsv.s * 100}%;
            top: ${(1 - hsv.v) * 100}%;
            transform: translate(-50%, -50%);
            pointer-events: none;
          "></div>
        </div>
      </div>
      
      <div class="color-picker-controls" style="margin-bottom: 16px;">
        <div class="color-picker-hue" style="
          width: 240px;
          height: 12px;
          border-radius: 6px;
          background: linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000);
          position: relative;
          cursor: pointer;
          margin-bottom: 8px;
        ">
          <div class="color-picker-hue-handle" style="
            position: absolute;
            width: 16px;
            height: 16px;
            background: white;
            border: 2px solid #ccc;
            border-radius: 50%;
            top: 50%;
            left: ${hsv.h * 100}%;
            transform: translate(-50%, -50%);
            pointer-events: none;
          "></div>
        </div>
        
        <div class="color-picker-opacity" style="
          width: 240px;
          height: 12px;
          border-radius: 6px;
          background-image: 
            linear-gradient(45deg, #ccc 25%, transparent 25%),
            linear-gradient(-45deg, #ccc 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #ccc 75%),
            linear-gradient(-45deg, transparent 75%, #ccc 75%);
          background-size: 8px 8px;
          background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
          position: relative;
          cursor: pointer;
        ">
          <div class="color-picker-opacity-gradient" style="
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: 6px;
            background: linear-gradient(to right, transparent, ${this.rgbToHex(this.currentColor.r, this.currentColor.g, this.currentColor.b)});
          "></div>
          <div class="color-picker-opacity-handle" style="
            position: absolute;
            width: 16px;
            height: 16px;
            background: white;
            border: 2px solid #ccc;
            border-radius: 50%;
            top: 50%;
            left: ${this.currentColor.a * 100}%;
            transform: translate(-50%, -50%);
            pointer-events: none;
          "></div>
        </div>
      </div>
      
      <div class="color-picker-inputs" style="display: flex; gap: 8px; align-items: center;">
        <div style="flex: 1;">
          <label style="display: block; font-size: 12px; color: #666; margin-bottom: 4px;">Hex</label>
          <input type="text" class="color-picker-hex" value="${this.rgbToHex(this.currentColor.r, this.currentColor.g, this.currentColor.b).toUpperCase()}" style="
            width: 100%;
            padding: 6px 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 12px;
            font-family: monospace;
          ">
        </div>
        <div style="flex: 1;">
          <label style="display: block; font-size: 12px; color: #666; margin-bottom: 4px;">Opacity</label>
          <input type="text" class="color-picker-alpha" value="${Math.round(this.currentColor.a * 100)}%" style="
            width: 100%;
            padding: 6px 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 12px;
            font-family: monospace;
          ">
        </div>
      </div>
      
      <div class="color-picker-preview" style="
        width: 40px;
        height: 40px;
        border-radius: 6px;
        border: 1px solid #ddd;
        background: ${this.rgbToHex(this.currentColor.r, this.currentColor.g, this.currentColor.b)};
        margin-top: 12px;
      "></div>
    `;

    this.element = picker;
    this.setupEventListeners();
  }

  setupEventListeners() {
    const saturation = this.element.querySelector('.color-picker-saturation');
    const hue = this.element.querySelector('.color-picker-hue');
    const opacity = this.element.querySelector('.color-picker-opacity');
    const hexInput = this.element.querySelector('.color-picker-hex');
    const alphaInput = this.element.querySelector('.color-picker-alpha');
    const closeBtn = this.element.querySelector('.color-picker-close');

    // Saturation and Value picker
    saturation.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      
      const updateSaturation = (e) => {
        const rect = saturation.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
        
        const hsv = this.rgbToHsv(this.currentColor.r, this.currentColor.g, this.currentColor.b);
        hsv.s = x;
        hsv.v = 1 - y;
        
        const rgb = this.hsvToRgb(hsv.h, hsv.s, hsv.v);
        this.currentColor = { ...rgb, a: this.currentColor.a };
        this.updateColor();
        
        const handle = saturation.querySelector('.color-picker-saturation-handle');
        handle.style.left = (x * 100) + '%';
        handle.style.top = (y * 100) + '%';
      };

      updateSaturation(e);
      
      const moveHandler = (e) => updateSaturation(e);
      const upHandler = () => {
        this.isDragging = false;
        // Send final value after dragging ends
        setTimeout(() => {
          this.onChange(this.currentColor);
        }, 100);
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', upHandler);
      };
      
      document.addEventListener('mousemove', moveHandler);
      document.addEventListener('mouseup', upHandler);
    });

    // Hue picker
    hue.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      
      const updateHue = (e) => {
        const rect = hue.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        
        const hsv = this.rgbToHsv(this.currentColor.r, this.currentColor.g, this.currentColor.b);
        hsv.h = x;
        
        const rgb = this.hsvToRgb(hsv.h, hsv.s, hsv.v);
        this.currentColor = { ...rgb, a: this.currentColor.a };
        this.updateColor();
        
        const handle = hue.querySelector('.color-picker-hue-handle');
        handle.style.left = (x * 100) + '%';
      };

      updateHue(e);
      
      const moveHandler = (e) => updateHue(e);
      const upHandler = () => {
        this.isDragging = false;
        // Send final value after dragging ends
        setTimeout(() => {
          this.onChange(this.currentColor);
        }, 100);
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', upHandler);
      };
      
      document.addEventListener('mousemove', moveHandler);
      document.addEventListener('mouseup', upHandler);
    });

    // Opacity picker
    opacity.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      
      const updateOpacity = (e) => {
        const rect = opacity.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        
        this.currentColor.a = x;
        this.updateColor();
        
        const handle = opacity.querySelector('.color-picker-opacity-handle');
        handle.style.left = (x * 100) + '%';
      };

      updateOpacity(e);
      
      const moveHandler = (e) => updateOpacity(e);
      const upHandler = () => {
        this.isDragging = false;
        // Send final value after dragging ends
        setTimeout(() => {
          this.onChange(this.currentColor);
        }, 100);
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', upHandler);
      };
      
      document.addEventListener('mousemove', moveHandler);
      document.addEventListener('mouseup', upHandler);
    });

    // Hex input
    hexInput.addEventListener('input', (e) => {
      const hex = e.target.value;
      if (hex.match(/^#[0-9A-Fa-f]{6}$/)) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        this.currentColor = { r, g, b, a: this.currentColor.a };
        this.updateColor();
      }
    });

    // Alpha input
    alphaInput.addEventListener('input', (e) => {
      const alpha = parseFloat(e.target.value) / 100;
      if (!isNaN(alpha) && alpha >= 0 && alpha <= 1) {
        this.currentColor.a = alpha;
        this.updateColor();
      }
    });

    // Close button
    closeBtn.addEventListener('click', () => {
      this.close();
    });

    // Click outside to close
    document.addEventListener('mousedown', (e) => {
      if (!this.element.contains(e.target) && this.isOpen) {
        this.close();
      }
    });
  }

  updateColor() {
    const hexInput = this.element.querySelector('.color-picker-hex');
    const alphaInput = this.element.querySelector('.color-picker-alpha');
    const preview = this.element.querySelector('.color-picker-preview');
    const opacityGradient = this.element.querySelector('.color-picker-opacity-gradient');
    
    const hex = this.rgbToHex(this.currentColor.r, this.currentColor.g, this.currentColor.b);
    hexInput.value = hex.toUpperCase();
    alphaInput.value = Math.round(this.currentColor.a * 100) + '%';
    preview.style.background = hex;
    opacityGradient.style.background = `linear-gradient(to right, transparent, ${hex})`;
    
    this.onChange(this.currentColor);
  }

  open(x, y) {
    console.log('🎨 Opening color picker at position:', x, y);
    if (this.isOpen) return;
    
    this.isOpen = true;
    
    // Make sure the element is in the DOM first
    if (!this.element.parentNode) {
      document.body.appendChild(this.element);
    }
    
    // Position the picker near the click point
    if (x && y) {
      this.element.style.left = x + 'px';
      this.element.style.top = y + 'px';
      this.element.style.transform = 'none';
    }
    
    // Make it visible
    this.element.style.display = 'block';
    this.element.style.visibility = 'visible';
    this.element.style.opacity = '1';
    
    console.log('🎨 Color picker element:', this.element);
    console.log('🎨 Color picker styles:', {
      display: this.element.style.display,
      visibility: this.element.style.visibility,
      opacity: this.element.style.opacity,
      left: this.element.style.left,
      top: this.element.style.top,
      zIndex: this.element.style.zIndex
    });
  }

  close() {
    if (!this.isOpen) return;
    
    this.isOpen = false;
    this.element.style.display = 'none';
    
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    
    this.onClose();
  }

  getColor() {
    const { r, g, b, a } = this.currentColor;
    if (a === 1) {
      return this.rgbToHex(r, g, b);
    } else {
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
  }
} 