import { RadioStation } from '../types';

const API_BASE = 'https://de1.api.radio-browser.info/json/stations';

// Helper to filter playable stations (HTTPS is required for most modern web deployments)
const filterPlayable = (stations: any[]): RadioStation[] => {
  if (!Array.isArray(stations)) return [];
  return stations.filter((s: any) => 
    s.url_resolved && 
    s.url_resolved.startsWith('https') && 
    s.geo_lat !== null && 
    s.geo_long !== null
  );
};

// Fetch top stations globally
export const getTopStations = async (limit: number = 200): Promise<RadioStation[]> => {
  try {
    const response = await fetch(`${API_BASE}/topclick/${limit}`);
    if (!response.ok) throw new Error('Failed to fetch top stations');
    const data = await response.json();
    return filterPlayable(data);
  } catch (error) {
    console.error("Error fetching top stations:", error);
    return [];
  }
};

// Fetch stations by Country Code (e.g., CN, US, JP)
export const getStationsByCountryCode = async (code: string, limit: number = 50): Promise<RadioStation[]> => {
  try {
    const response = await fetch(`${API_BASE}/bycountrycode/${code}?limit=${limit}&order=clickcount&reverse=true&is_https=true&hidebroken=true`);
    if (!response.ok) throw new Error(`Failed to fetch stations for ${code}`);
    const data = await response.json();
    return filterPlayable(data);
  } catch (error) {
    console.error(`Error fetching stations for country ${code}:`, error);
    return [];
  }
};

// Robust Search: Searches by Name, Country, State, and Tag
export const searchStations = async (query: string, limit: number = 40): Promise<RadioStation[]> => {
  try {
    const encodedQuery = encodeURIComponent(query);
    const params = `limit=${limit}&is_https=true&hidebroken=true&order=clickcount&reverse=true`;

    // Parallel fetch for broader results to ensure "China" returns provinces/cities
    const [byName, byCountry, byState, byTag] = await Promise.all([
      fetch(`${API_BASE}/search?name=${encodedQuery}&${params}`).then(r => r.ok ? r.json() : []),
      fetch(`${API_BASE}/search?country=${encodedQuery}&${params}`).then(r => r.ok ? r.json() : []),
      fetch(`${API_BASE}/search?state=${encodedQuery}&${params}`).then(r => r.ok ? r.json() : []),
      fetch(`${API_BASE}/search?tag=${encodedQuery}&${params}`).then(r => r.ok ? r.json() : [])
    ]);

    // Merge and deduplicate
    const allRaw = [...byName, ...byCountry, ...byState, ...byTag];
    const seen = new Set<string>();
    const uniqueStations: RadioStation[] = [];

    for (const station of allRaw) {
      if (station.stationuuid && !seen.has(station.stationuuid)) {
        seen.add(station.stationuuid);
        uniqueStations.push(station);
      }
    }

    return filterPlayable(uniqueStations);
  } catch (error) {
    console.error("Error searching stations:", error);
    return [];
  }
};