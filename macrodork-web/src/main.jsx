import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

// Marks that scripts run, so reveal-on-scroll may hide elements until they enter the viewport.
document.documentElement.classList.add('js')

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
