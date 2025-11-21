import React, { useState } from 'react';
import { RadioStation } from '../types';
import { Loader2, Signal, Search, MapPin, Globe, Music, Play } from 'lucide-react';

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

  const quickFilters = [
    { label: '🇨🇳 China', query: 'China' },
    { label: '🇺🇸 USA', query: 'USA' },
    { label: '🇬🇧 UK', query: 'UK' },
    { label: '🇯🇵 Japan', query: 'Japan' },
    { label: '📰 News', query: 'News' },
    { label: '🎷 Jazz', query: 'Jazz' },
  ];

  return (
    <div className="h-full w-full bg-black/80 backdrop-blur-2xl border-l border-white/10 flex flex-col relative">
      
      {/* Search Header */}
      <div className="p-5 pb-2 border-b border-white/5 bg-gradient-to-b from-slate-900/80 to-transparent">
        <form onSubmit={handleSearchSubmit} className="relative mb-4">
          <input 
            type="text" 
            placeholder="Find station, city, or country..." 
            className="w-full bg-white/5 text-white border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder-gray-500 text-sm font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
        </form>

        {/* Quick Filters */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mask-linear">
             {quickFilters.map(f => (
                 <button 
                    key={f.label}
                    onClick={() => {
                        setSearchQuery(f.query);
                        onSearch(f.query);
                    }}
                    className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 hover:bg-emerald-500/20 border border-white/5 hover:border-emerald-500/30 text-xs text-gray-300 hover:text-emerald-400 transition-colors"
                 >
                    {f.label}
                 </button>
             ))}
        </div>
        
        <div className="flex justify-between items-center mt-2 px-1">
          <h2 className="text-xs font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-widest">
            <Globe size={12} />
            {searchQuery ? 'Search Results' : 'Suggested Stations'}
          </h2>
          <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">
            {stations.length} Found
          </span>
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-full text-emerald-500 gap-4">
            <div className="relative">
                <div className="absolute inset-0 rounded-full animate-ping bg-emerald-500/20"></div>
                <Loader2 className="animate-spin w-8 h-8 relative z-10" />
            </div>
            <span className="text-xs font-mono animate-pulse tracking-widest">SCANNING FREQUENCIES...</span>
          </div>
        ) : (
          <ul className="pb-20">
            {stations.map((station) => (
              <li 
                key={station.stationuuid}
                onClick={() => onSelect(station)}
                className={`group px-5 py-4 cursor-pointer border-b border-white/5 hover:bg-white/[0.03] transition-colors relative ${
                  activeStation?.stationuuid === station.stationuuid ? 'bg-white/[0.06]' : ''
                }`}
              >
                {/* Active Indicator Line */}
                {activeStation?.stationuuid === station.stationuuid && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                )}

                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className={`font-semibold text-sm truncate mb-1 ${
                      activeStation?.stationuuid === station.stationuuid ? 'text-emerald-400' : 'text-slate-200 group-hover:text-white'
                    }`}>
                      {station.name}
                    </h3>
                    
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
                      <MapPin size={10} className="shrink-0" />
                      <span className="truncate">
                        {station.state ? `${station.state}, ` : ''}{station.country}
                      </span>
                    </div>
                    
                    {/* Tags */}
                    <div className="flex gap-1.5 mt-2.5 overflow-hidden">
                      {station.tags.split(',').slice(0, 3).filter(t => t.length > 0).map((tag, i) => (
                         <span key={i} className="text-[10px] font-medium px-1.5 py-0.5 bg-white/5 rounded-md text-slate-400 border border-white/5 truncate max-w-[80px]">
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Play Icon / Status */}
                  <div className="flex flex-col items-end justify-center h-full pt-1">
                      {activeStation?.stationuuid === station.stationuuid ? (
                         <div className="flex items-end gap-0.5 h-3">
                             <div className="w-1 bg-emerald-400 animate-[music-bar_0.5s_ease-in-out_infinite] h-full"></div>
                             <div className="w-1 bg-emerald-400 animate-[music-bar_0.7s_ease-in-out_infinite] h-2"></div>
                             <div className="w-1 bg-emerald-400 animate-[music-bar_0.4s_ease-in-out_infinite] h-3"></div>
                         </div>
                      ) : (
                         <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/10">
                             <Play size={12} className="text-slate-300 fill-slate-300 ml-0.5" />
                         </div>
                      )}
                  </div>
                </div>
              </li>
            ))}
            
            {stations.length === 0 && !loading && (
                <li className="flex flex-col items-center justify-center py-20 text-center px-6">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                        <Signal className="text-slate-600" size={24} />
                    </div>
                    <p className="text-slate-300 font-medium">No signals detected.</p>
                    <p className="text-slate-500 text-xs mt-2 max-w-[200px]">Try searching for a specific country like "China" or "Brazil".</p>
                </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default StationList;