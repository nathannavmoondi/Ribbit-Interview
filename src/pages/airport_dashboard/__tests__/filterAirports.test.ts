/// <reference types="jest" />
import { filterAirportsByBounds } from '../../../utils/filterAirports';
import { mockAirports } from '../../../data/MockAirports';

const sample = mockAirports.slice(0, 5);

describe('filterAirportsByBounds', () => {

  test('returns all when no bounds', () => {
    expect(filterAirportsByBounds(sample, null).length).toBe(sample.length);
  });

  test('filters by simple bounds', () => {
    const bounds = { north: 42, south: 32, west: -125, east: -110 }; // should include LAX, SFO, maybe others
    const result = filterAirportsByBounds(sample, bounds).map(a => a.code).sort();
    expect(result).toEqual(expect.arrayContaining(['LAX', 'SFO']));
  });

  test('180° longitude line - antimeridian wrap (west > east)', () => {
    // Create artificial airports straddling dateline
    const airports = [
      { id: 'a', code: 'AAA', name: 'A', city: 'X', country: 'Y', coordinates: { latitude: 10, longitude: 170 }, elevation: 0, runways: 1, type: 'regional' },
      { id: 'b', code: 'BBB', name: 'B', city: 'X', country: 'Y', coordinates: { latitude: 10, longitude: -175 }, elevation: 0, runways: 1, type: 'regional' },
      { id: 'c', code: 'CCC', name: 'C', city: 'X', country: 'Y', coordinates: { latitude: 10, longitude: -20 }, elevation: 0, runways: 1, type: 'regional' }
    ];
    const bounds = { north: 20, south: 0, west: 160, east: -170 }; // antimeridian wrapping
    const result = filterAirportsByBounds(airports as any, bounds).map(a => a.code).sort();
    expect(result).toEqual(['AAA', 'BBB']);
  });
});
