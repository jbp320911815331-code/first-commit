import React, { useEffect, useRef, useState } from 'react';
import { RadioStation, GeminiInsight } from '../types';
import { Play, Pause, Volume2, VolumeX, Sparkles, MapPin, Music } from 'lucide-react';
import { generateStationInsight } from '../services/geminiService';

interface StationPlayerProps {
  station: RadioStation | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

const StationPlayer: React.FC<StationPlayerProps> = ({ station, isPlaying, onTogglePlay }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [error, setError] = useState<boolean>(false);
  const [volume, setVolume] = useState(0.8);
  const [insight, setInsight] = useState<GeminiInsight | null>(null);

  // Handle Station Change
  useEffect(() => {
    if (station && audioRef.current) {
      setError(false);
      setInsight({ locationContext: '', musicVibe: '', loading: true });
      audioRef.current.src = station.url_resolved;
      audioRef.current.play().catch(e => {
          console.error("Autoplay failed", e);
          onTogglePlay(); // Sync state if autoplay prevented
      });
      
      // Trigger Gemini Analysis
      generateStationInsight(station).then(data => {
          setInsight({ ...data, loading: false });
      });
    }
  }, [station, onTogglePlay]);

  // Handle Play/Pause Prop
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => setError(true));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Handle Volume
  useEffect(() => {
      if(audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  if (!station) return null;

  return (
    <div className="absolute bottom-0 left-0 w-full bg-slate-900 border-t border-white/10 p-4 z-30 shadow-2xl">
      <audio 
        ref={audioRef} 
        onError={() => setError(true)}
        onPlaying={() => setError(false)}
      />
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 items-center">
        
        {/* Controls */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
           <button 
             onClick={onTogglePlay}
             className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-400 text-black flex items-center justify-center transition-transform active:scale-95 shadow-lg shadow-green-500/20"
           >
             {isPlaying && !error ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
           </button>
           
           <div className="flex flex-col">
             <h3 className="text-white font-bold truncate max-w-[200px]">{station.name}</h3>
             <span className="text-green-400 text-xs flex items-center gap-1">
                {error ? "Offline / Stream Error" : "Live Broadcast"}
                {!error && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"/>}
             </span>
           </div>
        </div>

        {/* AI Insight Section */}
        <div className="flex-1 bg-white/5 rounded-lg p-3 flex gap-4 items-center relative overflow-hidden w-full">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500"></div>
            
            {insight?.loading ? (
                 <div className="flex items-center gap-2 text-sm text-gray-400 animate-pulse">
                    <Sparkles size={16} className="text-purple-400" />
                    <span>Gemini is listening to the frequency...</span>
                 </div>
            ) : (
                <div className="flex flex-col md:flex-row gap-2 md:gap-6 text-sm">
                    <div className="flex gap-2">
                        <MapPin size={16} className="text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-gray-300 leading-tight">{insight?.locationContext}</p>
                    </div>
                    <div className="flex gap-2 border-t md:border-t-0 md:border-l border-white/10 pt-2 md:pt-0 md:pl-6">
                        <Music size={16} className="text-purple-400 shrink-0 mt-0.5" />
                        <p className="text-gray-300 leading-tight italic">"{insight?.musicVibe}"</p>
                    </div>
                </div>
            )}
        </div>

        {/* Volume */}
        <div className="hidden md:flex items-center gap-2 group">
             <button onClick={() => setVolume(v => v === 0 ? 0.8 : 0)} className="text-gray-400 hover:text-white">
                 {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
             </button>
             <input 
               type="range" 
               min="0" 
               max="1" 
               step="0.01" 
               value={volume}
               onChange={(e) => setVolume(parseFloat(e.target.value))}
               className="w-24 accent-green-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
             />
        </div>

      </div>
    </div>
  );
};

export default StationPlayer;
