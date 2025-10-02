/**
 * File: App.tsx
 * Purpose: Top-level application component. It composes the AirportDashboard page
 *          and applies global layout/styling.
 * How it works:
 *  - Renders the AirportDashboard which contains the map on the left and table on the right
 */
import './App.css'
import {AirportDashboard} from 'pages'

function App() {

  return (
    <AirportDashboard />
  )
}

export default App
