import React, { useEffect, useRef, useState } from 'react';
import { RadioStation, GeminiInsight } from '../types';
import { Play, Pause, Volume2, VolumeX, Sparkles, MapPin, Music, Radio, Maximize2 } from 'lucide-react';
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
      });
      
      // Trigger Gemini Analysis
      generateStationInsight(station).then(data => {
          setInsight({ ...data, loading: false });
      });
    }
  }, [station]);

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

  if (!station) {
     return (
         <div className="absolute bottom-0 left-0 w-full pointer-events-none z-30">
            <div className="bg-gradient-to-t from-black via-black/90 to-transparent pb-8 pt-16 px-6 text-center">
                <p className="text-slate-500 text-sm flex items-center justify-center gap-2 font-medium tracking-wide animate-pulse">
                    <Radio size={14} /> AWAITING SIGNAL SELECTION
                </p>
            </div>
         </div>
     );
  }

  return (
    <div className="absolute bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[600px] z-40">
      {/* Floating Glass Panel */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row items-stretch">
          
          <audio 
            ref={audioRef} 
            onError={() => setError(true)}
            onPlaying={() => setError(false)}
          />
          
          {/* Left: Controls & Status */}
          <div className="p-4 flex items-center gap-4 border-b md:border-b-0 md:border-r border-white/5">
             {/* Big Play Button */}
             <button 
               onClick={onTogglePlay}
               className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg ${
                   isPlaying 
                   ? 'bg-white text-black hover:bg-slate-200' 
                   : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-500/20'
               }`}
             >
               {isPlaying && !error ? (
                  <Pause fill="currentColor" size={24} />
               ) : (
                  <Play fill="currentColor" className="ml-1" size={24} />
               )}
             </button>
             
             <div className="min-w-0 w-40 md:w-32">
                 {error ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                        OFFLINE
                    </span>
                 ) : (
                    <div className="flex items-center gap-1.5 mb-1">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 tracking-wider">LIVE ON AIR</span>
                    </div>
                 )}
                 <h3 className="text-white font-bold text-sm truncate">{station.name}</h3>
                 <p className="text-slate-400 text-xs truncate">
                    {station.state ? station.state + ', ' : ''}{station.country}
                 </p>
             </div>
          </div>

          {/* Right: AI Insight & Volume */}
          <div className="flex-1 flex flex-col justify-center p-4 bg-white/[0.02]">
              
              {/* Insight Text */}
              <div className="mb-3 min-h-[2.5rem] flex items-center">
                  {insight?.loading ? (
                     <div className="flex items-center gap-2 text-xs text-slate-500 animate-pulse">
                        <Sparkles size={12} className="text-purple-400" />
                        <span>Analyzing frequency data...</span>
                     </div>
                  ) : (
                     <div className="text-xs text-slate-300 leading-relaxed">
                        <span className="text-purple-400 font-medium mr-1">AI Insight:</span>
                        {insight?.musicVibe || insight?.locationContext || "Enjoy the broadcast."}
                     </div>
                  )}
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-3">
                 <button onClick={() => setVolume(v => v === 0 ? 0.8 : 0)} className="text-slate-500 hover:text-white transition-colors">
                     {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                 </button>
                 <div className="flex-1 relative h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                        className="absolute top-0 left-0 h-full bg-slate-500 rounded-full"
                        style={{ width: `${volume * 100}%` }}
                    />
                    <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01" 
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="absolute inset-0 w-full opacity-0 cursor-pointer"
                    />
                 </div>
              </div>
          </div>

      </div>
    </div>
  );
};

export default StationPlayer;