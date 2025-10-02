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

  return (
    <SelectionProvider>
      <div style={{ padding: '20px' }}>
        <div style={{
          background: 'linear-gradient(180deg, rgba(100,108,255,0.08), rgba(100,108,255,0.02))',
          border: '1px solid rgba(100,108,255,0.35)',
          borderRadius: 10,
          padding: '12px 14px',
          marginBottom: 16,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: 24,
            letterSpacing: 0.3,
            color: '#eaeaff',
            textShadow: '0 1px 0 rgba(0,0,0,0.3)'
          }}>
            Ribbit Dashboard (Nathan Moondi DEMO)
          </h1>
        </div>
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
    </SelectionProvider>
  );
}