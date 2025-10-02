/**
 * File: main.tsx
 * Purpose: Application entry point. Creates the React root and renders <App /> into
 *          the #root element defined in index.html. This is where the Vite + React
 *          app boots.
 * How it works:
 *  - Imports global styles (index.css) and the App component
 *  - Uses React 18's createRoot to mount the component tree
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
