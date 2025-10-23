export interface FilterOptions {
  brightness: number
  contrast: number
  saturation: number
  blur: number
  filter: string
}

export class FilterManager {
  applyFilters(element: HTMLImageElement, options: FilterOptions): void {
    const filters = []
    
    if (options.brightness !== 100) {
      filters.push(`brightness(${options.brightness}%)`)
    }
    
    if (options.contrast !== 100) {
      filters.push(`contrast(${options.contrast}%)`)
    }
    
    if (options.saturation !== 100) {
      filters.push(`saturate(${options.saturation}%)`)
    }
    
    if (options.blur > 0) {
      filters.push(`blur(${options.blur}px)`)
    }
    
    // Apply preset filters
    switch (options.filter) {
      case 'grayscale':
        filters.push('grayscale(100%)')
        break
      case 'sepia':
        filters.push('sepia(100%)')
        break
      case 'vintage':
        filters.push('sepia(50%)', 'contrast(120%)', 'brightness(90%)')
        break
      case 'cool':
        filters.push('hue-rotate(180deg)', 'saturate(120%)')
        break
      case 'warm':
        filters.push('hue-rotate(30deg)', 'saturate(110%)', 'brightness(110%)')
        break
      case 'noir':
        filters.push('grayscale(100%)', 'contrast(150%)', 'brightness(80%)')
        break
      case 'vivid':
        filters.push('saturate(150%)', 'contrast(110%)', 'brightness(105%)')
        break
    }
    
    element.style.filter = filters.join(' ')
  }
}