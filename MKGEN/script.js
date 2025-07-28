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
    ;["color1", "color2", "pos1", "pos2"].forEach((id) => {
      document.getElementById(id).addEventListener("input", () => this.updateGradient())
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

    const gradient = `linear-gradient(135deg, ${color1} ${pos1}%, ${color2} ${pos2}%)`
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
  }

  updateElementProperty(elementId, property, value) {
    const element = this.elements.find((el) => el.id === elementId)
    if (!element) return

    // Convert numeric values
    if (["fontSize", "borderRadius"].includes(property)) {
      value = Number.parseInt(value)
    }

    element[property] = value

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
      if (e.key === "Delete" || e.key === "Backspace") {
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
      return `<a href="${element.url}" target="_blank" style="${baseStyle} text-decoration: none;" class="hover-scale">
                ${element.value}
            </a>`
    }

    return `<div style="${baseStyle}" class="hover-scale">${element.value}</div>`
  }

  getCurrentGradient() {
    const color1 = document.getElementById("color1").value
    const color2 = document.getElementById("color2").value
    const pos1 = document.getElementById("pos1").value
    const pos2 = document.getElementById("pos2").value

    return `linear-gradient(135deg, ${color1} ${pos1}%, ${color2} ${pos2}%)`
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
