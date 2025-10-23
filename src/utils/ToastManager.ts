export class ToastManager {
  private container: HTMLElement | null = null

  constructor() {
    this.createContainer()
  }

  private createContainer(): void {
    this.container = document.createElement('div')
    this.container.id = 'toast-container'
    this.container.style.cssText = `
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 10000;
      pointer-events: none;
    `
    document.body.appendChild(this.container)
  }

  private showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    if (!this.container) return

    const toast = document.createElement('div')
    toast.className = `toast toast-${type}`
    toast.style.cssText = `
      background: var(--bg-primary);
      color: var(--text-primary);
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      border-left: 3px solid ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--error)' : 'var(--accent-primary)'};
      margin-bottom: 8px;
      transform: translateX(400px);
      transition: transform 0.3s ease;
      font-size: 12px;
      max-width: 300px;
      pointer-events: auto;
      border: 1px solid var(--border-primary);
    `
    toast.textContent = message

    this.container.appendChild(toast)

    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)'
    }, 10)

    // Auto remove
    setTimeout(() => {
      toast.style.transform = 'translateX(400px)'
      setTimeout(() => {
        if (this.container && this.container.contains(toast)) {
          this.container.removeChild(toast)
        }
      }, 300)
    }, 3000)
  }

  success(message: string): void {
    this.showToast(message, 'success')
  }

  error(message: string): void {
    this.showToast(message, 'error')
  }

  info(message: string): void {
    this.showToast(message, 'info')
  }
}