import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTodasExecucoesServico } from '../../hooks/useServicos';
import { useSegmentosExecucao } from '../../hooks/useSegmentos';
import { useUsuarios } from '../../hooks/useUsuarios';
import { useEstoque } from '../../hooks/useEstoque';
import { Estoque, Usuario } from '../../types';
import { loadGoogleMaps } from '../../services/googleMaps';
import { Filter, Navigation, User as UserIcon } from 'lucide-react';

interface ExecucoesMapProps {
  farmId: string;
  usuarios?: Usuario[];
  estoque?: Estoque[];
  talhaoId?: string;
  showAll?: boolean;
}

const COLORS = [
  '#2563eb', // blue-600
  '#dc2626', // red-600
  '#16a34a', // green-600
  '#d97706', // amber-600
  '#9333ea', // purple-600
  '#0891b2', // cyan-600
  '#be123c', // rose-600
];

const OPERATOR_COLORS: { [key: string]: string } = {};

function getOperatorColor(operatorId: string) {
  if (!OPERATOR_COLORS[operatorId]) {
    OPERATOR_COLORS[operatorId] = COLORS[Object.keys(OPERATOR_COLORS).length % COLORS.length];
  }
  return OPERATOR_COLORS[operatorId];
}

export function ExecucoesMap({ farmId, usuarios: usuariosProp, talhaoId }: ExecucoesMapProps) {
  const { execucoes, loading: loadingExecs } = useTodasExecucoesServico(farmId);
  const { segmentos, loading: loadingSegments } = useSegmentosExecucao(farmId);
  const { usuarios: usuariosHook, loading: loadingUsers } = useUsuarios(farmId);

  const usuarios = usuariosProp || usuariosHook;
  
  const [filterDataInicio, setFilterDataInicio] = useState('');
  const [filterDataFim, setFilterDataFim] = useState('');
  const [filterOperador, setFilterOperador] = useState('');
  const [showFullTracks, setShowFullTracks] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const polylinesRef = useRef<any[]>([]);
  const markersRef = useRef<any[]>([]);

  const filteredExecucoes = useMemo(() => {
    return execucoes.filter(exec => {
      if (talhaoId && exec.talhaoId !== talhaoId) return false;
      if (filterDataInicio) {
        const start = new Date(filterDataInicio);
        if (exec.dataInicio < start) return false;
      }
      if (filterDataFim) {
        const end = new Date(filterDataFim);
        end.setHours(23, 59, 59, 999);
        if (exec.dataInicio > end) return false;
      }
      if (filterOperador && exec.operadorId !== filterOperador) return false;

      return true;
    });
  }, [execucoes, filterDataInicio, filterDataFim, filterOperador, talhaoId]);

  const filteredSegments = useMemo(() => {
    return segmentos.filter(seg => {
      if (talhaoId && seg.talhaoId !== talhaoId) return false;
      if (filterOperador && seg.operadorId !== filterOperador) return false;
      const parentExec = execucoes.find(e => e.id === seg.execucaoId);
      if (!parentExec) return false;
      
      if (filterDataInicio) {
        const start = new Date(filterDataInicio);
        if (parentExec.dataInicio < start) return false;
      }

      return true;
    });
  }, [segmentos, filterOperador, filterDataInicio, execucoes, talhaoId]);

  const distanceByOperator = useMemo(() => {
    const map: { [key: string]: number } = {};
    filteredSegments.forEach(seg => {
      const dist = seg.metadata?.distanciaPercorrida || 0;
      map[seg.operadorId] = (map[seg.operadorId] || 0) + dist;
    });
    return map;
  }, [filteredSegments]);

  const center = useMemo(() => {
    if (filteredExecucoes.length > 0 && filteredExecucoes[0].path && filteredExecucoes[0].path.length > 0) {
      return { lat: filteredExecucoes[0].path[0].lat, lng: filteredExecucoes[0].path[0].lng };
    }
    return { lat: -14.235, lng: -51.925 };
  }, [filteredExecucoes]);

  useEffect(() => {
    let active = true;
    loadGoogleMaps()
      .then((google) => {
        if (!active || !mapContainerRef.current) return;

        const gMap = new google.maps.Map(mapContainerRef.current, {
          center: center,
          zoom: 14,
          mapTypeId: 'satellite',
          disableDefaultUI: false,
          zoomControl: true,
        });

        mapRef.current = gMap;
        renderMapElements(google, gMap);
      })
      .catch((err) => {
        console.error('Error loading Google Maps:', err);
        setError('Erro ao carregar o Google Maps.');
      });

    return () => {
      active = false;
      clearMapDrawing();
    };
  }, [filteredExecucoes, filteredSegments, showFullTracks, center]);

  const clearMapDrawing = () => {
    polylinesRef.current.forEach(p => p.setMap(null));
    polylinesRef.current = [];
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
  };

  const renderMapElements = (google: any, gMap: any) => {
    clearMapDrawing();

    // 1. Draw Full Tracks has faint lines
    if (showFullTracks) {
      filteredExecucoes.forEach((exec) => {
        if (!exec.path || exec.path.length < 2) return;
        const color = getOperatorColor(exec.operadorId);
        const pathCoords = exec.path.map(p => ({ lat: p.lat, lng: p.lng }));

        const poly = new google.maps.Polyline({
          path: pathCoords,
          geodesic: true,
          strokeColor: color,
          strokeOpacity: 0.3,
          strokeWeight: 2,
          map: gMap,
        });
        polylinesRef.current.push(poly);
      });
    }

    // 2. Draw Operational Segments
    filteredSegments.forEach((seg) => {
      if (!seg.pontos || seg.pontos.length < 2) return;
      const color = getOperatorColor(seg.operadorId);
      const pathCoords = seg.pontos.map(p => ({ lat: p.lat, lng: p.lng }));

      const poly = new google.maps.Polyline({
        path: pathCoords,
        geodesic: true,
        strokeColor: color,
        strokeOpacity: 1.0,
        strokeWeight: 6,
        map: gMap,
      });

      const opName = usuarios.find(u => u.id === seg.operadorId)?.nome || 'Operador';
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; font-family: sans-serif; color: #1e293b; max-width: 200px;">
            <div style="font-weight: bold; font-size: 13px; display: flex; align-items: center; gap: 4px; margin-bottom: 6px;">
              <span>👤 ${opName}</span>
            </div>
            <div style="height: 1px; background: #e2e8f0; margin: 4px 0;"></div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px;">
              <div>
                <span style="color: #94a3b8; display: block; font-size: 9px; text-transform: uppercase;">Distância</span>
                <span style="font-weight: bold; color: #334155;">${(seg.metadata?.distanciaPercorrida || 0).toFixed(0)}m</span>
              </div>
              <div>
                <span style="color: #94a3b8; display: block; font-size: 9px; text-transform: uppercase;">Velocidade</span>
                <span style="font-weight: bold; color: #334155;">${(seg.metadata?.velocidadeMedia || 0).toFixed(1)} km/h</span>
              </div>
            </div>
            <p style="margin: 6px 0 0 0; font-size: 10px; color: #94a3b8;">
              ${new Date(seg.inicioTimestamp).toLocaleTimeString()} - ${new Date(seg.fimTimestamp).toLocaleTimeString()}
            </p>
          </div>
        `
      });

      poly.addListener('click', (e: any) => {
        infoWindow.setPosition(e.latLng);
        infoWindow.open(gMap);
      });

      polylinesRef.current.push(poly);
    });

    // 3. Current Live Operators Position markers
    filteredExecucoes.forEach((exec) => {
      if (!exec.path || exec.path.length === 0) return;
      const lastPoint = exec.path[exec.path.length - 1];
      const color = getOperatorColor(exec.operadorId);
      const isActive = exec.status === 'em_execucao';

      if (!isActive) return;

      const marker = new google.maps.Marker({
        position: { lat: lastPoint.lat, lng: lastPoint.lng },
        map: gMap,
        title: exec.operadorNome,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        }
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 4px; font-family: sans-serif; font-size: 12px; color: #020617; font-weight: bold;">
            ${exec.operadorNome} (Ativo)
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(gMap, marker);
      });

      markersRef.current.push(marker);
    });
  };

  if (loadingExecs || loadingSegments || (!usuariosProp && loadingUsers)) {
    return <div className="text-center py-12 text-slate-500">Carregando mapa...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-500" />
            <h3 className="font-bold text-slate-800">Visualização Operacional</h3>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showFullTracks} 
                onChange={e => setShowFullTracks(e.target.checked)} 
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Mostrar Rastro Completo
            </label>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Período Início</label>
            <input
              type="date"
              value={filterDataInicio}
              onChange={e => setFilterDataInicio(e.target.value)}
              className="w-full rounded-xl border-slate-200 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Operador</label>
            <select
              value={filterOperador}
              onChange={e => setFilterOperador(e.target.value)}
              className="w-full rounded-xl border-slate-200 text-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Todos os Operadores</option>
              {usuarios.map(u => (
                <option key={u.id} value={u.id}>{u.nome}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
             <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {Object.entries(distanceByOperator).map(([opId, dist]) => (
                  <div 
                    key={opId}
                    className="flex-shrink-0 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3"
                  >
                    <div className="w-2 h-8 rounded-full" style={{ backgroundColor: getOperatorColor(opId) }} />
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase leading-none">
                        {usuarios.find(u => u.id === opId)?.nome || 'Operador'}
                      </p>
                      <p className="text-sm font-bold text-slate-700">
                        {(dist / 1000).toFixed(2)} km
                      </p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden h-[600px] relative">
        {error ? (
          <div className="w-full h-full flex items-center justify-center text-rose-500 font-semibold">{error}</div>
        ) : (
          <div ref={mapContainerRef} className="w-full h-full" />
        )}

        {/* Legend */}
        <div className="absolute top-4 right-4 z-[10] bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-100 shadow-xl max-w-[200px]">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Legenda</h4>
          <div className="space-y-2">
             <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-slate-300 border-t border-dashed border-slate-400" />
                <span className="text-xs font-bold text-slate-600">Rastro GPS</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-4 h-2 bg-blue-600 rounded-full" />
                <span className="text-xs font-bold text-slate-600">Trecho Operacional</span>
             </div>
             <div className="pt-2 border-t border-slate-100">
               <div className="flex items-center gap-2">
                  <Navigation className="w-3 h-3 text-blue-600 animate-pulse" />
                  <span className="text-[10px] font-bold text-blue-700">Execução Ativa</span>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
