export interface FileValidation {
  valid: boolean
  error?: string
}

export interface FileInfo {
  name: string
  size: string
  type: string
}

export class FileHandler {
  private readonly maxFileSize = 10 * 1024 * 1024 // 10MB
  private readonly allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 
    'image/bmp', 'image/tiff', 'image/avif', 'image/svg+xml', 'image/x-icon'
  ]

  validateImageFile(file: File): FileValidation {
    if (!this.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Please select a valid image file (JPEG, PNG, WebP, GIF, BMP, TIFF)'
      }
    }

    if (file.size > this.maxFileSize) {
      return {
        valid: false,
        error: 'File size must be less than 10MB'
      }
    }

    return { valid: true }
  }

  async loadImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string)
        } else {
          reject(new Error('Failed to read file'))
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  getFileInfo(file: File): FileInfo {
    return {
      name: file.name,
      size: this.formatFileSize(file.size),
      type: file.type.split('/')[1].toUpperCase()
    }
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}