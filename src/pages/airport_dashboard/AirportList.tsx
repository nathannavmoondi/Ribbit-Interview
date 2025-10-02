/**
 * File: AirportList.tsx
 * Purpose: Plain HTML table that displays a list of airports and their attributes.
 * How it works:
 *  - Receives airports as props and renders a scrollable table with sticky header
 *  - Designed to be fed by the dashboard's filtered (visible) airports
 */
import React from 'react';
import { type Airport } from 'types';

interface AirportListProps {
  airports: Airport[];
}

export const AirportList: React.FC<AirportListProps> = ({ airports }) => {
  return (
    <div style={{ border: '1px solid #ccc', padding: '12px', borderRadius: 4, height: 500, overflow: 'auto' }}>
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
          {airports.map((a) => (
            <tr key={a.id}>
              <td style={td}>{a.code}</td>
              <td style={td}>{a.name}</td>
              <td style={td}>{a.city}</td>
              <td style={tdCap}>{a.type}</td>
              <td style={tdNum}>{a.elevation.toLocaleString()}</td>
              <td style={tdNum}>{a.runways}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {airports.length === 0 && (
        <div style={{ color: '#888', padding: '8px 0' }}>No airports in view</div>
      )}
    </div>
  );
};

const th: React.CSSProperties = { textAlign: 'left', padding: '8px 6px', borderBottom: '1px solid #ddd', position: 'sticky', top: 0, background: '#1f1f1f' };
const td: React.CSSProperties = { padding: '8px 6px', borderBottom: '1px solid #2a2a2a' };
const tdCap: React.CSSProperties = { ...td, textTransform: 'capitalize' };
const tdNum: React.CSSProperties = { ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' };

export default AirportList;
