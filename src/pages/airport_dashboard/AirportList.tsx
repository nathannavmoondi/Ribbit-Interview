/**
 * File: AirportList.tsx
 * Purpose: Plain HTML table that displays a list of airports and their attributes.
 * How it works:
 *  - Receives airports as props and renders a scrollable table with sticky header
 *  - Designed to be fed by the dashboard's filtered (visible) airports
 */
import React, { useState } from 'react';
import { type Airport } from 'types';
import { useSelection } from '../../context/SelectionContext';

interface AirportListProps {
  airports: Airport[];
}

//we get passed in visible airports form the dashboard. Which is reclaculated when map bounds change
export const AirportList: React.FC<AirportListProps> = ({ airports }) => {
  const [hoverId, setHoverId] = useState<string | null>(null);
  //grab the selected state and method from context.  auto updated when context changed (and our component rerenders)
  const { selectedAirportId, setSelectedAirportId } = useSelection();
  return (
    <div style={{ border: '1px solid #2b2b2b', padding: '12px', borderRadius: 6, height: 500, overflow: 'auto', background: 'rgba(0,0,0,0.15)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr>
            <th style={th}>Code</th>
            <th style={th}>Name</th>
            <th style={th}>City</th>
            <th style={th}>Type</th>
            <th style={th}>Elevation (ft)</th>
            <th style={th}>Runways</th>
          </tr>
        </thead>
        <tbody>
          {airports.map((a, idx) => {
            const selected = a.id === selectedAirportId;
            const hovered = hoverId === a.id;
            // Stronger zebra contrast for dark theme
            const zebra = idx % 2 === 0 ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.04)';
            const baseStyle: React.CSSProperties = { background: zebra, cursor: 'pointer', transition: 'background 120ms ease, box-shadow 120ms ease' };
            const hoverStyle: React.CSSProperties = hovered && !selected ? { background: 'rgba(100,108,255,0.22)', boxShadow: 'inset 0 0 0 1px rgba(100,108,255,0.25)' } : {};
            const selectedStyle: React.CSSProperties = selected ? { background: 'rgba(100,108,255,0.28)', outline: '2px solid #646cff', boxShadow: 'inset 0 0 0 2px rgba(100,108,255,0.25)', fontWeight: 600, borderLeft: '4px solid #646cff' } : {};
            return (
              <tr
                key={a.id}
                onClick={() => setSelectedAirportId(selected ? null : a.id)} //call context
                onMouseEnter={() => setHoverId(a.id)}
                onMouseLeave={() => setHoverId((prev) => (prev === a.id ? null : prev))}
                style={{ ...baseStyle, ...hoverStyle, ...selectedStyle }}
              >
                <td style={tdCode}>{a.code}</td>
                <td style={td}>{a.name}</td>
                <td style={td}>{a.city}</td>
                <td style={tdCap}>{a.type}</td>
                <td style={tdNum}>{a.elevation.toLocaleString()}</td>
                <td style={tdNum}>{a.runways}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {airports.length === 0 && (
        <div style={{ color: '#888', padding: '8px 0' }}>No airports in view</div>
      )}
    </div>
  );
};

// nice way of putting all this css here instead of a file, inline or styled components
const th: React.CSSProperties = { textAlign: 'left', padding: '10px 8px', borderBottom: '1px solid #2e2e2e', position: 'sticky', top: 0, background: '#0f1117', zIndex: 1, boxShadow: 'inset 0 -1px 0 #2e2e2e' };
const td: React.CSSProperties = { padding: '10px 8px', borderBottom: '1px solid #2f2f2f' };
const tdCap: React.CSSProperties = { ...td, textTransform: 'capitalize' };
const tdNum: React.CSSProperties = { ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' };
const tdCode: React.CSSProperties = { ...td, fontWeight: 700, fontFamily: 'monospace' };

export default AirportList;
