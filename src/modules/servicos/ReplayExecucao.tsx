import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ExecucaoServico, Talhao } from '../../types';
import { loadGoogleMaps } from '../../services/googleMaps';
import { gerarTimelineExecucao, calcularDuracaoExecucao } from '../../utils/replayUtils';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Navigation, 
  MapPin, 
  TrendingUp,
  X
} from 'lucide-react';

interface ReplayExecucaoProps {
  exec: ExecucaoServico;
  talhao?: Talhao;
  onClose: () => void;
}

export function ReplayExecucao({ exec, talhao, onClose }: ReplayExecucaoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState<number>(exec.path?.[0]?.timestamp || 0);
  const [error, setError] = useState<string | null>(null);
  
  const path = useMemo(() => exec.path || [], [exec]);
  const timeline = useMemo(() => gerarTimelineExecucao(exec), [exec]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (isPlaying && currentIndex < path.length - 1) {
      timerRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          const next = prev + 1;
          if (next >= path.length) {
            setIsPlaying(false);
            return prev;
          }
          setCurrentTime(path[next].timestamp);
          return next;
        });
      }, 500 / playbackSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, currentIndex, path]);

  const currentPath = useMemo(() => {
    return path.slice(0, currentIndex + 1).map(p => ({ lat: p.lat, lng: p.lng }));
  }, [path, currentIndex]);

  const center = useMemo(() => {
    if (path.length > 0) return { lat: path[0].lat, lng: path[0].lng };
    return { lat: -14.235, lng: -51.925 };
  }, [path]);

  // Load Google Map once on mount
  useEffect(() => {
    let active = true;
    loadGoogleMaps()
      .then((google) => {
        if (!active || !mapContainerRef.current) return;

        const gMap = new google.maps.Map(mapContainerRef.current, {
          center: center,
          zoom: 16,
          mapTypeId: 'satellite',
          disableDefaultUI: false,
          zoomControl: true,
        });

        const poly = new google.maps.Polyline({
          path: [],
          geodesic: true,
          strokeColor: '#3b82f6',
          strokeOpacity: 1.0,
          strokeWeight: 6,
          map: gMap,
        });

        const activeMarker = new google.maps.Marker({
          position: center,
          map: gMap,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#3b82f6',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3,
          },
        });

        mapRef.current = gMap;
        polylineRef.current = poly;
        markerRef.current = activeMarker;
      })
      .catch((err) => {
        console.error('Error loading Google Maps for Replay:', err);
        setError('Erro ao carregar o Google Maps.');
      });

    return () => {
      active = false;
    };
  }, []);

  // Update Polyline and Marker selectively
  useEffect(() => {
    if (polylineRef.current) {
      polylineRef.current.setPath(currentPath);
    }
    if (markerRef.current && currentPath.length > 0) {
      const lastPoint = currentPath[currentPath.length - 1];
      markerRef.current.setPosition(lastPoint);
      if (mapRef.current && isPlaying) {
        mapRef.current.panTo(lastPoint);
      }
    }
  }, [currentPath, isPlaying]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
    setCurrentTime(path[0]?.timestamp || 0);
    if (mapRef.current && path.length > 0) {
      mapRef.current.panTo({ lat: path[0].lat, lng: path[0].lng });
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/95 flex flex-col md:p-6 p-0 overflow-hidden backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:mb-6 bg-white/10 md:bg-transparent border-b border-white/10 md:border-none">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white leading-tight">Replay Operacional</h2>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
              {exec.operadorNome} • {talhao?.nome || 'Campo'}
            </p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all active:scale-95"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-4 gap-6 overflow-hidden">
        {/* Mapa do Replay */}
        <div className="lg:col-span-3 flex flex-col gap-4 overflow-hidden h-[400px] lg:h-auto">
          <div className="flex-1 bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-white/5 relative">
            {error ? (
              <div className="w-full h-full flex items-center justify-center text-rose-500 bg-slate-900">{error}</div>
            ) : (
              <div ref={mapContainerRef} className="w-full h-full" style={{ filter: 'grayscale(0.1) contrast(1.05)' }} />
            )}

            {/* Time Overlay */}
            <div className="absolute top-4 left-4 z-[100] bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-xl">
               <div className="flex items-center gap-3">
                 <Clock className="w-4 h-4 text-blue-400" />
                 <span className="text-xl font-black text-white tabular-nums">
                   {new Date(currentTime).toLocaleTimeString()}
                 </span>
               </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="bg-white p-6 rounded-3xl shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-lg ${
                    isPlaying ? 'bg-slate-800 text-white' : 'bg-blue-600 text-white shadow-blue-500/20'
                  }`}
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                </button>

                <button 
                  onClick={handleReset}
                  className="w-12 h-12 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-2xl flex items-center justify-center transition-colors"
                  title="Reiniciar"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 w-full px-2">
                <input 
                  type="range"
                  min="0"
                  max={path.length - 1}
                  value={currentIndex}
                  onChange={(e) => {
                    const idx = parseInt(e.target.value);
                    setCurrentIndex(idx);
                    setCurrentTime(path[idx].timestamp);
                  }}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(path[0]?.timestamp || 0).toLocaleTimeString()}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(path[path.length - 1]?.timestamp || 0).toLocaleTimeString()}</span>
                </div>
              </div>

              <div className="flex bg-slate-50 p-1 rounded-2xl">
                 {[1, 2, 4].map(speed => (
                   <button 
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                      playbackSpeed === speed ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'
                    }`}
                   >
                     {speed}x
                   </button>
                 ))}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline e Status Info */}
        <div className="lg:col-span-1 space-y-6 overflow-hidden flex flex-col p-4 lg:p-0">
          <section className="bg-white/10 rounded-3xl p-6 backdrop-blur-md border border-white/5">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Resumo Operacional
            </h3>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Duração</p>
                  <p className="text-lg font-bold text-white">
                    {Math.floor(calcularDuracaoExecucao(exec) / 60)} min
                  </p>
               </div>
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Hectares</p>
                  <p className="text-lg font-bold text-white">--</p>
               </div>
               {exec.maquinaNome && (
                 <div className="col-span-2 pt-2.5 border-t border-white/5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Máquina</p>
                    <p className="text-sm font-semibold text-slate-100 flex items-center gap-2 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                      {exec.maquinaNome}
                    </p>
                 </div>
               )}
               {exec.implementoNome && (
                 <div className="col-span-2 pt-2.5 border-t border-white/5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Implemento</p>
                    <p className="text-sm font-semibold text-slate-100 flex items-center gap-2 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      {exec.implementoNome}
                    </p>
                 </div>
               )}
               <div className="col-span-2 pt-4 border-t border-white/5">
                 <div className="flex items-center justify-between bg-white/5 p-3 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-bold text-white">Posição Atual</span>
                    </div>
                    <span className="text-xs text-slate-400 tabular-nums">
                      {path[currentIndex]?.lat.toFixed(6)}, {path[currentIndex]?.lng.toFixed(6)}
                    </span>
                 </div>
               </div>
            </div>
          </section>

          <section className="bg-white/10 rounded-3xl p-0 backdrop-blur-md border border-white/5 flex-1 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Linha do Tempo
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
               {timeline.map((event, idx) => (
                 <div key={event.id} className="relative pl-8 group">
                    {/* Vertical Line */}
                    {idx < timeline.length - 1 && (
                      <div className="absolute left-[7px] top-4 bottom-[-24px] w-[2px] bg-white/10" />
                    )}
                    
                    {/* Circle */}
                    <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-4 border-slate-900 z-10 ${
                      event.type === 'inicio' ? 'bg-emerald-500' :
                      event.type === 'final' ? 'bg-rose-500' :
                      event.type === 'pausa' ? 'bg-amber-500' :
                      'bg-slate-400'
                    }`} />

                    <div className="flex flex-col">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-white capitalize">
                          {event.type.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-black text-slate-400 tabular-nums">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      {event.duration && (
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          Duração: {Math.floor(event.duration / 60)}m {Math.floor(event.duration % 60)}s
                        </p>
                      )}
                      
                      {event.location && (
                        <button 
                          onClick={() => {
                            const foundIdx = path.findIndex(p => p.timestamp === event.timestamp);
                            if (foundIdx !== -1) {
                              setCurrentIndex(foundIdx);
                              setCurrentTime(path[foundIdx].timestamp);
                            }
                          }}
                          className="text-[10px] text-blue-400 hover:text-blue-300 font-black uppercase tracking-widest text-left mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MapPin className="w-3 h-3" />
                          Ver no Mapa
                        </button>
                      )}
                    </div>
                 </div>
               ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
