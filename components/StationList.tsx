import React, { useState } from 'react';
import { RadioStation } from '../types';
import { Loader2, Signal, Search, MapPin } from 'lucide-react';

interface StationListProps {
  stations: RadioStation[];
  activeStation: RadioStation | null;
  onSelect: (station: RadioStation) => void;
  onSearch: (query: string) => void;
  loading: boolean;
}

const StationList: React.FC<StationListProps> = ({ stations, activeStation, onSelect, onSearch, loading }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <div className="absolute top-0 right-0 h-full w-full md:w-96 bg-black/90 backdrop-blur-xl border-l border-white/10 flex flex-col z-20 shadow-2xl">
      
      {/* Search Header */}
      <div className="p-4 border-b border-white/10 bg-slate-900/50">
        <form onSubmit={handleSearchSubmit} className="relative mb-3">
          <input 
            type="text" 
            placeholder="Search city, country, or FM..." 
            className="w-full bg-slate-800 text-white border border-slate-700 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all placeholder-gray-500 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        </form>
        
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold text-green-400 flex items-center gap-2 uppercase tracking-wider">
            <Signal size={14} />
            {searchQuery ? 'Search Results' : 'Live Signals'}
          </h2>
          <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-1 rounded-full border border-white/5">
            {stations.length} Stations
          </span>
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto scroll-smooth">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 text-green-500 gap-3">
            <Loader2 className="animate-spin w-8 h-8" />
            <span className="text-xs font-mono animate-pulse">Scanning frequencies...</span>
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {stations.map((station) => (
              <li 
                key={station.stationuuid}
                onClick={() => onSelect(station)}
                className={`p-4 cursor-pointer hover:bg-white/5 transition-all group relative overflow-hidden ${
                  activeStation?.stationuuid === station.stationuuid 
                    ? 'bg-green-900/20 border-l-4 border-green-500 pl-[13px]' 
                    : 'border-l-4 border-transparent'
                }`}
              >
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-sm truncate ${
                      activeStation?.stationuuid === station.stationuuid ? 'text-green-400' : 'text-gray-200 group-hover:text-white'
                    }`}>
                      {station.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 group-hover:text-gray-400">
                      <MapPin size={10} />
                      <span className="truncate">
                        {station.state ? `${station.state}, ` : ''}{station.country}
                      </span>
                    </div>
                    
                    <div className="flex gap-1 mt-2 flex-wrap opacity-60 group-hover:opacity-100 transition-opacity">
                      {station.tags.split(',').slice(0, 3).filter(t => t.length > 0).map((tag, i) => (
                         <span key={i} className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 bg-white/10 rounded text-gray-300">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {activeStation?.stationuuid === station.stationuuid && (
                    <div className="mt-2 ml-2 flex flex-col items-end gap-1">
                       <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                    </div>
                  )}
                </div>
              </li>
            ))}
            {stations.length === 0 && !loading && (
                <li className="flex flex-col items-center justify-center h-64 text-center p-6">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <Signal className="text-gray-600" size={32} />
                    </div>
                    <p className="text-gray-300 font-medium">No signal found.</p>
                    <p className="text-gray-500 text-sm mt-2">Try searching for a major city like "Tokyo" or "New York".</p>
                </li>
            )}
          </ul>
        )}
      </div>
      
      {/* Footer/Gradient overlay */}
      <div className="h-6 bg-gradient-to-t from-black to-transparent pointer-events-none absolute bottom-0 w-full z-10" />
    </div>
  );
};

export default StationList;