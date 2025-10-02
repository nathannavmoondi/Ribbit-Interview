High-level steps

Add AirportList: a simple table that shows code, name, city, type, elevation, runways.
Teach AirportMap to report viewport bounds to the parent whenever you pan/zoom.
In AirportDashboard, maintain bounds state, compute visibleAirports with a fast filter, render the table from visibleAirports.
What I changed

AirportMap: report viewport bounds
File: AirportMap.tsx
Added onBoundsChange?: (bounds: MapBounds) => void to props.
On map init and on moveend, calculate the current map extent and convert it to WGS84 lon/lat bounds:
transformExtent(extent, 'EPSG:3857', 'EPSG:4326') → [west, south, east, north]
Call onBoundsChange({ west, south, east, north }).
Imported MapBounds type from types so it’s strongly typed.
AirportList: the table view
File: AirportList.tsx (new)
Simple, readable HTML table with sticky header and scroll for long lists.
Shows key fields: code, name, city, type (capitalized), elevation (with thousands commas), runways.
AirportDashboard: state + filtering + rendering
File: AirportDashboard.tsx
Holds:
airports: base data (from mockAirports).
bounds: MapBounds | null.
visibleAirports: memoized filtered array based on bounds.
Bounds filter logic:
Lat check: lat between south and north.
Lon check: supports normal case (west <= east) and anti-meridian wrap (west > east) with (lon >= west || lon <= east).
Renders:
<AirportMap airports={airports} onBoundsChange={setBounds} />
<AirportList airports={visibleAirports} />
Verification

Typecheck/build: PASS
npm run build completed successfully.
Manual: When you pan/zoom the map, the list updates to show only airports currently in view.
Simple explanation for you

The map knows where you’re looking. Every time you pan or zoom, it tells the parent “here are the edges of the current view” (north, south, east, west).
The dashboard keeps that box in state and filters the airport array to only those whose latitude and longitude fall inside that box.
The table shows that filtered list, so you always see “what’s on the map.”