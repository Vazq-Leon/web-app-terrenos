import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { TerrenosProvider } from './context/TerrenosContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <TerrenosProvider>
        <App />
      </TerrenosProvider>
    </BrowserRouter>
  </StrictMode>,
)
