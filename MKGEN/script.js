class MediaKitGenerator {
  constructor() {
    this.elements = []
    this.selectedElement = null
    this.isPreviewMode = false
    this.draggedElement = null
    this.dragOffset = { x: 0, y: 0 }
    this.canvasHeight = 600
    this.lucide = window.lucide // Declare the lucide variable

    this.init()
  }

  init() {
    this.setupEventListeners()
    this.updateGradient()
    this.lucide.createIcons() // Use the declared lucide variable
  }

  setupEventListeners() {
    // Header buttons
    document.getElementById("preview-btn").addEventListener("click", () => this.togglePreview())
    document.getElementById("download-btn").addEventListener("click", () => this.downloadHTML())

    // Creator name
    document
      .getElementById("creator-name")
      .addEventListener("input", (e) => {
        this.updateCanvasHeight()
      })

    // Gradient controls
    ;["color1", "color2", "pos1", "pos2", "gradient-type", "gradient-direction"].forEach((id) => {
      const element = document.getElementById(id)
      if (element) {
        element.addEventListener("input", () => this.updateGradient())
        element.addEventListener("change", () => this.updateGradient())
      }
    })

    // Position value updates
    document.getElementById("pos1").addEventListener("input", (e) => {
      document.getElementById("pos1-value").textContent = e.target.value + "%"
    })
    document.getElementById("pos2").addEventListener("input", (e) => {
      document.getElementById("pos2-value").textContent = e.target.value + "%"
    })

    // Tab buttons
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => this.switchTab(e.target.dataset.tab))
    })

    // Element buttons
    document.querySelectorAll(".element-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const type = e.currentTarget.dataset.type
        const platform = e.currentTarget.dataset.platform
        this.addElement(type, platform)
      })
    })

    // Canvas events
    const canvas = document.getElementById("canvas")
    canvas.addEventListener("mousedown", (e) => this.handleCanvasMouseDown(e))
    document.addEventListener("mousemove", (e) => this.handleMouseMove(e))
    document.addEventListener("mouseup", () => this.handleMouseUp())

    // Keyboard events
    document.addEventListener("keydown", (e) => this.handleKeyDown(e))

    // Element controls
    document.getElementById("center-btn").addEventListener("click", () => this.centerElement())
    document.getElementById("delete-btn").addEventListener("click", () => this.deleteElement())
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === tabName)
    })

    // Update tab content
    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.toggle("active", content.id === `${tabName}-tab`)
    })
  }

  updateGradient() {
    const color1 = document.getElementById("color1").value
    const color2 = document.getElementById("color2").value
    const pos1 = document.getElementById("pos1").value
    const pos2 = document.getElementById("pos2").value
    const type = document.getElementById("gradient-type").value
    const direction = document.getElementById("gradient-direction").value

    // Show/hide direction input based on gradient type
    const directionGroup = document.getElementById("direction-group")
    if (type === "radial") {
      directionGroup.style.display = "none"
    } else {
      directionGroup.style.display = "block"
    }

    let gradient
    if (type === "radial") {
      gradient = `radial-gradient(circle, ${color1} ${pos1}%, ${color2} ${pos2}%)`
    } else {
      gradient = `linear-gradient(${direction}, ${color1} ${pos1}%, ${color2} ${pos2}%)`
    }

    const canvas = document.getElementById("canvas")

    if (this.isPreviewMode) {
      canvas.style.background = gradient
    } else {
      canvas.style.backgroundImage = `${gradient}, radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)`
      canvas.style.backgroundSize = "auto, 5px 5px"
    }

    // Update body background
    document.body.style.background = gradient
  }

  addElement(type, platform = null) {
    const platformData = this.getPlatformData(platform)
    const nextY = this.elements.length === 0 ? 100 : Math.max(...this.elements.map((el) => el.y + el.height)) + 80

    const element = {
      id: `element-${Date.now()}`,
      type,
      platform,
      label: platformData?.name || this.getDefaultLabel(type),
      value: platformData?.placeholder || this.getDefaultValue(type),
      url: platform ? "https://example.com" : "",
      x: this.snapToGrid(200 - this.getDefaultWidth(type) / 2),
      y: this.snapToGrid(nextY),
      color: type === "social" && platformData ? "#ffffff" : "#ffffff",
      backgroundColor: this.getDefaultBackground(type, platformData),
      borderColor: type === "photo" ? "#10ff92" : "transparent", // Add border color property
      fontSize: this.getDefaultFontSize(type),
      fontWeight: type === "text" ? "bold" : "normal",
      borderRadius: this.getDefaultBorderRadius(type),
      width: this.getDefaultWidth(type),
      height: this.getDefaultHeight(type),
      zIndex: this.elements.length,
      padding: this.getDefaultPadding(type),
      shadow: type === "social" || type === "metric" || type === "chart",
      chartData:
        type === "chart"
          ? [
              { label: "Item 1", value: 60, color: "#10ff92" },
              { label: "Item 2", value: 40, color: "#7822ff" },
            ]
          : [],
      chartTitle: type === "chart" ? "Demographics" : "",
    }

    this.elements.push(element)
    this.renderElement(element)
    this.selectElement(element.id)
    this.updateCanvasHeight()
    this.updateElementCount()
  }

  renderElement(element) {
    const canvas = document.getElementById("canvas")
    const elementDiv = document.createElement("div")
    elementDiv.className = "canvas-element"
    elementDiv.id = element.id
    elementDiv.style.cssText = this.getElementStyles(element)

    elementDiv.innerHTML = this.getElementContent(element)

    elementDiv.addEventListener("mousedown", (e) => {
      e.stopPropagation()
      this.handleElementMouseDown(e, element.id)
    })

    canvas.appendChild(elementDiv)

    // Re-initialize Lucide icons after adding new element
    this.lucide.createIcons()
  }

  getElementStyles(element) {
    return `
            left: ${element.x}px;
            top: ${element.y}px;
            width: ${element.width}px;
            height: ${element.height}px;
            color: ${element.color};
            background: ${element.backgroundColor === "transparent" ? "transparent" : element.backgroundColor};
            font-size: ${element.fontSize}px;
            font-weight: ${element.fontWeight};
            border-radius: ${element.borderRadius}px;
            padding: ${element.padding}px;
            z-index: ${element.zIndex};
            ${element.type === "photo" && element.borderColor !== "transparent" ? `border: 3px solid ${element.borderColor};` : ""}
            ${element.shadow ? "box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);" : ""}
        `
  }

  getElementContent(element) {
    if (element.type === "photo") {
      return `<img src="${element.value || "/placeholder.svg?height=120&width=120&text=Photo"}" alt="${element.label}" style="width: 100%; height: 100%; border-radius: ${element.borderRadius}px; object-fit: cover;">`
    }

    if (element.type === "chart") {
      const chartItems = element.chartData
        .map(
          (item) => `
                <div class="chart-item">
                    <div class="chart-label">${item.label}</div>
                    <div class="chart-bar-container">
                        <div class="chart-bar" style="width: ${item.value}%; background: ${item.color};"></div>
                    </div>
                    <div class="chart-value">${item.value}%</div>
                </div>
            `,
        )
        .join("")

      return `
                <div class="chart-content">
                    <div class="chart-title">${element.chartTitle || "Chart"}</div>
                    <div class="chart-items">${chartItems}</div>
                </div>
            `
    }

    if (element.type === "social" && element.url) {
      const icon = this.getSocialIcon(element.platform)
      return `${icon}${element.value}`
    }

    return element.value
  }

  getSocialIcon(platform) {
    const icons = {
      instagram: '<i data-lucide="instagram" style="width: 20px; height: 20px; margin-right: 8px;"></i>',
      youtube: '<i data-lucide="youtube" style="width: 20px; height: 20px; margin-right: 8px;"></i>',
      tiktok: '<i data-lucide="play" style="width: 20px; height: 20px; margin-right: 8px;"></i>',
      x: '<i data-lucide="twitter" style="width: 20px; height: 20px; margin-right: 8px;"></i>',
      twitch: '<i data-lucide="twitch" style="width: 20px; height: 20px; margin-right: 8px;"></i>',
      facebook: '<i data-lucide="facebook" style="width: 20px; height: 20px; margin-right: 8px;"></i>',
      linkedin: '<i data-lucide="linkedin" style="width: 20px; height: 20px; margin-right: 8px;"></i>',
      snapchat: '<i data-lucide="camera" style="width: 20px; height: 20px; margin-right: 8px;"></i>',
      bluesky: '<i data-lucide="message-circle" style="width: 20px; height: 20px; margin-right: 8px;"></i>',
      website: '<i data-lucide="globe" style="width: 20px; height: 20px; margin-right: 8px;"></i>',
      paypal: '<i data-lucide="dollar-sign" style="width: 20px; height: 20px; margin-right: 8px;"></i>',
      kick: '<i data-lucide="play" style="width: 20px; height: 20px; margin-right: 8px;"></i>',
      trovo: '<i data-lucide="gamepad-2" style="width: 20px; height: 20px; margin-right: 8px;"></i>',
    }
    return icons[platform] || ""
  }

  selectElement(elementId) {
    // Remove previous selection
    document.querySelectorAll(".canvas-element").forEach((el) => {
      el.classList.remove("selected")
    })

    // Add selection to new element
    const element = document.getElementById(elementId)
    if (element) {
      element.classList.add("selected")
    }

    this.selectedElement = elementId
    this.showElementProperties(elementId)
  }

  showElementProperties(elementId) {
    const element = this.elements.find((el) => el.id === elementId)
    if (!element) return

    const propertiesCard = document.getElementById("properties-card")
    const propertiesContent = document.getElementById("properties-content")

    propertiesCard.style.display = "block"

    propertiesContent.innerHTML = `
            <div class="form-group">
                <label>Value</label>
                <input type="text" id="element-value" value="${element.value}" class="input" placeholder="${element.type === "photo" ? "Image URL" : "Enter value"}">
            </div>
            
            ${
              element.type === "social"
                ? `
                <div class="form-group">
                    <label>URL</label>
                    <input type="text" id="element-url" value="${element.url || ""}" class="input" placeholder="https://...">
                </div>
            `
                : ""
            }
            
            ${
              element.type === "chart"
                ? `
                <div class="form-group">
                    <label>Chart Title</label>
                    <input type="text" id="chart-title" value="${element.chartTitle || ""}" class="input" placeholder="e.g., Age Distribution">
                </div>
            `
                : ""
            }
            
            <div class="form-group">
                <label>Text Color</label>
                <input type="color" id="element-color" value="${element.color}" class="color-input">
            </div>
            
            ${
              element.type !== "photo"
                ? `
                <div class="form-group">
                    <label>Background Color</label>
                    <input type="color" id="element-bg-color" value="${element.backgroundColor === "transparent" ? "#000000" : element.backgroundColor}" class="color-input">
                </div>
            `
                : ""
            }
            
            ${
              element.type === "photo"
                ? `
                <div class="form-group">
                    <label>Border Color</label>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <button id="transparent-border-btn" class="control-btn" style="padding: 0.5rem; ${element.borderColor === "transparent" ? "background: rgba(255,255,255,0.2);" : ""}" title="No Border">
                            None
                        </button>
                        <input type="color" id="element-border-color" value="${element.borderColor === "transparent" ? "#10ff92" : element.borderColor}" class="color-input">
                    </div>
                </div>
            `
                : ""
            }
            
            <div class="form-group">
                <label>Font Size: ${element.fontSize}px</label>
                <input type="range" id="element-font-size" min="10" max="48" value="${element.fontSize}" class="slider">
            </div>
            
            <div class="form-group">
                <label>Border Radius: ${element.borderRadius}px</label>
                <input type="range" id="element-border-radius" min="0" max="50" value="${element.borderRadius}" class="slider">
            </div>
        `

    // Add event listeners for property changes
    this.setupPropertyListeners(elementId)
  }

  setupPropertyListeners(elementId) {
    const inputs = {
      "element-value": "value",
      "element-url": "url",
      "chart-title": "chartTitle",
      "element-color": "color",
      "element-bg-color": "backgroundColor",
      "element-border-color": "borderColor",
      "element-font-size": "fontSize",
      "element-border-radius": "borderRadius",
    }

    Object.entries(inputs).forEach(([inputId, property]) => {
      const input = document.getElementById(inputId)
      if (input) {
        input.addEventListener("input", (e) => {
          this.updateElementProperty(elementId, property, e.target.value)
        })
      }
    })

    // Special handler for transparent border button
    const transparentBorderBtn = document.getElementById("transparent-border-btn")
    if (transparentBorderBtn) {
      transparentBorderBtn.addEventListener("click", () => {
        this.updateElementProperty(elementId, "borderColor", "transparent")
        transparentBorderBtn.style.background = "rgba(255,255,255,0.2)"
      })
    }
  }

  updateElementProperty(elementId, property, value) {
    const element = this.elements.find((el) => el.id === elementId)
    if (!element) return

    // Convert numeric values
    if (["fontSize", "borderRadius"].includes(property)) {
      value = Number.parseInt(value)
    }

    element[property] = value

    // Update transparent border button state
    if (property === "borderColor") {
      const transparentBtn = document.getElementById("transparent-border-btn")
      if (transparentBtn) {
        transparentBtn.style.background = value === "transparent" ? "rgba(255,255,255,0.2)" : "transparent"
      }
    }

    // Re-render element
    const elementDiv = document.getElementById(elementId)
    if (elementDiv) {
      elementDiv.style.cssText = this.getElementStyles(element)
      elementDiv.innerHTML = this.getElementContent(element)
      this.lucide.createIcons() // Use the declared lucide variable
    }
  }

  centerElement() {
    if (!this.selectedElement) return

    const element = this.elements.find((el) => el.id === this.selectedElement)
    if (!element) return

    element.x = this.snapToGrid((400 - element.width) / 2)

    const elementDiv = document.getElementById(this.selectedElement)
    if (elementDiv) {
      elementDiv.style.left = `${element.x}px`
    }
  }

  deleteElement() {
    if (!this.selectedElement) return

    this.elements = this.elements.filter((el) => el.id !== this.selectedElement)

    const elementDiv = document.getElementById(this.selectedElement)
    if (elementDiv) {
      elementDiv.remove()
    }

    this.selectedElement = null
    document.getElementById("properties-card").style.display = "none"
    this.updateCanvasHeight()
    this.updateElementCount()
  }

  handleCanvasMouseDown(e) {
    if (this.isPreviewMode) return

    // Deselect if clicking on canvas
    if (e.target.id === "canvas") {
      this.selectedElement = null
      document.querySelectorAll(".canvas-element").forEach((el) => {
        el.classList.remove("selected")
      })
      document.getElementById("properties-card").style.display = "none"
    }
  }

  handleElementMouseDown(e, elementId) {
    if (this.isPreviewMode) return

    const element = this.elements.find((el) => el.id === elementId)
    if (!element) return

    const rect = document.getElementById("canvas").getBoundingClientRect()

    this.draggedElement = elementId
    this.selectElement(elementId)
    this.dragOffset = {
      x: e.clientX - rect.left - element.x,
      y: e.clientY - rect.top - element.y,
    }
  }

  handleMouseMove(e) {
    if (!this.draggedElement || this.isPreviewMode) return

    const element = this.elements.find((el) => el.id === this.draggedElement)
    if (!element) return

    const rect = document.getElementById("canvas").getBoundingClientRect()
    const newX = this.snapToGrid(Math.max(0, Math.min(400 - element.width, e.clientX - rect.left - this.dragOffset.x)))
    const newY = this.snapToGrid(
      Math.max(0, Math.min(this.canvasHeight - element.height, e.clientY - rect.top - this.dragOffset.y)),
    )

    element.x = newX
    element.y = newY

    const elementDiv = document.getElementById(this.draggedElement)
    if (elementDiv) {
      elementDiv.style.left = `${newX}px`
      elementDiv.style.top = `${newY}px`
    }
  }

  handleMouseUp() {
    this.draggedElement = null
  }

  handleKeyDown(e) {
    if (this.selectedElement && !this.isPreviewMode) {
      // Only allow Delete key, removed Backspace
      if (e.key === "Delete") {
        this.deleteElement()
      }
      if (e.key === "Escape") {
        this.selectedElement = null
        document.querySelectorAll(".canvas-element").forEach((el) => {
          el.classList.remove("selected")
        })
        document.getElementById("properties-card").style.display = "none"
      }
    }
  }

  togglePreview() {
    this.isPreviewMode = !this.isPreviewMode

    const previewBtn = document.getElementById("preview-btn")
    const sidebar = document.getElementById("sidebar")
    const canvas = document.getElementById("canvas")

    if (this.isPreviewMode) {
      previewBtn.innerHTML = '<i data-lucide="edit"></i> Edit Mode'
      sidebar.classList.add("hidden")
      canvas.classList.add("preview-mode")

      // Hide selection
      document.querySelectorAll(".canvas-element").forEach((el) => {
        el.classList.remove("selected")
      })
    } else {
      previewBtn.innerHTML = '<i data-lucide="eye"></i> Preview Mode'
      sidebar.classList.remove("hidden")
      canvas.classList.remove("preview-mode")
    }

    this.updateGradient()
    this.lucide.createIcons() // Use the declared lucide variable
  }

  downloadHTML() {
    const creatorName = document.getElementById("creator-name").value
    const fileName = `${creatorName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-mediakit.html`

    const elementsHTML = this.elements
      .sort((a, b) => a.zIndex - b.zIndex)
      .map((element) => this.generateElementHTML(element))
      .join("")

    const gradient = this.getCurrentGradient()

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${creatorName} - Media Kit</title>
    <meta name="description" content="Media kit for ${creatorName} - Content Creator">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: ${gradient};
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .mediakit-container {
            position: relative;
            width: 100%;
            max-width: 400px;
            height: ${this.canvasHeight}px;
            background: ${gradient};
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        }
        .footer {
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            color: rgba(255, 255, 255, 0.6);
            font-size: 12px;
            text-align: center;
            font-weight: 500;
        }
        .footer a {
            color: inherit;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 8px;
            justify-content: center;
            transition: color 0.2s ease;
        }
        .footer a:hover { color: rgba(255, 255, 255, 0.8); }
        .hover-scale:hover { transform: scale(1.05); }
        @media (max-width: 480px) {
            .mediakit-container { max-width: 100%; height: 100vh; border-radius: 0; }
        }
    </style>
</head>
<body>
    <div class="mediakit-container">
        ${elementsHTML}
        <div class="footer">
            <a href="https://trueconext.com/" target="_blank" rel="noopener noreferrer">
                <img src="https://raw.githubusercontent.com/Trueconext/TrueConextW/refs/heads/main/Icon%20Only%20No%20Background.png" alt="TrueConext Logo" style="width: 16px; height: 16px; object-fit: contain;" />
                Powered by TrueConext
            </a>
        </div>
    </div>
</body>
</html>`

    const blob = new Blob([html], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  generateElementHTML(element) {
    const baseStyle = `
            position: absolute;
            left: ${(element.x / 400) * 100}%;
            top: ${(element.y / this.canvasHeight) * 100}%;
            color: ${element.color};
            font-size: ${element.fontSize}px;
            font-weight: ${element.fontWeight};
            z-index: ${element.zIndex};
            border-radius: ${element.borderRadius}px;
            width: ${element.width}px;
            height: ${element.height}px;
            padding: ${element.padding}px;
            ${element.backgroundColor && element.backgroundColor !== "transparent" ? `background: ${element.backgroundColor};` : ""}
            ${element.type === "photo" && element.borderColor !== "transparent" ? `border: 3px solid ${element.borderColor};` : ""}
            ${element.shadow ? "box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);" : ""}
            transition: transform 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        `

    if (element.type === "photo") {
      return `<div style="${baseStyle}" class="hover-scale">
                <img src="${element.value}" alt="${element.label}" style="width: 100%; height: 100%; border-radius: ${element.borderRadius}px; object-fit: cover;" />
            </div>`
    }

    if (element.type === "chart") {
      const chartItemsHTML = element.chartData
        .map(
          (item) => `
                <div style="display: flex; align-items: center; font-size: 12px; margin-bottom: 6px;">
                    <div style="width: 64px; text-align: right; margin-right: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.label}</div>
                    <div style="flex: 1; background: rgba(0,0,0,0.2); border-radius: 12px; height: 12px; overflow: hidden;">
                        <div style="height: 100%; border-radius: 12px; width: ${item.value}%; background: ${item.color}; transition: all 0.3s;"></div>
                    </div>
                    <div style="width: 40px; text-align: left; margin-left: 8px; font-size: 12px;">${item.value}%</div>
                </div>
            `,
        )
        .join("")

      return `<div style="${baseStyle}" class="hover-scale">
                <div style="width: 100%; height: 100%;">
                    <div style="text-align: center; font-weight: bold; margin-bottom: 12px; font-size: 14px;">${element.chartTitle || "Chart"}</div>
                    <div>${chartItemsHTML}</div>
                </div>
            </div>`
    }

    if (element.type === "social" && element.url) {
      // Generate SVG icons for the exported HTML since Lucide won't be available
      const getSVGIcon = (platform) => {
        const svgIcons = {
          instagram: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
          youtube: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
          tiktok: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`,
          x: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>`,
          twitch: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg>`,
          facebook: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
          linkedin: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
          snapchat: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378 0 0-.599 2.282-.744 2.840-.282 1.084-1.064 2.456-1.549 3.235C9.584 23.815 10.77 24.001 12.017 24.001c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/></svg>`,
          bluesky: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;"><path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-2.67-.296-5.568.628-6.383 3.364C.378 17.703 0 22.663 0 23.353c0 .688.139 1.86.902 2.203.659.299 1.664.621 4.3-1.24C7.954 22.274 10.913 18.335 12 16.221c1.087 2.114 4.046 6.053 6.798 7.995 2.636 1.861 3.641 1.539 4.3 1.24.763-.343.902-1.515.902-2.203 0-.69-.378-5.65-.624-6.479-.815-2.736-3.713-3.66-6.383-3.364-.139.016-.277.034-.415.056.138-.017.276-.036.415-.056 2.67.296 5.568-.628 6.383-3.364.246-.829.624-5.789.624-6.479 0-.688-.139-1.86-.902-2.203-.659-.299-1.664-.621-4.3 1.24C16.046 4.747 13.087 8.686 12 10.8z"/></svg>`,
          website: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`,
          paypal: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a.3.3 0 0 0-.32-.07c-.99.26-2.16.72-3.71.72h-3.18c-.52 0-.97.38-1.05.9L11.84 14.8c-.08.52.32.94.84.94h2.94c3.47 0 6.19-1.4 7.93-4.08.94-1.44 1.25-2.91.67-4.73z"/></svg>`,
          kick: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;"><path d="M8 5v14l11-7z"/></svg>`,
          trovo: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;"><path d="M6 4h4v2H6V4zm0 4h4v2H6V8zm0 4h4v2H6v-2zm6-8h4v2h-4V4zm0 4h4v2h-4V8zm0 4h4v2h-4v-2zm6-8h4v2h-4V4zm0 4h4v2h-4V8zm0 4h4v2h-4v-2z"/></svg>`,
        }
        return svgIcons[platform] || ""
      }

      return `<a href="${element.url}" target="_blank" style="${baseStyle} text-decoration: none;" class="hover-scale">
                ${getSVGIcon(element.platform)}${element.value}
            </a>`
    }

    return `<div style="${baseStyle}" class="hover-scale">${element.value}</div>`
  }

  getCurrentGradient() {
    const color1 = document.getElementById("color1").value
    const color2 = document.getElementById("color2").value
    const pos1 = document.getElementById("pos1").value
    const pos2 = document.getElementById("pos2").value
    const type = document.getElementById("gradient-type").value
    const direction = document.getElementById("gradient-direction").value

    if (type === "radial") {
      return `radial-gradient(circle, ${color1} ${pos1}%, ${color2} ${pos2}%)`
    } else {
      return `linear-gradient(${direction}, ${color1} ${pos1}%, ${color2} ${pos2}%)`
    }
  }

  updateCanvasHeight() {
    if (this.elements.length === 0) {
      this.canvasHeight = 600
    } else {
      const maxY = Math.max(...this.elements.map((el) => el.y + el.height + 20))
      this.canvasHeight = Math.max(600, maxY + 60)
    }

    document.getElementById("canvas").style.height = `${this.canvasHeight}px`
    document.getElementById("canvas-height").textContent = this.canvasHeight
  }

  updateElementCount() {
    document.getElementById("element-count").textContent = this.elements.length
  }

  snapToGrid(value) {
    return Math.round(value / 5) * 5
  }

  // Helper methods for default values
  getPlatformData(platform) {
    const platforms = {
      instagram: { name: "Instagram", placeholder: "@yourhandle", color: "#E4405F" },
      youtube: { name: "YouTube", placeholder: "Your Channel", color: "#FF0000" },
      tiktok: { name: "TikTok", placeholder: "@yourhandle", color: "#000000" },
      x: { name: "X", placeholder: "@yourhandle", color: "#1DA1F2" },
      twitch: { name: "Twitch", placeholder: "yourhandle", color: "#9146FF" },
      facebook: { name: "Facebook", placeholder: "Follow me", color: "#1877F2" },
      linkedin: { name: "LinkedIn", placeholder: "Connect with me", color: "#0077B5" },
      snapchat: { name: "Snapchat", placeholder: "@yourhandle", color: "#FFFC00" },
      bluesky: { name: "Bluesky", placeholder: "@yourhandle", color: "#00A8E8" },
      website: { name: "Website", placeholder: "Visit my site", color: "#6366f1" },
      paypal: { name: "PayPal", placeholder: "Support Me", color: "#00457C" },
      kick: { name: "Kick", placeholder: "yourhandle", color: "#53FC18" },
      trovo: { name: "Trovo", placeholder: "yourhandle", color: "#00D4AA" },
    }
    return platforms[platform]
  }

  getDefaultLabel(type) {
    const labels = {
      text: "Heading",
      metric: "Followers",
      chart: "Chart Title",
      photo: "Photo",
    }
    return labels[type] || "Text"
  }

  getDefaultValue(type) {
    const values = {
      text: "Write here",
      metric: "100K+",
      chart: "Demographics",
      photo: "https://via.placeholder.com/120",
    }
    return values[type] || "Enter text"
  }

  getDefaultWidth(type) {
    const widths = {
      social: 280,
      photo: 120,
      chart: 300,
      text: 100,
      metric: 100,
    }
    return widths[type] || 100
  }

  getDefaultHeight(type) {
    const heights = {
      social: 50,
      photo: 120,
      chart: 140,
      text: 50,
      metric: 50,
    }
    return heights[type] || 50
  }

  getDefaultBackground(type, platformData) {
    if (type === "social" && platformData) return platformData.color
    if (type === "text") return "transparent"
    if (type === "chart") return "rgba(255,255,255,0.1)"
    return "#10ff92"
  }

  getDefaultFontSize(type) {
    const sizes = {
      text: 24,
      social: 16,
      chart: 18,
      metric: 18,
    }
    return sizes[type] || 16
  }

  getDefaultBorderRadius(type) {
    const radii = {
      photo: 50,
      social: 25,
      chart: 15,
      text: 12,
      metric: 12,
    }
    return radii[type] || 12
  }

  getDefaultPadding(type) {
    const paddings = {
      social: 16,
      metric: 12,
      chart: 20,
      text: 8,
    }
    return paddings[type] || 8
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new MediaKitGenerator()
})
