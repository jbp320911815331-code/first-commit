import { RadioStation } from '../types';

const API_BASE = 'https://de1.api.radio-browser.info/json/stations';

// Helper to filter playable stations (HTTPS is required for most modern web deployments)
const filterPlayable = (stations: any[]): RadioStation[] => {
  return stations.filter((s: any) => 
    s.url_resolved && 
    s.url_resolved.startsWith('https') && 
    s.geo_lat !== null && 
    s.geo_long !== null
  );
};

// Fetch top stations globally to populate the initial globe view
export const getTopStations = async (limit: number = 500): Promise<RadioStation[]> => {
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

// Search stations by geolocation (radius search)
export const getStationsByLocation = async (lat: number, lng: number, radiusKm: number = 200, limit: number = 50): Promise<RadioStation[]> => {
  try {
    const response = await fetch(`${API_BASE}/search?lat=${lat}&lon=${lng}&radius=${radiusKm}&limit=${limit}&is_https=true&hidebroken=true&order=votes&reverse=true`);
    if (!response.ok) throw new Error('Failed to fetch stations by location');
    const data = await response.json();
    return data; // backend already filtered by is_https=true in query
  } catch (error) {
    console.error("Error fetching local stations:", error);
    return [];
  }
};

// Search stations by Name, City, or Country
export const searchStations = async (query: string, limit: number = 50): Promise<RadioStation[]> => {
  try {
    // We utilize the powerful search endpoint
    const response = await fetch(`${API_BASE}/search?name=${encodeURIComponent(query)}&limit=${limit}&is_https=true&hidebroken=true&order=clickcount&reverse=true`);
    if (!response.ok) throw new Error('Failed to search stations');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error searching stations:", error);
    return [];
  }
};