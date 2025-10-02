/**
 * File: AirportDashboard.tsx
 * Purpose: Main dashboard view containing the map (left) and table (right).
 * How it works:
 *  - Holds map viewport bounds in state and uses them to filter airports
 *  - Passes the full airport list to the map and the filtered list to the table
 *  - Prepares for future selection syncing by centralizing derived state here
 */
import { useEffect, useMemo, useState } from 'react';
import { AirportMap } from './map/AirportMap';
import AirportList from './AirportList';
import { mockAirports } from 'data/MockAirports';
import { type MapBounds, type Airport } from 'types';
import { SelectionProvider } from '../../context/SelectionContext';

export function AirportDashboard() {
  // In a real app, airports might be fetched. For this exercise we keep them constant
  const [airports] = useState<Airport[]>(mockAirports);
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

  // Detailed airplane silhouette as a decorative background (data URL encoded)
  // Stylized jet with fuselage, wings, and tail for a clearer plane look
  const planeSvg = `
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'>
    <g fill='white'>
      <!-- Fuselage -->
      <path d='M40 248 L300 248 Q360 246 420 232 Q452 224 468 224 Q492 224 500 236 Q504 242 504 256 Q504 270 500 276 Q492 288 468 288 Q452 288 420 280 Q360 266 300 264 L40 264 Q28 264 24 260 Q20 256 24 252 Q28 248 40 248 Z'/>
      <!-- Main wings -->
      <path d='M176 200 L360 240 L360 272 L176 312 Q168 314 164 312 Q160 310 160 304 L160 208 Q160 202 164 200 Q168 198 176 200 Z'/>
      <!-- Tail boom -->
      <path d='M64 232 L120 232 L120 280 L64 280 Q56 280 52 276 Q48 272 48 256 Q48 240 52 236 Q56 232 64 232 Z'/>
      <!-- Tail wings -->
      <path d='M72 212 L152 240 L152 272 L72 300 Q64 302 60 300 Q56 298 56 292 L56 220 Q56 214 60 212 Q64 210 72 212 Z'/>
      <!-- Cockpit cone -->
      <path d='M420 232 Q448 244 468 256 Q448 268 420 280 Q426 266 426 256 Q426 246 420 232 Z'/>
    </g>
  </svg>`;
  const planeUrl = `url("data:image/svg+xml,${encodeURIComponent(planeSvg)}")`;

  return (
    <SelectionProvider>
      <div style={{ padding: '20px' }}>
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 14,
          padding: 22,
          background: 'linear-gradient(145deg, #163a6b 0%, #122e58 55%, #102748 100%)',
          boxShadow: '0 12px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)',
          border: '1px solid rgba(30, 80, 160, 0.45)'
        }}>
          {/* Decorative airplane overlay */}
          <div style={{
            position: 'absolute',
            bottom: -28,
            right: -28,
            width: 680,
            height: 460,
            backgroundImage: planeUrl as unknown as string,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right bottom',
            backgroundSize: 'contain',
            opacity: 0.26,
            mixBlendMode: 'soft-light',
            filter: 'grayscale(100%)',
            transform: 'rotate(-6deg)',
            transformOrigin: 'right bottom',
            pointerEvents: 'none'
          }} />

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
    </SelectionProvider>
  );
}