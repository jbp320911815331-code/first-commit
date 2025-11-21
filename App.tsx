import React, { useState, useEffect, useCallback } from 'react';
import Globe from './components/Globe';
import StationList from './components/StationList';
import StationPlayer from './components/StationPlayer';
import { getTopStations, searchStations, getStationsByCountryCode } from './services/radioService';
import { RadioStation, GeoLocation } from './types';
import { Menu, X, Radio, Play, Globe2 } from 'lucide-react';

const App: React.FC = () => {
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [activeStation, setActiveStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  // Initial load: Top stations worldwide + Specific China/Major countries for better coverage
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        // Fetch Top Global, China (CN), and USA (US) in parallel to ensure map is populated
        const [globalTop, chinaTop, usaTop] = await Promise.all([
          getTopStations(150),
          getStationsByCountryCode('CN', 100), // Ensure China is well represented
          getStationsByCountryCode('US', 50)   // Add some US density
        ]);

        // Deduplicate based on UUID
        const combined = [...globalTop, ...chinaTop, ...usaTop];
        const seen = new Set<string>();
        const uniqueStations: RadioStation[] = [];
        
        for (const s of combined) {
          if (!seen.has(s.stationuuid)) {
            seen.add(s.stationuuid);
            uniqueStations.push(s);
          }
        }

        setStations(uniqueStations);
      } catch (e) {
        console.error("Init failed", e);
      } finally {
        setLoading(false);
        if (window.innerWidth < 768) setIsSidebarOpen(false);
      }
    };
    init();
  }, []);

  const handleLocationChange = useCallback((loc: GeoLocation) => {
    // Optional: Fetch local stations when globe stops spinning
  }, []);

  const handleSearch = async (query: string) => {
    setLoading(true);
    const results = await searchStations(query);
    setStations(results);
    setLoading(false);
    setIsSidebarOpen(true);
  };

  const handleStationSelect = (station: RadioStation) => {
    setActiveStation(station);
    setIsPlaying(true);
    if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
    }
  };

  const handleStart = () => {
    setHasStarted(true);
  };

  return (
    <div className="w-full h-screen bg-[#050505] flex flex-col relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-black text-slate-100">
      
      {/* Start Screen Overlay */}
      {!hasStarted && (
        <div className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 transition-opacity duration-700">
           <div className="text-center space-y-8 max-w-2xl relative z-10">
             <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.2)] mb-2 animate-pulse">
                <Globe2 size={48} className="text-emerald-500" />
             </div>
             
             <div className="space-y-2">
               <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter">
                  RADIO<span className="text-emerald-500">.GLB</span>
               </h1>
               <p className="text-slate-400 text-lg md:text-xl font-light tracking-wide">
                 Connect to <span className="text-white font-medium">live frequencies</span> from every corner of the planet.
               </p>
             </div>
             
             <div className="pt-8">
               <button 
                 onClick={handleStart}
                 className="group relative inline-flex items-center justify-center px-10 py-5 font-bold text-black transition-all duration-300 bg-emerald-500 rounded-full hover:bg-emerald-400 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-4 focus:ring-offset-black"
               >
                 <Play className="mr-3 fill-current" size={24} />
                 <span className="tracking-widest text-sm">START LISTENING</span>
                 <div className="absolute -inset-4 rounded-full bg-emerald-500/20 group-hover:bg-emerald-500/40 blur-xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
               </button>
             </div>
             
             <p className="text-xs text-emerald-500/50 font-mono uppercase tracking-widest pt-12">
               Featuring channels from China, USA, Europe & More
             </p>
           </div>
           
           {/* Background Ambient Effect */}
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/10 via-black to-black pointer-events-none" />
        </div>
      )}

      {/* Mobile Toggle */}
      <div className="absolute top-5 right-5 z-50 md:hidden">
         <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-emerald-400 shadow-xl"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* App Header (Desktop) - Redesigned to avoid overlap */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none select-none">
         <div className="bg-black/20 backdrop-blur-xl border border-white/5 rounded-2xl p-4 pr-8 shadow-xl">
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
                <h1 className="text-2xl font-black text-white tracking-tighter">
                RADIO<span className="text-emerald-500">.GLB</span>
                </h1>
            </div>
            <div className="flex gap-3 mt-1 pl-5 text-[9px] font-mono text-emerald-500/60 uppercase tracking-widest">
                <span className="flex items-center gap-1">LIVE FEED</span>
                <span className="opacity-30">|</span>
                <span>{stations.length} SIGNALS ONLINE</span>
            </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 relative flex">
        
        {/* Globe Container */}
        <div className="flex-1 relative z-0">
             <Globe 
                onLocationChange={handleLocationChange} 
                stations={stations}
                activeStation={activeStation}
            />
        </div>

        {/* Sidebar */}
        <div className={`absolute top-0 right-0 h-full md:relative md:w-96 md:h-full md:translate-x-0 transition-transform duration-500 ease-out z-20 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} shadow-2xl`}>
           <StationList 
              stations={stations}
              activeStation={activeStation}
              onSelect={handleStationSelect}
              onSearch={handleSearch}
              loading={loading}
           />
        </div>
      </div>

      {/* Persistent Player Bar */}
      <StationPlayer 
        station={activeStation}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
      />
    </div>
  );
};

export default App;