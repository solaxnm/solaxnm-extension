import { FilterManager } from '../utils/FilterManager'
import { FileHandler } from '../utils/FileHandler'
import { CompressionManager, CompressionResult } from '../utils/CompressionManager'
import { ToastManager } from '../utils/ToastManager'
import { CropManager } from '../utils/CropManager'

export class ImageProcessor {
  private filterManager: FilterManager
  private fileHandler: FileHandler
  private compressionManager: CompressionManager
  private toastManager: ToastManager
  private cropManager: CropManager
  private currentImage: HTMLImageElement | null = null
  private currentFile: File | null = null
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private compressionResult: CompressionResult | null = null
  private activeSections: Set<string> = new Set()
  private isDarkMode: boolean = false
  private isCropEnabled: boolean = false

  constructor() {
    this.filterManager = new FilterManager()
    this.fileHandler = new FileHandler()
    this.compressionManager = new CompressionManager()
    this.toastManager = new ToastManager()
    this.cropManager = new CropManager()
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')!
    
    // Initialize theme
    this.initializeTheme()
    
    // Check for context image on initialization
    this.checkForContextImage()
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem('theme')
    this.isDarkMode = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
    this.applyTheme()
  }

  private applyTheme(): void {
    document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light')
  }

  private async checkForContextImage(): Promise<void> {
    try {
      // Check if we're in a browser extension context
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        const response = await chrome.runtime.sendMessage({ action: 'getContextImage' })
        if (response && response.success && response.imageData) {
          // Auto-load the context image
          setTimeout(() => {
            this.loadContextImage(response.imageData)
          }, 500)
        }
      }
    } catch (error) {
      // Silently fail if not in extension context
      console.log('Not in extension context or no context image available')
    }
  }

  private async loadContextImage(imageData: any): Promise<void> {
    try {
      const container = document.querySelector('#app') as HTMLElement
      const previewImage = container.querySelector('#previewImage') as HTMLImageElement
      const imageSection = container.querySelector('#imageSection') as HTMLElement
      const imageInfo = container.querySelector('#imageInfo') as HTMLElement
      const uploadSection = container.querySelector('#uploadSection') as HTMLElement

      if (!previewImage || !imageSection || !imageInfo || !uploadSection) return

      // Create a fake file object for the context image
      const response = await fetch(imageData.dataUrl)
      const blob = await response.blob()
      const file = new File([blob], 'context-image.png', { type: 'image/png' })

      // Load the image
      previewImage.src = imageData.dataUrl
      
      previewImage.onload = () => {
        this.currentImage = previewImage
        this.currentFile = file
        this.canvas.width = previewImage.naturalWidth
        this.canvas.height = previewImage.naturalHeight
        this.ctx.drawImage(previewImage, 0, 0)
        
        // Display image info
        imageInfo.innerHTML = `
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Source</span>
              <span class="info-value">Web Import</span>
            </div>
            <div class="info-item">
              <span class="info-label">Dimensions</span>
              <span class="info-value">${imageData.width} × ${imageData.height}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Size</span>
              <span class="info-value">${this.formatFileSize(blob.size)}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Format</span>
              <span class="info-value">PNG</span>
            </div>
          </div>
        `
        
        // Show image section, hide upload section
        uploadSection.classList.add('collapsed')
        imageSection.style.display = 'block'
        
        // Auto-expand compression section
        this.activeSections.add('compression')
        const compressionHeader = imageSection.querySelector('[data-section="compression"]') as HTMLElement
        const compressionContent = compressionHeader.nextElementSibling as HTMLElement
        const compressionToggle = compressionHeader.querySelector('.tool-toggle svg') as SVGElement
        compressionHeader.classList.add('active')
        compressionContent.classList.add('expanded')
        compressionToggle.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5"/>'
        
        this.updateCompression(container)
        this.toastManager.success('Image imported from webpage!')
      }
    } catch (error) {
      console.error('Error loading context image:', error)
      this.toastManager.error('Failed to load imported image')
    }
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  private toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light')
    this.applyTheme()
  }

  render(): HTMLElement {
    const container = document.createElement('div')
    container.innerHTML = `
      <div class="header">
        <div class="header-left">
          <div class="logo">
            <svg version="1.1" id="logo" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 618.6 618.6" style="enable-background:new 0 0 618.6 618.6;" xml:space="preserve">
 
	<g>
	<path class="st0" fill="#7c3aed" d="M191.2,182.7c0,115.5-2,230.9-2.1,346.4c0.3,10.3,0.5,20.6-0.1,30.9c0.8,13.8,2.4,28.8-4.4,41.4
		c-10.5,17-36,17.7-50.3,4.9c-11.7-9.8-23.8-19.1-35.7-28.6c-18.3-14.8-37.1-28.9-55.3-43.9C8.6,510,7.5,498.1,9.3,457.7
		c1.6-141-0.8-282,0-423c0-14,6.8-24.7,20.3-29.2C48.2-2,65.2,10.2,79.2,21.6c17.9,15,36.3,29.4,54.4,44.3
		C196.1,115.4,192.1,102.2,191.2,182.7z"/>
		<path class="st1" fill="#8b5cf6"  d="M609.6,356.4c0,75.3,0,150.6,0,225.9c1.3,31.1-37.3,42.9-58.4,23c-32.6-25.7-64.9-51.8-97.2-77.9
		c-9.6-8.2-21.6-15.6-23.6-29c-3.1-126,0.2-252.4-1.3-378.5c-0.1-27.3-0.2-54.7-0.3-82c-0.8-14.7,8.3-30.6,23.7-33.2
		C475-1.8,490.5,17.8,507,29.8c17,13.8,34.1,27.4,51.4,40.9c11.9,9.6,23.6,19.3,35.7,28.7c7.7,6,12.3,13.9,14.6,23.3
		C611.5,200.4,608.7,278.6,609.6,356.4z"/>
		<path class="st2" fill="#EBEBEB" d="M401.1,356.4c0,76.3,0.2,152.6-0.2,228.9c2.2,29.5-37.6,39.4-57.1,21.2c-11.1-8.8-22-18-33.1-26.9
		c-25.5-20-50.3-40.7-75.7-60.8c-8.5-6.9-13.8-15.6-15.1-26.6c-1.5-151.3-0.1-302.8-0.5-454.1c-0.6-19.4,12-34.2,31.7-35.4
		c10.7,0,19.7,3.7,28,10.6c27.3,22.5,55.8,43.5,82.6,66.5c14.8,13.9,40.2,24,39.3,47.7C401.1,203.8,401.1,280.1,401.1,356.4z"/>
</g>
</svg>
          </div>
          <div class="header-title">
            <h1>SolanaM</h1>
            <p>Image Studio</p>
          </div>
        </div>
        <button class="theme-toggle" id="themeToggle">
          <svg class="icon icon-sm" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/>
          </svg>
        </button>
        <button class="settings-toggle" id="settingsToggle">
          <svg class="icon icon-sm" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"/>
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </button>
      </div>
      
      <!-- Settings Drawer -->
      <div class="settings-drawer" id="settingsDrawer">
        <div class="settings-header">
          <h3>Settings & Info</h3>
          <button class="settings-close" id="settingsClose">
            <svg class="icon icon-sm" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        <div class="settings-content">
          <div class="settings-section">
            <div class="ecosystem-info">
              <div class="ecosystem-logo">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 618.6 618.6">
                  <g>
                    <path fill="currentColor" d="M191.2,182.7c0,115.5-2,230.9-2.1,346.4c0.3,10.3,0.5,20.6-0.1,30.9c0.8,13.8,2.4,28.8-4.4,41.4c-10.5,17-36,17.7-50.3,4.9c-11.7-9.8-23.8-19.1-35.7-28.6c-18.3-14.8-37.1-28.9-55.3-43.9C8.6,510,7.5,498.1,9.3,457.7c1.6-141-0.8-282,0-423c0-14,6.8-24.7,20.3-29.2C48.2-2,65.2,10.2,79.2,21.6c17.9,15,36.3,29.4,54.4,44.3C196.1,115.4,192.1,102.2,191.2,182.7z"/>
                    <path fill="currentColor" d="M609.6,356.4c0,75.3,0,150.6,0,225.9c1.3,31.1-37.3,42.9-58.4,23c-32.6-25.7-64.9-51.8-97.2-77.9c-9.6-8.2-21.6-15.6-23.6-29c-3.1-126,0.2-252.4-1.3-378.5c-0.1-27.3-0.2-54.7-0.3-82c-0.8-14.7,8.3-30.6,23.7-33.2C475-1.8,490.5,17.8,507,29.8c17,13.8,34.1,27.4,51.4,40.9c11.9,9.6,23.6,19.3,35.7,28.7c7.7,6,12.3,13.9,14.6,23.3C611.5,200.4,608.7,278.6,609.6,356.4z"/>
                    <path fill="currentColor" d="M401.1,356.4c0,76.3,0.2,152.6-0.2,228.9c2.2,29.5-37.6,39.4-57.1,21.2c-11.1-8.8-22-18-33.1-26.9c-25.5-20-50.3-40.7-75.7-60.8c-8.5-6.9-13.8-15.6-15.1-26.6c-1.5-151.3-0.1-302.8-0.5-454.1c-0.6-19.4,12-34.2,31.7-35.4c10.7,0,19.7,3.7,28,10.6c27.3,22.5,55.8,43.5,82.6,66.5c14.8,13.9,40.2,24,39.3,47.7C401.1,203.8,401.1,280.1,401.1,356.4z"/>
                  </g>
                </svg>
              </div>
              <div class="ecosystem-text">
                <h4>SolanaM Ecosystem</h4>
                <p>Professional image processing tool designed for creators, designers, and developers.</p>
              </div>
            </div>
          </div>
          
          <div class="settings-section">
            <h4>Features</h4>
            <ul class="feature-list">
              <li>
                <svg class="icon icon-sm" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Advanced crop tools with presets
              </li>
              <li>
                <svg class="icon icon-sm" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Professional filters and adjustments
              </li>
              <li>
                <svg class="icon icon-sm" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Multiple format support (JPEG, PNG, WebP, AVIF, SVG)
              </li>
              <li>
                <svg class="icon icon-sm" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Right-click import/export from any webpage
              </li>
              <li>
                <svg class="icon icon-sm" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Smart compression with quality control
              </li>
            </ul>
          </div>
          
          <div class="settings-section">
            <h4>Right-Click Menu</h4>
            <p class="settings-description">
              Right-click on any image on any webpage to access SolanaM tools:
            </p>
            <ul class="context-menu-list">
              <li><strong>📥 Import to Studio</strong> - Load image into the extension</li>
              <li><strong>📤 Quick Export</strong> - Direct export in various formats</li>
              <li><strong>🌟 About SolanaM</strong> - Learn more about the ecosystem</li>
            </ul>
          </div>
          
          <div class="settings-section">
            <h4>Keyboard Shortcuts</h4>
            <div class="shortcuts-grid">
              <div class="shortcut-item">
                <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>S</kbd>
                <span>Open Extension</span>
              </div>
              <div class="shortcut-item">
                <kbd>R</kbd>
                <span>Reset All</span>
              </div>
              <div class="shortcut-item">
                <kbd>D</kbd>
                <span>Download</span>
              </div>
            </div>
          </div>
          
          <div class="settings-section">
            <div class="version-info">
              <span>Version 1.0.0</span>
              <span>•</span>
              <a href="#" class="ecosystem-link">Visit SolanaM.com</a>
            </div>
          </div>
        </div>
      </div>
      
      <div class="container">
        <div class="upload-section" id="uploadSection">
          <div class="upload-area" id="uploadArea">
            <div class="upload-icon">
              <svg class="icon" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"/>
              </svg>
            </div>
            <div class="upload-text">Drop your image here</div>
            <div class="upload-subtext">or click to browse • Max 10MB</div>
          </div>
          <input type="file" id="fileInput" class="file-input" accept="image/*">
        </div>

        <div id="imageSection" style="display: none;">
          <div class="image-preview" id="imagePreview">
            <div class="preview-container">
              <img id="previewImage" class="preview-image" alt="Preview">
            </div>
            <div class="preview-actions">
              <button class="btn btn-secondary" id="newImageBtn">
                <svg class="icon icon-sm" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                </svg>
                New Image
              </button>
            </div>
          </div>

          <!-- Image Info Accordion -->
          <div class="image-info-accordion">
            <div class="accordion-header" id="imageInfoToggle">
              <div class="accordion-title">
                <svg class="icon icon-sm" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/>
                </svg>
                Image Details
              </div>
              <svg class="accordion-icon" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>
              </svg>
            </div>
            <div class="accordion-content" id="imageInfoContent">
              <div class="image-info" id="imageInfo"></div>
            </div>
          </div>

          <!-- Quick Filters -->
          <div class="tool-section">
            <div class="tool-header" data-section="filters">
              <div class="tool-title">
                <svg class="icon icon-sm" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42"/>
                </svg>
                <span>Quick Filters</span>
              </div>
              <div class="tool-toggle">
                <svg class="icon icon-sm" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>
                </svg>
              </div>
            </div>
            <div class="tool-content" id="filtersContent">
              <div class="tool-content-inner">
                <div class="filter-buttons">
                  <button class="filter-btn active" data-filter="none">
                    <svg class="icon icon-sm" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/>
                    </svg>
                    Original
                  </button>
                  <button class="filter-btn" data-filter="grayscale">
                    <svg class="icon icon-sm" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                    </svg>
                    Grayscale
                  </button>
                  <button class="filter-btn" data-filter="sepia">
                    <svg class="icon icon-sm" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/>
                    </svg>
                    Sepia
                  </button>
                  <button class="filter-btn" data-filter="vintage">
                    <svg class="icon icon-sm" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"/>
                    </svg>
                    Vintage
                  </button>
                  <button class="filter-btn" data-filter="cool">
                    <svg class="icon icon-sm" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z"/>
                    </svg>
                    Cool
                  </button>
                  <button class="filter-btn" data-filter="warm">
                    <svg class="icon icon-sm" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z"/>
                    </svg>
                    Warm
                  </button>
                  <button class="filter-btn" data-filter="noir">
                    <svg class="icon icon-sm" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"/>
                    </svg>
                    Noir
                  </button>
                  <button class="filter-btn" data-filter="vivid">
                    <svg class="icon icon-sm" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077 1.41-.513m14.095-5.13 1.41-.513M5.106 17.785l1.15-.964m11.49-9.642 1.149-.964M7.501 19.795l.75-1.3m7.5-12.99.75-1.3m-6.063 16.658.26-1.477m2.605-14.772.26-1.477m0 17.726-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205 12 12m6.894 5.785-1.149-.964M6.256 8.357l-1.15-.964m1.25 9.85-1.41-.513M14.07 6.753l1.41-.513M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"/>
                    </svg>
                    Vivid
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Old quick filters section removed -->
          <div class="quick-filters" style="display: none;">
            <div class="quick-filters-header">
              <svg class="icon icon-sm" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42"/>
              </svg>
              <span class="quick-filters-title">Quick Filters</span>
            </div>
          </div>

          <!-- Crop Section -->
          <div class="tool-section">
            <div class="tool-header" data-section="crop">
              <div class="tool-title">
                <svg class="icon icon-sm" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 0 3.75 18v-1.5"/>
                </svg>
                <span>Crop</span>
              </div>
              <div class="tool-toggle">
                <svg class="icon icon-sm" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>
                </svg>
              </div>
            </div>
            <div class="tool-content" id="cropContent">
              <div class="tool-content-inner">
                <div class="crop-toggle-section">
                  <div class="crop-status" id="cropStatus">
                    <svg class="icon icon-sm" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/>
                    </svg>
                    <span>Crop Disabled</span>
                  </div>
                  <button class="btn btn-secondary" id="toggleCropBtn">Enable Crop</button>
                </div>

                <div class="crop-controls" id="cropControls" style="display: none;">
                  <div class="controls-grid">
                    <div class="control-group">
                      <label class="control-label">
                        <svg class="icon icon-sm" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5"/>
                        </svg>
                        Left
                      </label>
                      <input type="range" id="cropLeft" class="control-slider" min="0" max="50" value="0">
                      <div class="control-value">0%</div>
                    </div>
                    <div class="control-group">
                      <label class="control-label">
                        <svg class="icon icon-sm" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5"/>
                        </svg>
                        Top
                      </label>
                      <input type="range" id="cropTop" class="control-slider" min="0" max="50" value="0">
                      <div class="control-value">0%</div>
                    </div>
                    <div class="control-group">
                      <label class="control-label">
                        <svg class="icon icon-sm" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6Z"/>
                        </svg>
                        Width
                      </label>
                      <input type="range" id="cropWidth" class="control-slider" min="10" max="100" value="100">
                      <div class="control-value">100%</div>
                    </div>
                    <div class="control-group">
                      <label class="control-label">
                        <svg class="icon icon-sm" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6Z"/>
                        </svg>
                        Height
                      </label>
                      <input type="range" id="cropHeight" class="control-slider" min="10" max="100" value="100">
                      <div class="control-value">100%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Adjustments Section -->
          <div class="tool-section">
            <div class="tool-header" data-section="adjustments">
              <div class="tool-title">
                <svg class="icon icon-sm" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m0 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"/>
                </svg>
                <span>Adjustments</span>
              </div>
              <div class="tool-toggle">
                <svg class="icon icon-sm" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>
                </svg>
              </div>
            </div>
            <div class="tool-content" id="adjustmentsContent">
              <div class="tool-content-inner">
                <div class="controls-grid">
                  <div class="control-group">
                    <label class="control-label">
                      <svg class="icon icon-sm" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/>
                      </svg>
                      Brightness
                    </label>
                    <input type="range" id="brightness" class="control-slider" min="0" max="200" value="100">
                    <div class="control-value">100%</div>
                  </div>
                  <div class="control-group">
                    <label class="control-label">
                      <svg class="icon icon-sm" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"/>
                      </svg>
                      Contrast
                    </label>
                    <input type="range" id="contrast" class="control-slider" min="0" max="200" value="100">
                    <div class="control-value">100%</div>
                  </div>
                  <div class="control-group">
                    <label class="control-label">
                      <svg class="icon icon-sm" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z"/>
                      </svg>
                      Saturation
                    </label>
                    <input type="range" id="saturation" class="control-slider" min="0" max="200" value="100">
                    <div class="control-value">100%</div>
                  </div>
                  <div class="control-group">
                    <label class="control-label">
                      <svg class="icon icon-sm" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"/>
                      </svg>
                      Blur
                    </label>
                    <input type="range" id="blur" class="control-slider" min="0" max="10" value="0">
                    <div class="control-value">0px</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Compression Section -->
          <div class="tool-section">
            <div class="tool-header" data-section="compression">
              <div class="tool-title">
                <svg class="icon icon-sm" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/>
                </svg>
                <span>Compression & Format</span>
              </div>
              <div class="tool-toggle">
                <svg class="icon icon-sm" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>
                </svg>
              </div>
            </div>
            <div class="tool-content" id="compressionContent">
              <div class="tool-content-inner">
                <div class="format-buttons">
                  <button class="format-btn active" data-format="jpeg">JPEG</button>
                  <button class="format-btn" data-format="png">PNG</button>
                  <button class="format-btn" data-format="webp">WebP</button>
                  <button class="format-btn" data-format="avif">AVIF</button>
                  <button class="format-btn" data-format="bmp">BMP</button>
                  <button class="format-btn" data-format="tiff">TIFF</button>
                  <button class="format-btn" data-format="ico">ICO</button>
                  <button class="format-btn" data-format="svg">SVG</button>
                </div>

                <div class="compression-controls">
                  <div class="control-group">
                    <label class="control-label">
                      <svg class="icon icon-sm" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                      </svg>
                      Quality
                    </label>
                    <input type="range" id="quality" class="control-slider" min="10" max="100" value="85">
                    <div class="control-value">85%</div>
                  </div>
                </div>

                <div class="size-info" id="sizeInfo" style="display: none;">
                  <div class="size-original">
                    <div class="size-label">Original</div>
                    <div class="size-value" id="originalSize">-</div>
                  </div>
                  <div class="size-savings" id="savings">-</div>
                  <div class="size-compressed">
                    <div class="size-label">Compressed</div>
                    <div class="size-value" id="compressedSize">-</div>
                  </div>
                </div>

                <div class="progress-container" id="progressContainer" style="display: none;">
                  <div class="progress-bar" id="progressBar"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="action-buttons">
            <button class="btn btn-secondary" id="resetBtn">
              <svg class="icon icon-sm" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/>
              </svg>
              Reset
            </button>
            <button class="btn btn-primary" id="downloadBtn">
              <svg class="icon icon-sm" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/>
              </svg>
              Download
            </button>
          </div>
        </div>
      </div>
    `

    this.attachEventListeners(container)
    return container
  }

  private attachEventListeners(container: HTMLElement): void {
    const uploadArea = container.querySelector('#uploadArea') as HTMLElement
    const fileInput = container.querySelector('#fileInput') as HTMLInputElement
    const imageSection = container.querySelector('#imageSection') as HTMLElement
    const uploadSection = container.querySelector('#uploadSection') as HTMLElement
    const previewImage = container.querySelector('#previewImage') as HTMLImageElement
    const imageInfo = container.querySelector('#imageInfo') as HTMLElement
    const themeToggle = container.querySelector('#themeToggle') as HTMLButtonElement
    const newImageBtn = container.querySelector('#newImageBtn') as HTMLButtonElement
    const imageInfoToggle = container.querySelector('#imageInfoToggle') as HTMLElement
    const imageInfoContent = container.querySelector('#imageInfoContent') as HTMLElement

    // Theme toggle
    themeToggle.addEventListener('click', () => {
      this.toggleTheme()
      this.updateThemeIcon(themeToggle)
    })
    this.updateThemeIcon(themeToggle)

    // New image button
    newImageBtn.addEventListener('click', () => {
      this.resetToUpload(uploadSection, imageSection)
    })

    // Image info accordion
    imageInfoToggle.addEventListener('click', () => {
      this.toggleAccordion(imageInfoToggle, imageInfoContent)
    })

    // File upload handling
    uploadArea.addEventListener('click', () => fileInput.click())
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault()
      uploadArea.classList.add('dragover')
    })
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragover')
    })
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault()
      uploadArea.classList.remove('dragover')
      const files = e.dataTransfer?.files
      if (files && files[0]) {
        this.handleFileUpload(files[0], previewImage, imageSection, imageInfo, uploadSection)
      }
    })

    fileInput.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        this.handleFileUpload(file, previewImage, imageSection, imageInfo, uploadSection)
      }
    })

    // Tool section toggles
    const toolHeaders = container.querySelectorAll('.tool-header')
    toolHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const section = header.getAttribute('data-section')!
        this.toggleSection(header as HTMLElement, section)
      })
    })

    // Crop functionality
    const toggleCropBtn = container.querySelector('#toggleCropBtn') as HTMLButtonElement
    const cropStatus = container.querySelector('#cropStatus') as HTMLElement
    const cropControls = container.querySelector('#cropControls') as HTMLElement

    toggleCropBtn.addEventListener('click', () => {
      this.toggleCrop(toggleCropBtn, cropStatus, cropControls, container)
    })

    // Crop sliders
    const cropSliders = container.querySelectorAll('#cropLeft, #cropTop, #cropWidth, #cropHeight')
    cropSliders.forEach(slider => {
      const input = slider as HTMLInputElement
      const valueDisplay = input.parentElement?.querySelector('.control-value')
      
      input.addEventListener('input', () => {
        const value = input.value
        if (valueDisplay) {
          valueDisplay.textContent = `${value}%`
        }
        this.updateCrop(container)
      })
    })

    // Listen for crop updates from interactive handles
    document.addEventListener('cropUpdate', (e: any) => {
      const settings = e.detail
      
      // Update slider values
      const cropLeft = container.querySelector('#cropLeft') as HTMLInputElement
      const cropTop = container.querySelector('#cropTop') as HTMLInputElement
      const cropWidth = container.querySelector('#cropWidth') as HTMLInputElement
      const cropHeight = container.querySelector('#cropHeight') as HTMLInputElement
      
      if (cropLeft) {
        cropLeft.value = settings.x.toString()
        const valueDisplay = cropLeft.parentElement?.querySelector('.control-value')
        if (valueDisplay) valueDisplay.textContent = `${Math.round(settings.x)}%`
      }
      
      if (cropTop) {
        cropTop.value = settings.y.toString()
        const valueDisplay = cropTop.parentElement?.querySelector('.control-value')
        if (valueDisplay) valueDisplay.textContent = `${Math.round(settings.y)}%`
      }
      
      if (cropWidth) {
        cropWidth.value = settings.width.toString()
        const valueDisplay = cropWidth.parentElement?.querySelector('.control-value')
        if (valueDisplay) valueDisplay.textContent = `${Math.round(settings.width)}%`
      }
      
      if (cropHeight) {
        cropHeight.value = settings.height.toString()
        const valueDisplay = cropHeight.parentElement?.querySelector('.control-value')
        if (valueDisplay) valueDisplay.textContent = `${Math.round(settings.height)}%`
      }
      
      this.applyCropOverlay(container)
      this.updateCompression(container)
    })

    // Control sliders
    const sliders = container.querySelectorAll('.control-slider:not(#cropLeft):not(#cropTop):not(#cropWidth):not(#cropHeight)')
    sliders.forEach(slider => {
      const input = slider as HTMLInputElement
      const valueDisplay = input.parentElement?.querySelector('.control-value')
      
      input.addEventListener('input', () => {
        const value = input.value
        let suffix = '%'
        
        if (input.id === 'blur') suffix = 'px'
        
        if (valueDisplay) {
          valueDisplay.textContent = `${value}${suffix}`
        }
        
        if (input.id === 'quality') {
          this.updateCompression(container)
        } else {
          this.applyFilters(container)
        }
      })
    })

    // Filter buttons
    const filterButtons = container.querySelectorAll('.filter-btn')
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'))
        button.classList.add('active')
        this.applyFilters(container)
      })
    })

    // Format buttons
    const formatButtons = container.querySelectorAll('.format-btn')
    formatButtons.forEach(button => {
      button.addEventListener('click', () => {
        formatButtons.forEach(btn => btn.classList.remove('active'))
        button.classList.add('active')
        
        // Update quality slider visibility
        const format = button.getAttribute('data-format')
        const qualityGroup = container.querySelector('#quality')?.parentElement
        const formatInfo = this.compressionManager.getFormatInfo(format!)
        
        if (qualityGroup) {
          qualityGroup.style.opacity = formatInfo?.supportsQuality ? '1' : '0.5'
          const qualitySlider = qualityGroup.querySelector('#quality') as HTMLInputElement
          qualitySlider.disabled = !formatInfo?.supportsQuality
        }
        
        this.updateCompression(container)
      })
    })

    // Action buttons
    const resetBtn = container.querySelector('#resetBtn') as HTMLButtonElement
    const downloadBtn = container.querySelector('#downloadBtn') as HTMLButtonElement

    resetBtn.addEventListener('click', () => this.resetAll(container))
    downloadBtn.addEventListener('click', () => this.downloadImage(container))
  }

  private updateThemeIcon(button: HTMLButtonElement): void {
    const icon = button.querySelector('svg')!
    if (this.isDarkMode) {
      icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"/>'
    } else {
      icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/>'
    }
  }

  private resetToUpload(uploadSection: HTMLElement, imageSection: HTMLElement): void {
    // Reset all states
    this.currentImage = null
    this.currentFile = null
    this.compressionResult = null
    this.isCropEnabled = false
    this.activeSections.clear()
    this.cropManager.resetCrop()

    // Show upload section, hide image section
    uploadSection.classList.remove('collapsed')
    imageSection.style.display = 'none'

    // Reset file input
    const fileInput = uploadSection.querySelector('#fileInput') as HTMLInputElement
    fileInput.value = ''

    this.toastManager.success('Ready for new image!')
  }

  private toggleAccordion(header: HTMLElement, content: HTMLElement): void {
    const icon = header.querySelector('.accordion-icon') as SVGElement
    const isExpanded = content.classList.contains('expanded')

    if (isExpanded) {
      header.classList.remove('active')
      content.classList.remove('expanded')
      icon.style.transform = 'rotate(0deg)'
    } else {
      header.classList.add('active')
      content.classList.add('expanded')
      icon.style.transform = 'rotate(180deg)'
    }
  }

  private toggleCrop(
    button: HTMLButtonElement, 
    status: HTMLElement, 
    controls: HTMLElement,
    container: HTMLElement
  ): void {
    this.isCropEnabled = !this.isCropEnabled
    
    if (this.isCropEnabled) {
      // Enable crop
      this.cropManager.setCropSettings({ enabled: true })
      button.innerHTML = `
        <svg class="icon icon-sm" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/>
        </svg>
        Disable Crop
      `
      button.classList.remove('btn-secondary')
      button.classList.add('btn-primary')
      
      status.classList.add('active')
      status.innerHTML = `
        <svg class="icon icon-sm" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
        </svg>
        <span>Crop Active - Drag handles to adjust</span>
      `
      
      controls.style.display = 'block'
      this.updateCrop(container)
    } else {
      // Disable crop
      this.cropManager.setCropSettings({ enabled: false })
      button.innerHTML = `
        <svg class="icon icon-sm" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 0 3.75 18v-1.5"/>
        </svg>
        Enable Crop
      `
      button.classList.remove('btn-primary')
      button.classList.add('btn-secondary')
      
      status.classList.remove('active')
      status.innerHTML = `
        <svg class="icon icon-sm" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/>
        </svg>
        <span>Click to enable crop tool</span>
      `
      
      controls.style.display = 'none'
      this.removeCropOverlay(container)
      this.updateCompression(container)
    }
  }

  private updateCrop(container: HTMLElement): void {
    if (!this.currentImage || !this.isCropEnabled) return

    const cropLeft = parseInt((container.querySelector('#cropLeft') as HTMLInputElement).value)
    const cropTop = parseInt((container.querySelector('#cropTop') as HTMLInputElement).value)
    const cropWidth = parseInt((container.querySelector('#cropWidth') as HTMLInputElement).value)
    const cropHeight = parseInt((container.querySelector('#cropHeight') as HTMLInputElement).value)

    this.cropManager.setCropSettings({
      x: cropLeft,
      y: cropTop,
      width: cropWidth,
      height: cropHeight,
      enabled: true
    })

    this.applyCropOverlay(container)
    this.updateCompression(container)
  }

  private applyCropOverlay(container: HTMLElement): void {
    const previewImage = container.querySelector('#previewImage') as HTMLImageElement
    this.cropManager.applyCropOverlay(previewImage)
  }

  private removeCropOverlay(container: HTMLElement): void {
    const previewContainer = container.querySelector('.preview-container')
    const overlay = previewContainer?.querySelector('.crop-overlay')
    if (overlay) {
      overlay.remove()
    }
  }

  private toggleSection(header: HTMLElement, sectionName: string): void {
    const content = header.nextElementSibling as HTMLElement
    const toggle = header.querySelector('.tool-toggle svg') as SVGElement
    const isActive = this.activeSections.has(sectionName)

    if (isActive) {
      // Collapse
      this.activeSections.delete(sectionName)
      header.classList.remove('active')
      content.classList.remove('expanded')
      toggle.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>'
    } else {
      // Expand
      this.activeSections.add(sectionName)
      header.classList.add('active')
      content.classList.add('expanded')
      toggle.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5"/>'
    }
  }

  private async handleFileUpload(
    file: File, 
    previewImage: HTMLImageElement, 
    imageSection: HTMLElement,
    imageInfo: HTMLElement,
    uploadSection: HTMLElement
  ): Promise<void> {
    try {
      this.showProgress(imageSection, 20)
      
      const validation = this.fileHandler.validateImageFile(file)
      if (!validation.valid) {
        this.toastManager.error(validation.error!)
        return
      }

      this.showProgress(imageSection, 40)
      const imageUrl = await this.fileHandler.loadImage(file)
      
      this.showProgress(imageSection, 60)
      previewImage.src = imageUrl
      
      previewImage.onload = async () => {
        this.currentImage = previewImage
        this.currentFile = file
        this.canvas.width = previewImage.naturalWidth
        this.canvas.height = previewImage.naturalHeight
        this.ctx.drawImage(previewImage, 0, 0)
        
        this.showProgress(imageSection, 80)
        
        // Display image info
        const fileInfo = this.fileHandler.getFileInfo(file)
        imageInfo.innerHTML = `
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Name</span>
              <span class="info-value">${fileInfo.name}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Dimensions</span>
              <span class="info-value">${previewImage.naturalWidth} × ${previewImage.naturalHeight}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Size</span>
              <span class="info-value">${fileInfo.size}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Format</span>
              <span class="info-value">${fileInfo.type}</span>
            </div>
          </div>
        `
        
        this.showProgress(imageSection, 100)
        
        setTimeout(() => {
          this.hideProgress(imageSection)
          
          // Collapse upload section and show image section
          uploadSection.classList.add('collapsed')
          imageSection.style.display = 'block'
          
          // Auto-expand compression section
          this.activeSections.add('compression')
          const compressionHeader = imageSection.querySelector('[data-section="compression"]') as HTMLElement
          const compressionContent = compressionHeader.nextElementSibling as HTMLElement
          const compressionToggle = compressionHeader.querySelector('.tool-toggle svg') as SVGElement
          compressionHeader.classList.add('active')
          compressionContent.classList.add('expanded')
          compressionToggle.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5"/>'
          
          this.updateCompression(imageSection.parentElement as HTMLElement)
          this.toastManager.success('Image loaded successfully!')
        }, 500)
      }
    } catch (error) {
      this.hideProgress(imageSection)
      console.error('Error loading image:', error)
      this.toastManager.error('Error loading image. Please try again.')
    }
  }

  private showProgress(container: HTMLElement, progress: number): void {
    const progressContainer = container.querySelector('#progressContainer') as HTMLElement
    const progressBar = container.querySelector('#progressBar') as HTMLElement
    
    if (progressContainer && progressBar) {
      progressContainer.style.display = 'block'
      progressBar.style.width = `${progress}%`
    }
  }

  private hideProgress(container: HTMLElement): void {
    const progressContainer = container.querySelector('#progressContainer') as HTMLElement
    if (progressContainer) {
      progressContainer.style.display = 'none'
    }
  }

  private applyFilters(container: HTMLElement): void {
    if (!this.currentImage) return

    const brightness = (container.querySelector('#brightness') as HTMLInputElement).value
    const contrast = (container.querySelector('#contrast') as HTMLInputElement).value
    const saturation = (container.querySelector('#saturation') as HTMLInputElement).value
    const blur = (container.querySelector('#blur') as HTMLInputElement).value
    const activeFilter = container.querySelector('.filter-btn.active')?.getAttribute('data-filter') || 'none'

    const previewImage = container.querySelector('#previewImage') as HTMLImageElement
    
    this.filterManager.applyFilters(previewImage, {
      brightness: parseInt(brightness),
      contrast: parseInt(contrast),
      saturation: parseInt(saturation),
      blur: parseInt(blur),
      filter: activeFilter
    })

    // Update compression after filter changes
    setTimeout(() => this.updateCompression(container), 100)
  }

  private async updateCompression(container: HTMLElement): Promise<void> {
    if (!this.currentImage || !this.currentFile) return

    try {
      const quality = parseInt((container.querySelector('#quality') as HTMLInputElement).value)
      const activeFormat = container.querySelector('.format-btn.active')?.getAttribute('data-format') || 'jpeg'

      // Apply crop if enabled
      let imageToCompress = this.currentImage
      if (this.isCropEnabled) {
        const cropResult = this.cropManager.applyCrop(this.currentImage)
        // Create a temporary image element from the cropped canvas
        const tempImg = new Image()
        tempImg.src = cropResult.dataUrl
        await new Promise(resolve => {
          tempImg.onload = resolve
        })
        imageToCompress = tempImg
      }

      const result = await this.compressionManager.compressImage(
        imageToCompress,
        {
          quality,
          format: activeFormat,
          maintainAspectRatio: true
        },
        this.currentFile.size
      )

      this.compressionResult = result
      this.updateSizeInfo(container, result)
    } catch (error) {
      console.error('Compression error:', error)
      this.toastManager.error('Failed to compress image')
    }
  }

  private updateSizeInfo(container: HTMLElement, result: CompressionResult): void {
    const sizeInfo = container.querySelector('#sizeInfo') as HTMLElement
    const originalSize = container.querySelector('#originalSize') as HTMLElement
    const compressedSize = container.querySelector('#compressedSize') as HTMLElement
    const savings = container.querySelector('#savings') as HTMLElement

    if (sizeInfo && originalSize && compressedSize && savings) {
      sizeInfo.style.display = 'flex'
      
      originalSize.textContent = this.compressionManager.formatFileSize(result.originalSize)
      compressedSize.textContent = this.compressionManager.formatFileSize(result.compressedSize)
      
      if (result.compressionRatio > 0) {
        savings.textContent = `-${result.compressionRatio.toFixed(1)}%`
        savings.style.color = 'var(--success)'
      } else {
        savings.textContent = `+${Math.abs(result.compressionRatio).toFixed(1)}%`
        savings.style.color = 'var(--error)'
      }
    }
  }

  private resetAll(container: HTMLElement): void {
    // Reset sliders
    const sliders = container.querySelectorAll('.control-slider') as NodeListOf<HTMLInputElement>
    sliders.forEach(slider => {
      let defaultValue = '100'
      if (slider.id === 'blur') defaultValue = '0'
      else if (slider.id === 'quality') defaultValue = '85'
      else if (slider.id === 'cropLeft' || slider.id === 'cropTop') defaultValue = '0'
      else if (slider.id === 'cropWidth' || slider.id === 'cropHeight') defaultValue = '100'
      
      slider.value = defaultValue
      
      const valueDisplay = slider.parentElement?.querySelector('.control-value')
      if (valueDisplay) {
        let suffix = '%'
        if (slider.id === 'blur') suffix = 'px'
        valueDisplay.textContent = `${defaultValue}${suffix}`
      }
    })

    // Reset filter buttons
    const filterButtons = container.querySelectorAll('.filter-btn')
    filterButtons.forEach(btn => btn.classList.remove('active'))
    const originalBtn = container.querySelector('.filter-btn[data-filter="none"]')
    originalBtn?.classList.add('active')

    // Reset format buttons
    const formatButtons = container.querySelectorAll('.format-btn')
    formatButtons.forEach(btn => btn.classList.remove('active'))
    const jpegBtn = container.querySelector('.format-btn[data-format="jpeg"]')
    jpegBtn?.classList.add('active')

    // Reset crop
    if (this.isCropEnabled) {
      const toggleCropBtn = container.querySelector('#toggleCropBtn') as HTMLButtonElement
      const cropStatus = container.querySelector('#cropStatus') as HTMLElement
      const cropControls = container.querySelector('#cropControls') as HTMLElement
      this.toggleCrop(toggleCropBtn, cropStatus, cropControls, container)
    }

    // Reset preview image
    const previewImage = container.querySelector('#previewImage') as HTMLImageElement
    previewImage.style.filter = ''

    // Update compression
    setTimeout(() => this.updateCompression(container), 100)
    
    this.toastManager.success('All settings reset!')
  }

  private downloadImage(container: HTMLElement): void {
    if (!this.compressionResult) {
      this.toastManager.error('No processed image to download')
      return
    }

    try {
      const activeFormat = container.querySelector('.format-btn.active')?.getAttribute('data-format') || 'jpeg'
      const formatInfo = this.compressionManager.getFormatInfo(activeFormat)
      
      const url = URL.createObjectURL(this.compressionResult.blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `solanam-processed-${Date.now()}.${formatInfo?.extension || 'jpg'}`
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      this.toastManager.success('Image downloaded!')
    } catch (error) {
      console.error('Download error:', error)
      this.toastManager.error('Failed to download image')
    }
  }
}