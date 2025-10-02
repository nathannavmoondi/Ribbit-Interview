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
import { Overlay } from 'ol';
import 'ol/ol.css';

//our imports
import { type Airport, type MapBounds } from 'types';

//what needs to be passed in to this componentn
interface AirportMapProps {
  airports: Airport[];
  // Part A: notify parent when viewport bounds change (so it can filter the table)
  onBoundsChange?: (bounds: MapBounds) => void;
  // Future parts (selection sync) can reuse this component API
  // selectedAirport?: Airport | null;
  // onAirportSelect?: (airport: Airport | null) => void;
}

export const AirportMap: React.FC<AirportMapProps> = ({
  airports, //destruct
  onBoundsChange,
}) => {

  //all our refs
  const mapRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const vectorSourceRef = useRef<VectorSource | null>(null);
  const overlayRef = useRef<Overlay | null>(null);
  
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
        setHoveredAirport(airport);
        overlay.setPosition(evt.coordinate);
        map.getTargetElement().style.cursor = 'pointer';
      } else {
        setHoveredAirport(null);
        overlay.setPosition(undefined);
        map.getTargetElement().style.cursor = '';
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

  // Update airport markers when airports change
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

  // TODO: Handle external selection changes
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
          backgroundColor: 'white',
          border: '2px solid #333',
          borderRadius: '8px',
          padding: '12px',
          minWidth: '280px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          fontSize: '14px',
          fontFamily: 'Arial, sans-serif',
          zIndex: 1000,
          position: 'absolute',
          pointerEvents: 'none'
        }}
      >
        {hoveredAirport && (
          <div>
            <div style={{ 
              fontWeight: 'bold', 
              fontSize: '16px', 
              marginBottom: '8px',
              color: '#333',
              borderBottom: '1px solid #eee',
              paddingBottom: '4px'
            }}>
              {hoveredAirport.code} - {hoveredAirport.name}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <div>
                <strong>City:</strong> {hoveredAirport.city}
              </div>
              <div>
                <strong>Country:</strong> {hoveredAirport.country}
              </div>
              
              <div>
                <strong>Type:</strong>{' '}
                <span style={{
                  backgroundColor: getTypeColor(hoveredAirport.type),
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  textTransform: 'capitalize'
                }}>
                  {hoveredAirport.type}
                </span>
              </div>
              <div>
                <strong>Runways:</strong> {hoveredAirport.runways}
              </div>
              
              <div>
                <strong>Elevation:</strong> {hoveredAirport.elevation.toLocaleString()} ft
              </div>
              <div>
                <strong>ID:</strong> {hoveredAirport.id}
              </div>
            </div>
            
            <div style={{ 
              marginTop: '8px', 
              fontSize: '12px', 
              color: '#666',
              borderTop: '1px solid #eee',
              paddingTop: '6px'
            }}>
              <div>
                <strong>Coordinates:</strong>
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                Lat: {hoveredAirport.coordinates.latitude.toFixed(4)}°<br/>
                Lon: {hoveredAirport.coordinates.longitude.toFixed(4)}°
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

//note: i like to put my helper functiosn at top but eveyrone milease varies (these methods are
// called in useeffect, AFTER function is rendered.  Normally arrow funnctions to const are not hoisted).

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

// TODO: Implement selected airport style
// const createSelectedAirportStyle = (feature: Feature) => { ... };