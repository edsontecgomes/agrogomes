import React, { useState, useEffect } from 'react';
import { GoogleMapComponent } from './GoogleMapComponent';
import { Talhao, Pluviometro, ChuvaComunitaria } from '../../types';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';

interface HybridMapProps {
  talhoes?: Talhao[];
  pluviometros?: Pluviometro[];
  chuvas?: ChuvaComunitaria[];
  farmId: string;
  userRole: string;
  onPolygonCreated?: (geojson: any, area: number) => void;
  onPolygonDeleted?: (id: string) => void;
  onTalhaoClick?: (talhao: Talhao) => void;
}

export function HybridMap(props: HybridMapProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const hasGoogleMapsKey = Boolean(key && typeof key === 'string' && key.length > 15 && key !== 'undefined');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-100 rounded-2xl overflow-hidden">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 px-4 py-2 rounded-full shadow-lg font-medium text-sm transition-colors bg-white border border-slate-100">
        {!isOnline ? (
          <>
            <WifiOff className="w-4 h-4 text-amber-500" />
            <span className="text-slate-700">Aviso: Modo Offline. Conecte-se para carregar o Google Maps.</span>
          </>
        ) : !hasGoogleMapsKey ? (
          <>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <span className="text-slate-700">Adicione a VITE_GOOGLE_MAPS_API_KEY</span>
          </>
        ) : (
          <>
            <Wifi className="w-4 h-4 text-emerald-500" />
            <span className="text-slate-700">Google Maps Satélite</span>
          </>
        )}
      </div>

      <div className="flex-1 w-full h-full relative z-0">
        <GoogleMapComponent {...props} />
      </div>
    </div>
  );
}
