export interface CropSettings {
  x: number
  y: number
  width: number
  height: number
  enabled: boolean
}

export interface CropResult {
  canvas: HTMLCanvasElement
  dataUrl: string
  croppedWidth: number
  croppedHeight: number
}

export class CropManager {
  private cropSettings: CropSettings = {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    enabled: false
  }

  setCropSettings(settings: Partial<CropSettings>): void {
    this.cropSettings = { ...this.cropSettings, ...settings }
  }

  getCropSettings(): CropSettings {
    return { ...this.cropSettings }
  }

  applyCrop(sourceImage: HTMLImageElement): CropResult {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    if (!this.cropSettings.enabled) {
      // Return original image if crop is disabled
      canvas.width = sourceImage.naturalWidth
      canvas.height = sourceImage.naturalHeight
      ctx.drawImage(sourceImage, 0, 0)
      
      return {
        canvas,
        dataUrl: canvas.toDataURL(),
        croppedWidth: sourceImage.naturalWidth,
        croppedHeight: sourceImage.naturalHeight
      }
    }

    // Calculate crop dimensions based on percentages
    const sourceWidth = sourceImage.naturalWidth
    const sourceHeight = sourceImage.naturalHeight
    
    const cropX = (this.cropSettings.x / 100) * sourceWidth
    const cropY = (this.cropSettings.y / 100) * sourceHeight
    const cropWidth = (this.cropSettings.width / 100) * sourceWidth
    const cropHeight = (this.cropSettings.height / 100) * sourceHeight

    // Set canvas size to cropped dimensions
    canvas.width = cropWidth
    canvas.height = cropHeight

    // Draw the cropped portion
    ctx.drawImage(
      sourceImage,
      cropX, cropY, cropWidth, cropHeight,  // Source rectangle
      0, 0, cropWidth, cropHeight           // Destination rectangle
    )

    return {
      canvas,
      dataUrl: canvas.toDataURL(),
      croppedWidth: cropWidth,
      croppedHeight: cropHeight
    }
  }

  applyCropOverlay(previewImage: HTMLImageElement): void {
    const container = previewImage.parentElement
    if (!container) return

    // Remove existing overlay
    const existingOverlay = container.querySelector('.crop-overlay')
    if (existingOverlay) {
      existingOverlay.remove()
    }

    if (!this.cropSettings.enabled) return

    // Create crop overlay
    const overlay = document.createElement('div')
    overlay.className = 'crop-overlay'
    
    const cropBox = document.createElement('div')
    cropBox.className = 'crop-box'
    
    // Add crop guidelines
    const guidelines = document.createElement('div')
    guidelines.className = 'crop-guidelines'
    cropBox.appendChild(guidelines)
    
    // Position crop box based on percentages
    const imageRect = previewImage.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    
    const relativeLeft = imageRect.left - containerRect.left
    const relativeTop = imageRect.top - containerRect.top
    
    const cropLeft = relativeLeft + (this.cropSettings.x / 100) * previewImage.offsetWidth
    const cropTop = relativeTop + (this.cropSettings.y / 100) * previewImage.offsetHeight
    const cropWidth = (this.cropSettings.width / 100) * previewImage.offsetWidth
    const cropHeight = (this.cropSettings.height / 100) * previewImage.offsetHeight
    
    cropBox.style.left = `${cropLeft}px`
    cropBox.style.top = `${cropTop}px`
    cropBox.style.width = `${cropWidth}px`
    cropBox.style.height = `${cropHeight}px`
    
    // Add crop handles
    const handles = ['nw', 'ne', 'sw', 'se', 'n', 's', 'w', 'e']
    handles.forEach(handle => {
      const handleElement = document.createElement('div')
      handleElement.className = `crop-handle ${handle}`
      handleElement.dataset.handle = handle
      cropBox.appendChild(handleElement)
    })
    
    overlay.appendChild(cropBox)
    container.appendChild(overlay)
    
    // Add drag functionality
    this.addCropInteractivity(cropBox, previewImage)
  }

