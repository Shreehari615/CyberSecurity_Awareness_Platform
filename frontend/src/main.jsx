import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#e2e8f0',
              border: '1px solid rgba(0, 212, 255, 0.2)',
              borderRadius: '12px',
              fontSize: '0.9rem',
            },
            success: {
              iconTheme: { primary: '#39ff14', secondary: '#0a0e1a' },
            },
            error: {
              iconTheme: { primary: '#ff3366', secondary: '#0a0e1a' },
            },
          }}
        />
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)
