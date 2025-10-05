/**
 * File: AirportMap.tsx
 * Purpose: Map component using OpenLayers to render airports as vector point features on
 *          top of an OSM tile basemap.
 * How it works:
 *  - Builds an OL Map with a TileLayer (OSM) and a VectorLayer for airport markers
 *  - Converts **airport coordinates** from lon/lat to **map projection** using fromLonLat
 *  - Styles markers by airport type and shows IATA code labels
 *  - Emits onBoundsChange(bounds) when the map view changes so the parent can filter the table (pen/zoom)
 */
import React, { useEffect, useRef, useState } from 'react';

//all the OpenLayers imports
import { Map, View } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { fromLonLat, transformExtent } from 'ol/proj';
import { Style, Circle, Fill, Stroke, Text } from 'ol/style';
import Icon from 'ol/style/Icon';
import { Overlay } from 'ol';
import 'ol/ol.css';

//our imports
import { type Airport, type MapBounds } from 'types';
import { useSelection } from 'context/SelectionContext';

//what needs to be passed in to this componentn
interface AirportMapProps {
  airports: Airport[];
  // Part A: notify parent when viewport bounds change (so it can filter the table)
  onBoundsChange?: (bounds: MapBounds) => void;  
}

export const AirportMap: React.FC<AirportMapProps> = ({
  airports, //destruct
  onBoundsChange,
}) => {
  const { selectedAirportId, setSelectedAirportId } = useSelection();

  //all our refs
  const mapRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const vectorSourceRef = useRef<VectorSource | null>(null);
  const pinSourceRef = useRef<VectorSource | null>(null);
  const overlayRef = useRef<Overlay | null>(null);
  const lastPointerPixelRef = useRef<number[] | null>(null);
  const lastPointerCoordinateRef = useRef<any | null>(null);
  
  const [hoveredAirport, setHoveredAirport] = useState<Airport | null>(null);

  // Initialize OpenLayers map
  useEffect(() => {

    //note: why all this code in useffect?
    //let's wait until both dom elements exist.  Good citizens.
    //also event handlers are side effects. we always put them in useffect.
    //and every render don't want to recreate the map, handlers, etc. etc.  

    if (!mapRef.current || !popupRef.current) return;

    // Create vector source for airport markers
    const vectorSource = new VectorSource();
    vectorSourceRef.current = vectorSource;

    // Create vector layer for airports
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: createAirportStyle,
    });

    // Create vector layer for the selected pin (drawn above markers)
    const pinSource = new VectorSource();
    pinSourceRef.current = pinSource;
    const pinLayer = new VectorLayer({
      source: pinSource,
      zIndex: 1000, //on top of everything
    });

    // Create overlay for hover popup
    const overlay = new Overlay({
      element: popupRef.current,
      autoPan: false,
      offset: [0, -15],
      positioning: 'bottom-center',
    });
    overlayRef.current = overlay;

    // Create map instance
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vectorLayer,
        pinLayer,
      ],
      view: new View({
        center: fromLonLat([-98.35, 39.5]), // Center of US
        zoom: 4,
      }),
      overlays: [overlay],
    });

  // Handle mouse hover events
    map.on('pointermove', (evt) => {
      const pixel = map.getEventPixel(evt.originalEvent);
      const feature = map.forEachFeatureAtPixel(pixel, (feature) => feature, {
        layerFilter: (layer) => layer === vectorLayer,
      });

      if (feature) {
        const airport = feature.get('airport') as Airport;
        lastPointerPixelRef.current = pixel;
        lastPointerCoordinateRef.current = evt.coordinate;
        setHoveredAirport(airport);
        // Position overlay now, then lift if necessary using current rendered content frame
        requestAnimationFrame(() => {
          if (!overlayRef.current || !mapInstanceRef.current || !popupRef.current) return;
          const overlay = overlayRef.current;
          const mapI = mapInstanceRef.current;
          const popupEl = popupRef.current;
          overlay.setPosition(evt.coordinate);
          overlay.setPositioning('bottom-center');
          overlay.setOffset([0, -18]);
          const mapEl = mapI.getTargetElement();
          if (!mapEl) return;
          const mapHeight = mapEl.clientHeight;
            const popupHeight = popupEl.offsetHeight || 0;
          const margin = 10;
          const spaceBelow = mapHeight - pixel[1];
          if (spaceBelow < popupHeight + margin) {
            const liftPx = (popupHeight + margin) - spaceBelow;
            const adjustedPixel: [number, number] = [pixel[0], pixel[1] - liftPx];
            const adjustedCoord = mapI.getCoordinateFromPixel(adjustedPixel);
            if (adjustedCoord) {
              overlay.setPosition(adjustedCoord);
            }
          }
        });
        map.getTargetElement().style.cursor = 'pointer';
      } else {
        setHoveredAirport(null);
        overlay.setPosition(undefined);
        map.getTargetElement().style.cursor = '';
      }
    });

    // Handle click selection
    map.on('singleclick', (evt) => {
      const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
      if (feature) {
        const airport = feature.get('airport') as Airport;
        setSelectedAirportId((prev) => (prev === airport.id ? null : airport.id));
      }
    });

    // Handle mouse leave map
    map.getViewport().addEventListener('mouseleave', () => {
      setHoveredAirport(null);
      overlay.setPosition(undefined);
      map.getTargetElement().style.cursor = '';
    });

    mapInstanceRef.current = map;

    // Report bounds to parent (initial and on move)
    const reportBounds = () => {
      if (!onBoundsChange || !mapInstanceRef.current) return;
      const m = mapInstanceRef.current;
      const extent = m.getView().calculateExtent(m.getSize());
      // Transform from Web Mercator to WGS84 (lon/lat)
      const [west, south, east, north] = transformExtent(extent, 'EPSG:3857', 'EPSG:4326');
      onBoundsChange({ west, south, east, north });
    };

    // Initial bounds
    reportBounds();
    // Update on pan/zoom end
    map.on('moveend', reportBounds);

    // TODO: Add selection interaction
    // TODO: Add bounds change handling

    return () => {
      map.setTarget(undefined);
    };
  }, []);

  // Update airport markers when airports change (also fires when a name edit causes new array reference in context)
  useEffect(() => {
    if (!vectorSourceRef.current) return;

    const vectorSource = vectorSourceRef.current;
    vectorSource.clear();

    airports.forEach((airport) => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([
          airport.coordinates.longitude,
          airport.coordinates.latitude
        ])),
        airport: airport,
      });

      feature.setId(airport.id);
      vectorSource.addFeature(feature);
    });
  }, [airports]);

  // Update red pin feature whenever selection changes
  useEffect(() => {
    const pinSource = pinSourceRef.current;
    if (!pinSource) return;
    pinSource.clear();
    if (!selectedAirportId) return;
    const selected = airports.find(a => a.id === selectedAirportId);
    if (!selected) return;
    const feature = new Feature({
      geometry: new Point(fromLonLat([
        selected.coordinates.longitude,
        selected.coordinates.latitude
      ])),
    });
    feature.setStyle(createRedPinStyle());
    pinSource.addFeature(feature);
  }, [selectedAirportId, airports]);

  // Handle external selection changes (update feature styles)
  useEffect(() => {
    const vectorSource = vectorSourceRef.current;
    if (!vectorSource) return;
    vectorSource.getFeatures().forEach((f) => {
      const airport = f.get('airport') as Airport | undefined;
      if (!airport) return;
      const isSelected = airport.id === selectedAirportId;

      if (isSelected) {
        // Selected: larger dot with dual stroke (gold outer + white inner) and bolder label
        f.setStyle(new Style({
          image: new Circle({
            radius: 11,
            fill: new Fill({ color: getTypeColor(airport.type) }),
            stroke: new Stroke({ color: '#FFD700', width: 4 }),
          }),
          text: new Text({
            text: airport.code,
            font: 'bold 13px sans-serif',
            fill: new Fill({ color: '#000' }),
            stroke: new Stroke({ color: '#fff', width: 3 }),
            offsetY: -22,
          }),
        }));
      } else {
        // Default style
        f.setStyle(createAirportStyle(f));
      }
    });
  }, [selectedAirportId]);

  // Removed post-render lift effect; handled per pointermove with rAF for immediacy
  // TODO: Implement zoom/bounds filtering logic

  //all our useeffects are done.  Now we render the map and popup
  return (
    <div style={{ position: 'relative' }}>
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '500px',
          border: '1px solid #ccc',
          borderRadius: '4px'
        }} 
      />
      
      {/* Hover popup */}
      <div
        ref={popupRef}
        style={{
          display: hoveredAirport ? 'block' : 'none',
          background: 'linear-gradient(145deg,#1e2533,#151b26 65%, #10151d)',
          border: '1px solid rgba(120,160,255,0.35)',
          borderRadius: 14,
            padding: '14px 16px 16px',
          minWidth: 300,
          boxShadow: '0 8px 24px -4px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05)',
          fontSize: 13,
          fontFamily: 'system-ui, Arial, sans-serif',
          zIndex: 1000,
          position: 'absolute',
          pointerEvents: 'none',
          color: '#e8edf5',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)'
        }}
      >
        {hoveredAirport && (
          <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
              <div style={{
                fontWeight: 600,
                fontSize: 18,
                letterSpacing: 0.5,
                textShadow: '0 1px 2px rgba(0,0,0,0.4)'
              }}>
                {hoveredAirport.code}
              </div>
              <div style={{
                fontSize: 13,
                opacity: 0.85,
                maxWidth: 180,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }} title={hoveredAirport.name}>
                {hoveredAirport.name}
              </div>
              {hoveredAirport.hasStarbucks && (
                <span style={{
                  marginLeft: 'auto',
                  background: 'linear-gradient(90deg,#32d676,#25b3d6)',
                  color: '#06240f',
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '3px 6px 2px',
                  borderRadius: 20,
                  letterSpacing: 0.5,
                  boxShadow: '0 0 0 1px rgba(255,255,255,0.2),0 2px 4px rgba(0,0,0,0.4)'
                }}>STARBUCKS</span>
              )}
            </div>
            <div style={{ height: 1, background: 'linear-gradient(90deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))', margin: '4px 0 10px' }} />

            {/* Info grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 8, lineHeight: 1.25 }}>
              <Info label="City" value={hoveredAirport.city} />
              <Info label="Country" value={hoveredAirport.country} />
              <Info label="Type" value={
                <span style={{
                  backgroundColor: getTypeColor(hoveredAirport.type),
                  color: '#fff',
                  padding: '2px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  textTransform: 'capitalize',
                  fontWeight: 600,
                  boxShadow: '0 0 0 1px rgba(255,255,255,0.15)'
                }}>{hoveredAirport.type}</span>
              } />
              <Info label="Runways" value={hoveredAirport.runways} />
              <Info label="Elevation" value={`${hoveredAirport.elevation.toLocaleString()} ft`} />
              <Info label="ID" value={hoveredAirport.id} />
              <Info label="Starbucks" value={hoveredAirport.hasStarbucks ? 'Yes' : 'No'} />
            </div>

            {/* Coordinates footer */}
            <div style={{
              marginTop: 12,
              paddingTop: 10,
              borderTop: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 11,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              opacity: 0.9
            }}>
              <div>Lat: {hoveredAirport.coordinates.latitude.toFixed(4)}°</div>
              <div>Lon: {hoveredAirport.coordinates.longitude.toFixed(4)}°</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

//note: i like to put my helper functiosn at top but eveyrone milease varies (these methods are
// called in useeffect, AFTER function is rendered.  Normally arrow funnctions to const are not hoisted).

// Small presentational component for popup key/value lines
const Info: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8, opacity: 0.55 }}>{label}</span>
    <span style={{ fontWeight: 500 }}>{value}</span>
  </div>
);