  private addCropInteractivity(cropBox: HTMLElement, previewImage: HTMLImageElement): void {
    let isDragging = false
    let isResizing = false
    let currentHandle = ''
    let startX = 0
    let startY = 0
    let startCropX = 0
    let startCropY = 0
    let startCropWidth = 0
    let startCropHeight = 0

    // Handle dragging the crop box
    cropBox.addEventListener('mousedown', (e) => {
      if ((e.target as HTMLElement).classList.contains('crop-handle')) {
        isResizing = true
        currentHandle = (e.target as HTMLElement).dataset.handle || ''
      } else {
        isDragging = true
      }
      
      startX = e.clientX
      startY = e.clientY
      startCropX = this.cropSettings.x
      startCropY = this.cropSettings.y
      startCropWidth = this.cropSettings.width
      startCropHeight = this.cropSettings.height
      
      e.preventDefault()
    })

    document.addEventListener('mousemove', (e) => {
      if (!isDragging && !isResizing) return

      const deltaX = e.clientX - startX
      const deltaY = e.clientY - startY
      const imageWidth = previewImage.offsetWidth
      const imageHeight = previewImage.offsetHeight
      
      const deltaXPercent = (deltaX / imageWidth) * 100
      const deltaYPercent = (deltaY / imageHeight) * 100

      if (isDragging) {
        // Move the crop box
        const newX = Math.max(0, Math.min(100 - this.cropSettings.width, startCropX + deltaXPercent))
        const newY = Math.max(0, Math.min(100 - this.cropSettings.height, startCropY + deltaYPercent))
        
        this.setCropSettings({ x: newX, y: newY })
      } else if (isResizing) {
        // Resize the crop box based on handle
        let newSettings = { ...this.cropSettings }
        
        switch (currentHandle) {
          case 'se':
            newSettings.width = Math.max(10, Math.min(100 - startCropX, startCropWidth + deltaXPercent))
            newSettings.height = Math.max(10, Math.min(100 - startCropY, startCropHeight + deltaYPercent))
            break
          case 'nw':
            const newWidth = Math.max(10, startCropWidth - deltaXPercent)
            const newHeight = Math.max(10, startCropHeight - deltaYPercent)
            newSettings.x = Math.max(0, startCropX + (startCropWidth - newWidth))
            newSettings.y = Math.max(0, startCropY + (startCropHeight - newHeight))
            newSettings.width = newWidth
            newSettings.height = newHeight
            break
          case 'ne':
            newSettings.width = Math.max(10, Math.min(100 - startCropX, startCropWidth + deltaXPercent))
            const newHeightNE = Math.max(10, startCropHeight - deltaYPercent)
            newSettings.y = Math.max(0, startCropY + (startCropHeight - newHeightNE))
            newSettings.height = newHeightNE
            break
          case 'sw':
            const newWidthSW = Math.max(10, startCropWidth - deltaXPercent)
            newSettings.x = Math.max(0, startCropX + (startCropWidth - newWidthSW))
            newSettings.width = newWidthSW
            newSettings.height = Math.max(10, Math.min(100 - startCropY, startCropHeight + deltaYPercent))
            break
          case 'n':
            const newHeightN = Math.max(10, startCropHeight - deltaYPercent)
            newSettings.y = Math.max(0, startCropY + (startCropHeight - newHeightN))
            newSettings.height = newHeightN
            break
          case 's':
            newSettings.height = Math.max(10, Math.min(100 - startCropY, startCropHeight + deltaYPercent))
            break
          case 'w':
            const newWidthW = Math.max(10, startCropWidth - deltaXPercent)
            newSettings.x = Math.max(0, startCropX + (startCropWidth - newWidthW))
            newSettings.width = newWidthW
            break
          case 'e':
            newSettings.width = Math.max(10, Math.min(100 - startCropX, startCropWidth + deltaXPercent))
            break
        }
        
        this.setCropSettings(newSettings)
      }
      
      // Trigger update event
      const updateEvent = new CustomEvent('cropUpdate', { detail: this.cropSettings })
      document.dispatchEvent(updateEvent)
    })

    document.addEventListener('mouseup', () => {
      isDragging = false
      isResizing = false
      currentHandle = ''
    })
  }

  resetCrop(): void {
    this.cropSettings = {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      enabled: false
    }
  }
}