import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Apply saved theme before first render to avoid flash
const saved = JSON.parse(localStorage.getItem('theme-storage') || '{}')
const theme = saved?.state?.theme || 'dark'
document.documentElement.classList.toggle('light', theme === 'light')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
