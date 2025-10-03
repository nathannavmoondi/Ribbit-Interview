/**
 * File: AirportDashboard.tsx
 * Purpose: Main dashboard view containing the map (left) and table (right).
 * How it works:
 *  - Holds map viewport bounds in state and uses them to filter airports
 *  - Passes the full airport list to the map and the filtered list to the table
 *  - Prepares for future selection syncing by centralizing derived state here
 */
import { useEffect, useMemo, useState } from 'react';
import planeImg from 'assets/plane.png';
import { AirportMap } from './map/AirportMap';
import AirportList from './AirportList';
import { type MapBounds } from 'types';
import { SelectionProvider, useSelection } from '../../context/SelectionContext';

// Inner component so we can consume context (airports) while still providing provider at top level
function DashboardInner() {
  // In a real app, airports might be fetched. For this exercise we keep them constant
  const { airports } = useSelection();  
  const [bounds, setBounds] = useState<MapBounds | null>(null);

  // Compute airports within current map bounds
  // refresher: usememo caches the result of a computation (here, filtering airports)
  // and only recomputes it when its dependencies change (here, airports or bounds).
  // This avoids unnecessary recalculations on every render, improving performance.
  const visibleAirports = useMemo(() => {
    if (!bounds) return airports;
    const { north, south, east, west } = bounds;
    return airports.filter((a) => {
      const { latitude: lat, longitude: lon } = a.coordinates;
      const inLat = lat >= south && lat <= north;
      // Handle world-wrap: if west <= east normal case, otherwise bounds crosses antimeridian
      const inLon = west <= east ? (lon >= west && lon <= east) : (lon >= west || lon <= east);
      return inLat && inLon;
    });
  }, [airports, bounds]);

  // Keep the browser tab title in sync with the visible heading
  useEffect(() => {
    document.title = 'Ribbit Dashboard (Nathan Moondi DEMO)';
  }, []);

  // Use branded plane image from assets

  return (
      <div style={{ padding: '16px', position: 'relative', zIndex: 1 }}>
        {/* Fixed decorative airplane at bottom-left of the viewport */}
        <div style={{
          position: 'fixed',
          left: 8,
          bottom: 8,
          /* Twice as big as before, with clamps to avoid overflow on very small screens */
          width: 'min(72vh, 45vw)',
          height: 'calc(min(72vh, 45vw) * 0.6)',
          backgroundImage: `url(${planeImg})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'left bottom',
          backgroundSize: 'contain',
          opacity: 0.28,
          mixBlendMode: 'multiply',
          filter: 'grayscale(100%) contrast(1.02) brightness(1.02)',
          pointerEvents: 'none',
          zIndex: 3
        }} />
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 14,
          padding: 18,
          background: 'linear-gradient(145deg, #163a6b 0%, #122e58 55%, #102748 100%)',
          boxShadow: '0 12px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)',
          border: '1px solid rgba(30, 80, 160, 0.45)'
        }}>
          {/* Header inside the panel */}
          <h1 style={{
            margin: '2px 4px 16px',
            fontSize: 28,
            letterSpacing: 0.4,
            color: '#eef1ff',
            textShadow: '0 1px 0 rgba(0,0,0,0.35)'
          }}>
            Ribbit Dashboard (Nathan Moondi DEMO)
          </h1>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
            <div>
              {/*  When map changes (pan/zoom) call onboundchange handler, recalculate visible*/}
              <AirportMap airports={airports} onBoundsChange={setBounds} />
            </div>
            <div>
              {/* airportmap component above changes bounds, recalculate visible airports in handler and then pass it in! */}
              <AirportList airports={visibleAirports} /> 
            </div>
          </div>
        </div>
      </div>
  );
}

export function AirportDashboard() {
  return (
    <SelectionProvider>
      <DashboardInner />
    </SelectionProvider>
  );
}