import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Play, Square, Save, X, Navigation, AlertTriangle, Crosshair } from 'lucide-react';
import { polygon as turfPolygon } from '@turf/helpers';
import { area as turfArea } from '@turf/area';
import { useHighPrecisionGeolocation, AccuracyStatus } from '../../hooks/useHighPrecisionGeolocation';

interface TalhaoWalkingDrawerProps {
  onComplete: (geojson: any, area: number) => void;
  onCancel: () => void;
}

export function TalhaoWalkingDrawer({ onComplete, onCancel }: TalhaoWalkingDrawerProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<[number, number][]>([]); // [lng, lat] for GeoJSON
  
  const gps = useHighPrecisionGeolocation(true, 20, 1, 15000); // We don't need averaging for walking, but we want the UI
  
  const lastPointRef = useRef<[number, number] | null>(null);

  // Update points during drawing
  useEffect(() => {
    if (!isDrawing || !gps.latitude || !gps.longitude || (gps.accuracy && gps.accuracy > 20)) return;

    const newPoint: [number, number] = [gps.longitude, gps.latitude];

    setPoints(prev => {
      if (prev.length === 0) return [newPoint];
      
      const last = prev[prev.length - 1];
      // Only add if moved significantly (approx 2 meters)
      // Using simple Pythagoras for small distances
      const dist = Math.sqrt(Math.pow(last[0] - newPoint[0], 2) + Math.pow(last[1] - newPoint[1], 2));
      if (dist > 0.00002) {
        return [...prev, newPoint];
      }
      return prev;
    });
  }, [gps.latitude, gps.longitude, gps.accuracy, isDrawing]);

  const startDrawing = () => {
    if (gps.accuracy && gps.accuracy > 20) {
      if (!window.confirm("A precisão do GPS está baixa (>20m). Deseja iniciar assim mesmo? O desenho pode ficar impreciso.")) {
        return;
      }
    }
    setPoints([]);
    setIsDrawing(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleFinish = () => {
    if (points.length < 3) {
      alert('Você precisa de pelo menos 3 pontos para formar um talhão.');
      return;
    }

    stopDrawing();

    // Close the polygon for GeoJSON: first and last point must be the same
    const closedPoints = [...points];
    if (closedPoints[0][0] !== closedPoints[closedPoints.length - 1][0] || 
        closedPoints[0][1] !== closedPoints[closedPoints.length - 1][1]) {
      closedPoints.push(closedPoints[0]);
    }

    try {
      const geojson = turfPolygon([closedPoints]);
      const areaSquareMeters = turfArea(geojson);
      const areaHectares = areaSquareMeters / 10000;
      
      onComplete(geojson, areaHectares);
    } catch (error) {
      console.error("Error creating polygon:", error);
      alert("Erro ao criar polígono. Verifique se os pontos formam uma área válida.");
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

  const getStatusDot = (status: AccuracyStatus) => {
    switch (status) {
      case 'green': return 'bg-emerald-600';
      case 'yellow': return 'bg-amber-600';
      case 'red': return 'bg-red-600';
      default: return 'bg-slate-600';
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <Navigation className={`w-5 h-5 ${isDrawing ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Desenhar por Caminhada</h3>
            <p className="text-xs text-slate-500">Mapeamento de alta precisão</p>
          </div>
        </div>
        <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      {gps.accuracy !== null && (
        <div className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${getStatusColor(gps.status)}`}>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${getStatusDot(gps.status)}`} />
            <div>
              <p className="text-sm font-bold uppercase tracking-wider">
                {gps.status === 'green' ? 'Precisão Ideal' : gps.status === 'yellow' ? 'Precisão Média' : 'Baixa Precisão'}
              </p>
              <p className="text-xs opacity-80">Erro estimado: {gps.accuracy.toFixed(1)}m</p>
            </div>
          </div>
          <Crosshair className="w-5 h-5 opacity-40" />
        </div>
      )}

      {gps.accuracy !== null && gps.accuracy > 20 && isDrawing && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-start gap-2 text-amber-800 text-xs">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Aguardando sinal GPS de alta precisão...</strong><br />
            Pontos com precisão superior a 20m estão sendo ignorados para garantir a qualidade do talhão.
          </p>
        </div>
      )}

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center min-h-[100px]">
        {!isDrawing ? (
          <div className="text-center">
            <p className="text-sm text-slate-600 mb-4">Vá até o limite do talhão e inicie a caminhada.</p>
            <button
              onClick={startDrawing}
              disabled={gps.accuracy === null}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              Iniciar Desenho
            </button>
          </div>
        ) : (
          <div className="w-full space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-slate-700">Pontos válidos (&le;20m): {points.length}</span>
              <span className="flex items-center gap-1 text-emerald-600 font-bold animate-pulse">
                <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                Gravando...
              </span>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleFinish}
                disabled={points.length < 3}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md"
              >
                <Save className="w-5 h-5" />
                Finalizar e Salvar
              </button>
              <button
                onClick={stopDrawing}
                className="flex items-center justify-center p-3 bg-red-100 text-red-600 hover:bg-red-200 rounded-xl transition-all"
                title="Parar Gravação"
              >
                <Square className="w-5 h-5 fill-current" />
              </button>
            </div>
          </div>
        )}
      </div>

      {gps.latitude && (
        <div className="text-[10px] text-slate-400 font-mono flex justify-center gap-4 border-t pt-2 border-slate-100">
          <span>LAT: {gps.latitude.toFixed(6)}</span>
          <span>LNG: {gps.longitude.toFixed(6)}</span>
        </div>
      )}
    </div>
  );
}
