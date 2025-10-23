export function initializeApp(): void {
  // Initialize theme
  const savedTheme = localStorage.getItem('solanam-theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDarkMode = savedTheme === 'dark' || (!savedTheme && prefersDark)
  
  document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light')
  
  // Set up global error handling
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error)
  })
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
  })
  
  // Initialize app metadata
  document.title = 'SolanaM Image Studio'
  
  // Add viewport meta tag if not present
  if (!document.querySelector('meta[name="viewport"]')) {
    const viewport = document.createElement('meta')
    viewport.name = 'viewport'
    viewport.content = 'width=device-width, initial-scale=1.0'
    document.head.appendChild(viewport)
  }
}