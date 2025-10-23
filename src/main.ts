import './style.css'
import { ImageProcessor } from './components/ImageProcessor.ts'
import { initializeApp } from './utils/app.js'

// Initialize the application
initializeApp()

// Create and mount the image processor component
const app = document.querySelector<HTMLDivElement>('#app')!
const imageProcessor = new ImageProcessor()
app.appendChild(imageProcessor.render())