export interface CompressionOptions {
  quality: number
  format: string
  maintainAspectRatio: boolean
}

export interface CompressionResult {
  blob: Blob
  dataUrl: string
  originalSize: number
  compressedSize: number
  compressionRatio: number
}

export interface FormatInfo {
  extension: string
  mimeType: string
  supportsQuality: boolean
  description: string
}

export class CompressionManager {
  private readonly formatMap: Record<string, FormatInfo> = {
    jpeg: { extension: 'jpg', mimeType: 'image/jpeg', supportsQuality: true, description: 'Best for photos' },
    png: { extension: 'png', mimeType: 'image/png', supportsQuality: false, description: 'Best for graphics' },
    webp: { extension: 'webp', mimeType: 'image/webp', supportsQuality: true, description: 'Modern format' },
    avif: { extension: 'avif', mimeType: 'image/avif', supportsQuality: true, description: 'Next-gen format' },
    bmp: { extension: 'bmp', mimeType: 'image/bmp', supportsQuality: false, description: 'Uncompressed' },
    tiff: { extension: 'tiff', mimeType: 'image/tiff', supportsQuality: false, description: 'High quality' },
    ico: { extension: 'ico', mimeType: 'image/x-icon', supportsQuality: false, description: 'Icon format' },
    svg: { extension: 'svg', mimeType: 'image/svg+xml', supportsQuality: false, description: 'Vector format' }
  }

  async compressImage(
    image: HTMLImageElement,
    options: CompressionOptions,
    originalSize: number
  ): Promise<CompressionResult> {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Canvas context not available'))
          return
        }

        canvas.width = image.naturalWidth
        canvas.height = image.naturalHeight
        
        ctx.drawImage(image, 0, 0)
        
        const formatInfo = this.getFormatInfo(options.format)
        const quality = formatInfo.supportsQuality ? options.quality / 100 : 1
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'))
              return
            }

            const reader = new FileReader()
            reader.onload = () => {
              const compressionRatio = ((originalSize - blob.size) / originalSize) * 100
              
              resolve({
                blob,
                dataUrl: reader.result as string,
                originalSize,
                compressedSize: blob.size,
                compressionRatio
              })
            }
            reader.onerror = () => reject(new Error('Failed to read compressed image'))
            reader.readAsDataURL(blob)
          },
          formatInfo.mimeType,
          quality
        )
      } catch (error) {
        reject(error)
      }
    })
  }

  getFormatInfo(format: string): FormatInfo {
    return this.formatMap[format] || this.formatMap.jpeg
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}