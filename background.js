// Background script for Solanam Image Processor
// Handles context menu and cross-tab communication

class SolanamBackground {
  constructor() {
    this.init()
  }

  init() {
    // Create context menu when extension is installed
    chrome.runtime.onInstalled.addListener(() => {
      this.createContextMenus()
    })

    // Handle context menu clicks
    chrome.contextMenus.onClicked.addListener((info, tab) => {
      this.handleContextMenuClick(info, tab)
    })

    // Handle messages from content script and popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse)
      return true // Keep message channel open
    })
  }

  createContextMenus() {
    // Remove existing menus first
    chrome.contextMenus.removeAll(() => {
      // Main SolanaM menu
      chrome.contextMenus.create({
        id: 'solanam-main',
        title: 'SolanaM Image Studio',
        contexts: ['image'],
        documentUrlPatterns: ['http://*/*', 'https://*/*']
      })

      // Import submenu
      chrome.contextMenus.create({
        id: 'solanam-import',
        parentId: 'solanam-main',
        title: '📥 Import to Studio',
        contexts: ['image']
      })

      // Export submenu
      chrome.contextMenus.create({
        id: 'solanam-export',
        parentId: 'solanam-main',
        title: '📤 Quick Export',
        contexts: ['image']
      })

      // Export format options
      const formats = [
        { id: 'export-jpeg', title: 'Export as JPEG', format: 'jpeg' },
        { id: 'export-png', title: 'Export as PNG', format: 'png' },
        { id: 'export-webp', title: 'Export as WebP', format: 'webp' },
        { id: 'export-avif', title: 'Export as AVIF', format: 'avif' }
      ]

      formats.forEach(format => {
        chrome.contextMenus.create({
          id: format.id,
          parentId: 'solanam-export',
          title: format.title,
          contexts: ['image']
        })
      })

      // Separator
      chrome.contextMenus.create({
        id: 'separator',
        parentId: 'solanam-main',
        type: 'separator',
        contexts: ['image']
      })

      // About SolanaM
      chrome.contextMenus.create({
        id: 'solanam-about',
        parentId: 'solanam-main',
        title: '🌟 About SolanaM Ecosystem',
        contexts: ['image']
      })
    })
  }

  async handleContextMenuClick(info, tab) {
    try {
      if (info.menuItemId === 'solanam-import') {
        await this.importImage(info, tab)
      } else if (info.menuItemId.startsWith('export-')) {
        const format = info.menuItemId.replace('export-', '')
        await this.exportImage(info, tab, format)
      } else if (info.menuItemId === 'solanam-about') {
        await this.showAbout()
      }
    } catch (error) {
      console.error('Context menu error:', error)
    }
  }

  async importImage(info, tab) {
    try {
      // Send message to content script to process the image
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'processImageFromContext',
        imageUrl: info.srcUrl
      })

      if (response && response.success) {
        // Store the image data for the popup to access
        await chrome.storage.local.set({
          'contextImage': response.imageData,
          'contextImageTimestamp': Date.now()
        })

        // Show notification
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon-48.png',
          title: 'SolanaM Image Studio',
          message: 'Image imported successfully! Open the extension to edit.'
        })
      }
    } catch (error) {
      console.error('Import error:', error)
    }
  }

  async exportImage(info, tab, format) {
    try {
      // Send message to content script to export the image
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'exportImageDirect',
        imageUrl: info.srcUrl,
        format: format
      })

      if (response && response.success) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon-48.png',
          title: 'SolanaM Image Studio',
          message: `Image exported as ${format.toUpperCase()} successfully!`
        })
      }
    } catch (error) {
      console.error('Export error:', error)
    }
  }

  async showAbout() {
    // Open SolanaM ecosystem page or show info
    chrome.tabs.create({
      url: 'https://solanam.com' // Replace with actual SolanaM ecosystem URL
    })
  }

  handleMessage(message, sender, sendResponse) {
    switch (message.action) {
      case 'getContextImage':
        // Popup requesting context image data
        chrome.storage.local.get(['contextImage', 'contextImageTimestamp'])
          .then(result => {
            const now = Date.now()
            const timestamp = result.contextImageTimestamp || 0
            
            // Only return image if it's recent (within 30 seconds)
            if (result.contextImage && (now - timestamp) < 30000) {
              sendResponse({ 
                success: true, 
                imageData: result.contextImage 
              })
              
              // Clear the stored image after use
              chrome.storage.local.remove(['contextImage', 'contextImageTimestamp'])
            } else {
              sendResponse({ success: false, error: 'No recent context image' })
            }
          })
          .catch(error => {
            sendResponse({ success: false, error: error.message })
          })
        break

      case 'openSettings':
        // Handle settings requests
        sendResponse({ success: true })
        break

      default:
        sendResponse({ success: false, error: 'Unknown action' })
    }
  }
}

// Initialize the background script
new SolanamBackground()