import React, { useState, useEffect, useCallback } from 'react';
import Globe from './components/Globe';
import StationList from './components/StationList';
import StationPlayer from './components/StationPlayer';
import { getTopStations, getStationsByLocation, searchStations } from './services/radioService';
import { RadioStation, GeoLocation } from './types';
import { Menu, X, Globe2 } from 'lucide-react';

const App: React.FC = () => {
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [activeStation, setActiveStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Initial load: Top stations worldwide to populate the map
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const topStations = await getTopStations(300);
      setStations(topStations);
      setLoading(false);
      
      // Auto-select sidebar state based on screen size
      if (window.innerWidth < 768) setIsSidebarOpen(false);
    };
    init();
  }, []);

  // Handle when globe rotation stops
  const handleLocationChange = useCallback(async (loc: GeoLocation) => {
    // We intentionally don't auto-fetch aggressively to preserve the user's "search context"
    // if they just searched for something specific. 
    // However, for a Radio Garden feel, we could enable this if we had a toggle.
    // For now, we leave the globe purely for exploration of the *current* dataset 
    // or manual clicks, unless the dataset is empty.
  }, []);

  const handleSearch = async (query: string) => {
    setLoading(true);
    const results = await searchStations(query);
    setStations(results);
    
    // If we have results, automatically select the first one to rotate the globe there
    if (results.length > 0) {
       // Don't auto-play, just rotate
       // setActiveStation(results[0]); 
       // Actually, picking the first one implies selection. 
       // Let's just let the globe update its dots.
    }
    setLoading(false);
    setIsSidebarOpen(true);
  };

  const handleStationSelect = (station: RadioStation) => {
    setActiveStation(station);
    setIsPlaying(true);
    // On mobile, close sidebar on select to show the globe/player
    if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
    }
  };

  return (
    <div className="w-full h-screen bg-black flex flex-col relative overflow-hidden font-sans selection:bg-green-500 selection:text-black">
      
      {/* Mobile Header/Toggle */}
      <div className="absolute top-4 right-4 z-50 md:hidden">
         <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-3 bg-slate-900/80 backdrop-blur border border-white/10 rounded-full text-green-400 shadow-lg hover:bg-slate-800 transition-colors"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="absolute top-4 left-4 z-10 pointer-events-none mix-blend-difference">
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter flex items-center gap-2">
          RADIO<span className="text-green-500">.AI</span>
        </h1>
        <p className="text-[10px] md:text-xs text-green-400/80 font-mono mt-1 pl-1">
            GLOBAL LIVE FREQUENCIES
        </p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative">
        <Globe 
          onLocationChange={handleLocationChange} 
          stations={stations}
          activeStation={activeStation}
        />

        {/* Sidebar Overlay/Slide-in */}
        <div className={`absolute top-0 right-0 h-full transition-transform duration-500 ease-out z-40 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} shadow-[-10px_0_30px_rgba(0,0,0,0.5)]`}>
           <StationList 
              stations={stations}
              activeStation={activeStation}
              onSelect={handleStationSelect}
              onSearch={handleSearch}
              loading={loading}
           />
        </div>
        
        {/* Toggle button for Desktop when closed */}
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="hidden md:flex absolute top-1/2 right-0 -translate-y-1/2 z-30 bg-slate-900/80 p-2 rounded-l-lg border-y border-l border-white/10 text-green-400 hover:pl-4 transition-all"
          >
            <Menu />
          </button>
        )}
      </div>

      {/* Persistent Player */}
      <StationPlayer 
        station={activeStation}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
      />
    </div>
  );
};

export default App;