// Content script for Solanam Image Processor
// This script can interact with web pages

class SolanamContentScript {
  constructor() {
    this.init()
  }

  init() {
    // Listen for messages from the extension popup and background
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'processImageFromContext') {
        this.processImageFromContext(message.imageUrl)
          .then(imageData => sendResponse({ success: true, imageData }))
          .catch(error => sendResponse({ success: false, error: error.message }))
        return true // Keep the message channel open for async response
      } else if (message.action === 'exportImageDirect') {
        this.exportImageDirect(message.imageUrl, message.format)
          .then(() => sendResponse({ success: true }))
          .catch(error => sendResponse({ success: false, error: error.message }))
        return true
      } else if (message.action === 'extractImages') {
        this.extractPageImages()
          .then(images => sendResponse({ images }))
          .catch(error => sendResponse({ error: error.message }))
        return true
      }
    })
  }

  async processImageFromContext(imageUrl) {
    try {
      // Create a temporary image element
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            // Create canvas to convert image
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            
            canvas.width = img.naturalWidth
            canvas.height = img.naturalHeight
            
            ctx.drawImage(img, 0, 0)
            
            // Convert to data URL
            const dataUrl = canvas.toDataURL('image/png')
            
            resolve({
              src: imageUrl,
              dataUrl: dataUrl,
              width: img.naturalWidth,
              height: img.naturalHeight,
              timestamp: Date.now()
            })
          } catch (error) {
            reject(new Error('Failed to process image: ' + error.message))
          }
        }
        
        img.onerror = () => {
          reject(new Error('Failed to load image from URL'))
        }
        
        img.src = imageUrl
      })
    } catch (error) {
      throw new Error('Failed to process image: ' + error.message)
    }
  }

  async exportImageDirect(imageUrl, format) {
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            
            canvas.width = img.naturalWidth
            canvas.height = img.naturalHeight
            
            ctx.drawImage(img, 0, 0)
            
            // Convert to desired format
            const mimeType = this.getMimeType(format)
            const quality = format === 'jpeg' ? 0.9 : undefined
            
            canvas.toBlob((blob) => {
              if (!blob) {
                reject(new Error('Failed to create blob'))
                return
              }
              
              // Create download link
              const url = URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.href = url
              link.download = `solanam-export-${Date.now()}.${this.getExtension(format)}`
              
              // Trigger download
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              
              // Cleanup
              URL.revokeObjectURL(url)
              resolve()
            }, mimeType, quality)
          } catch (error) {
            reject(error)
          }
        }
        
        img.onerror = () => {
          reject(new Error('Failed to load image'))
        }
        
        img.src = imageUrl
      })
    } catch (error) {
      throw error
    }
  }

  getMimeType(format) {
    const mimeTypes = {
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'webp': 'image/webp',
      'avif': 'image/avif'
    }
    return mimeTypes[format] || 'image/png'
  }

  getExtension(format) {
    const extensions = {
      'jpeg': 'jpg',
      'png': 'png',
      'webp': 'webp',
      'avif': 'avif'
    }
    return extensions[format] || 'png'
  }

  async extractPageImages() {
    const images = []
    const imgElements = document.querySelectorAll('img')
    
    for (const img of imgElements) {
      if (img.src && img.naturalWidth > 100 && img.naturalHeight > 100) {
        try {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          canvas.width = img.naturalWidth
          canvas.height = img.naturalHeight
          
          ctx.drawImage(img, 0, 0)
          
          const dataUrl = canvas.toDataURL('image/png')
          
          images.push({
            src: img.src,
            alt: img.alt || 'Image',
            width: img.naturalWidth,
            height: img.naturalHeight,
            dataUrl
          })
        } catch (error) {
          console.warn('Could not extract image:', error)
        }
      }
    }
    
    return images
  }
}

// Initialize the content script
new SolanamContentScript()