import React, { useState, useEffect } from 'react';
import { Crosshair, Navigation, AlertTriangle, Check, Loader2, RefreshCw } from 'lucide-react';
import { useHighPrecisionGeolocation, AccuracyStatus } from '../hooks/useHighPrecisionGeolocation';

interface HighPrecisionFixerProps {
  onLocationFixed: (location: { lat: number, lng: number, accuracy: number }) => void;
  onCancel?: () => void;
  targetAccuracy?: number;
}

export function HighPrecisionFixer({ 
  onLocationFixed, 
  onCancel,
  targetAccuracy = 20 
}: HighPrecisionFixerProps) {
  const [isFixing, setIsFixing] = useState(false);
  const gps = useHighPrecisionGeolocation(isFixing, targetAccuracy, 5, 20000);

  useEffect(() => {
    if (gps.isStable && gps.latitude && gps.longitude && gps.accuracy) {
      // Automatically finish if stable and precision is excellent
      if (gps.accuracy <= targetAccuracy) {
        handleConfirm();
      }
    }
  }, [gps.isStable, gps.latitude, gps.longitude, gps.accuracy]);

  const handleConfirm = () => {
    if (gps.latitude && gps.longitude && gps.accuracy) {
      onLocationFixed({
        lat: gps.latitude,
        lng: gps.longitude,
        accuracy: gps.accuracy
      });
      setIsFixing(false);
    }
  };

  const getStatusColor = (status: AccuracyStatus) => {
    switch (status) {
      case 'green': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'yellow': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'red': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  if (!isFixing) {
    return (
      <button
        type="button"
        onClick={() => setIsFixing(true)}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 font-bold rounded-xl transition-all"
      >
        <Crosshair className="w-5 h-5" />
        Fixar Local com Alta Precisão
      </button>
    );
  }

  return (
    <div className="bg-white border-2 border-blue-500 p-4 rounded-2xl shadow-xl space-y-4 animate-in fade-in zoom-in duration-200">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          Capturando Local...
        </h3>
        <button 
          type="button" 
          onClick={() => {
            setIsFixing(false);
            if (onCancel) onCancel();
          }} 
          className="text-xs text-slate-400 hover:text-slate-600 p-1"
        >
          Cancelar
        </button>
      </div>

      {gps.accuracy !== null && (
        <div className={`p-3 rounded-xl border space-y-1 transition-colors ${getStatusColor(gps.status)}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Sinal GPS</span>
            <span className="text-xs font-mono font-bold">{gps.accuracy.toFixed(1)}m</span>
          </div>
          <div className="w-full bg-black/5 h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${
                gps.status === 'green' ? 'bg-emerald-500' : gps.status === 'yellow' ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.max(5, 100 - (gps.accuracy * 2))}%` }}
            />
          </div>
        </div>
      )}

      <div className="bg-slate-50 p-4 rounded-xl space-y-2">
        <p className="text-center text-sm font-medium text-slate-700">
          {gps.pointsCollected < 5 ? (
            `Coletando amostras: ${gps.pointsCollected}/5`
          ) : (
            'Localização Estabilizada!'
          )}
        </p>
        
        {gps.accuracy !== null && gps.accuracy > targetAccuracy && (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-2 rounded-lg text-[10px] font-medium animate-pulse">
            <AlertTriangle className="w-3 h-3 flex-shrink-0" />
            Aguardando sinal GPS de alta precisão (&le;{targetAccuracy}m)...
          </div>
        )}

        {gps.timeoutReached && gps.accuracy !== null && gps.accuracy > targetAccuracy && (
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <p className="text-[10px] text-red-600 font-bold text-center">
              Precisão baixa. Deseja continuar?
            </p>
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-3 h-3" />
              Salvar com Precisão Atual
            </button>
          </div>
        )}
      </div>

      {gps.isStable && (
        <button
          type="button"
          onClick={handleConfirm}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-200 flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          Confirmar Localização
        </button>
      )}

      <button
        type="button"
        onClick={gps.retry}
        className="w-full py-1 text-[10px] text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1"
      >
        <RefreshCw className="w-3 h-3" />
        Reiniciar Coleta
      </button>
    </div>
  );
}
