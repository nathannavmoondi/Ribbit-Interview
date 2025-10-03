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
import { filterAirportsByBounds } from '../../utils/filterAirports';

// Inner component so we can call useSelection and outer gets context provider at top level. Think of it as 2 files.
function DashboardInner() {
  // In a real app, airports might be fetched. For this exercise we keep them constant
  const { airports } = useSelection();  
  const [bounds, setBounds] = useState<MapBounds | null>(null);

  // Compute airports within current map bounds
  // refresher: usememo caches the result of a computation (here, filtering airports)
  // and only recomputes it when its dependencies change (here, airports or bounds).
  // This avoids unnecessary recalculations on every render, improving performance.
  const visibleAirports = useMemo(() => filterAirportsByBounds(airports, bounds), [airports, bounds]);

  useEffect(() => {
    document.title = 'Ribbit Dashboard (Nathan Moondi DEMO)';
  }, []);

  return (
      <div style={{ padding: '16px', position: 'relative', zIndex: 1 }}>
        {/* Fixed decorative airplane at bottom-left of the viewport */}
        <div style={{
          position: 'fixed',
          left: 4,
          bottom: -12, // push slightly below viewport edge for a more grounded feel
          /* Reduced overall footprint by ~20% */
          width: 'min(58vh, 36vw)',
          height: 'calc(min(58vh, 36vw) * 0.6)',
          backgroundImage: `url(${planeImg})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'left bottom',
          backgroundSize: 'contain',
          opacity: 0.25,
          mixBlendMode: 'multiply',
          filter: 'grayscale(100%) contrast(1.02) brightness(1.02)',
          pointerEvents: 'none',
          zIndex: 0, // lower than wrapper (zIndex:1) so map & panel cover it
          transition: 'opacity 300ms ease'
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