// Helper function to get color by airport type
const getTypeColor = (type: Airport['type']) => {
  switch (type) {
    case 'international': return '#4CAF50';
    case 'domestic': return '#2196F3';
    case 'regional': return '#FF9800';
    case 'private': return '#9C27B0';
    default: return '#757575';
  }
};

// Style function for airport markers
const createAirportStyle = (feature: any) => {
  const airport = feature.get('airport') as Airport;
  
  const getColorByType = (type: Airport['type']) => {
    switch (type) {
      case 'international': return '#4CAF50';
      case 'domestic': return '#2196F3';
      case 'regional': return '#FF9800';
      case 'private': return '#9C27B0';
      default: return '#757575';
    }
  };

  return new Style({
    image: new Circle({
      radius: 8,
      fill: new Fill({
        color: getColorByType(airport.type),
      }),
      stroke: new Stroke({
        color: '#fff',
        width: 2,
      }),
    }),
    text: new Text({
      text: airport.code,
      font: '12px sans-serif',
      fill: new Fill({ color: '#000' }),
      stroke: new Stroke({ color: '#fff', width: 2 }),
      offsetY: -20,
    }),
  });
};

// Create a Google-style red pin using an inline SVG Icon
function createRedPinStyle(): Style {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'>
    <path d='M12 2c-3.3 0-6 2.6-6 5.9 0 4.4 6 12.1 6 12.1s6-7.7 6-12.1C18 4.6 15.3 2 12 2z' fill='#E53935' stroke='#B71C1C' stroke-width='1.2'/>
    <circle cx='12' cy='8.5' r='2.6' fill='#ffffff'/>
  </svg>`;
  const src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  return new Style({
    image: new Icon({
      src,
      anchor: [0.5, 1],
    }),
  });
}

// TODO: Implement selected airport style
// const createSelectedAirportStyle = (feature: Feature) => { ... };