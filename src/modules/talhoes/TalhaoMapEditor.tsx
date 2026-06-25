import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '../../services/googleMaps';
import { auth, db } from '../../services/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Talhao } from '../../types';
import { handleFirestoreError } from '../../utils/errorHandling';
import { 
  MapPin, 
  Trash2, 
  Plus, 
  Edit3, 
  Save, 
  X, 
  RotateCcw, 
  Layers, 
  AlertTriangle, 
  Palette,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

interface TalhaoMapEditorProps {
  farmId: string;
  userRole: string;
  talhoes: Talhao[];
  selectedTalhao: Talhao | null;
  onSelectTalhao: (talhao: Talhao | null) => void;
}

const PRESET_COLORS = [
  { name: 'Esmeralda', value: '#10b981' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Violeta', value: '#8b5cf6' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Céu', value: '#0ea5e9' },
  { name: 'Cinza', value: '#64748b' }
];

export function TalhaoMapEditor({ 
  farmId, 
  userRole, 
  talhoes, 
  selectedTalhao, 
  onSelectTalhao 
 }: TalhaoMapEditorProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [googleMaps, setGoogleMaps] = useState<any>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  
  // Mode controls: 'view' | 'draw' | 'edit'
  const [mode, setMode] = useState<'view' | 'draw' | 'edit'>('view');
  const [isAuthError, setIsAuthError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [nome, setNome] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0].value);
  const [calculatedArea, setCalculatedArea] = useState<number>(0);
  const [polygonCoords, setPolygonCoords] = useState<{ lat: number; lng: number }[]>([]);

  // Editing target
  const [editingTalhao, setEditingTalhao] = useState<Talhao | null>(null);

  // Map elements references (to clean up or update)
  const mapOverlayPolygonsRef = useRef<{ [id: string]: any }>({});
  const activeDrawPolylineRef = useRef<any>(null);
  const activeDrawMarkersRef = useRef<any[]>([]);
  const activeEditPolygonRef = useRef<any>(null);

  const canManage = userRole === 'admin' || userRole === 'gerente';

  // Handle Google Maps authorization failure
  useEffect(() => {
    const originalAuthFailure = (window as any).gm_authFailure;
    (window as any).gm_authFailure = () => {
      console.warn('Google Maps authentication failure intercepted.');
      setIsAuthError(true);
      if (originalAuthFailure) {
        try {
          originalAuthFailure();
        } catch (e) {}
      }
    };
    return () => {
      (window as any).gm_authFailure = originalAuthFailure;
    };
  }, []);

  // Initialize map
  useEffect(() => {
    let active = true;
    loadGoogleMaps()
      .then((google) => {
        if (!active || !mapRef.current) return;
        setGoogleMaps(google);

        // Calculate initial center
        let initialCenter = { lat: -14.235, lng: -51.925 };
        let initialZoom = 4;

        if (talhoes.length > 0 && talhoes[0].coordenadas && talhoes[0].coordenadas.length > 0) {
          initialCenter = { lat: talhoes[0].coordenadas[0].lat, lng: talhoes[0].coordenadas[0].lng };
          initialZoom = 15;
        }

        const map = new google.maps.Map(mapRef.current, {
          center: initialCenter,
          zoom: initialZoom,
          mapTypeId: 'satellite',
          disableDefaultUI: false,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          tilt: 0,
        });

        setMapInstance(map);
      })
      .catch((err) => {
        console.error('Failed to load Google Maps SDK', err);
      });

    return () => {
      active = false;
    };
  }, []);

  // Auto center map when selectedTalhao changes
  const centerOnTalhao = (talhao: Talhao) => {
    if (!mapInstance || !googleMaps || !talhao.coordenadas || talhao.coordenadas.length === 0) return;
    
    const bounds = new googleMaps.maps.LatLngBounds();
    talhao.coordenadas.forEach(coord => {
      bounds.extend(new googleMaps.maps.LatLng(coord.lat, coord.lng));
    });
    
    mapInstance.fitBounds(bounds);
    setTimeout(() => {
      if (mapInstance.getZoom() > 18) {
        mapInstance.setZoom(17);
      }
    }, 100);
  };

  useEffect(() => {
    if (selectedTalhao && mode === 'view') {
      centerOnTalhao(selectedTalhao);
    }
  }, [selectedTalhao, mapInstance, mode]);

  // Sync / Render Polygons of other talhoes
  useEffect(() => {
    if (!mapInstance || !googleMaps) return;

    // Clean up old overlay polygons
    Object.keys(mapOverlayPolygonsRef.current).forEach(id => {
      if (mapOverlayPolygonsRef.current[id]) {
        mapOverlayPolygonsRef.current[id].setMap(null);
      }
    });
    mapOverlayPolygonsRef.current = {};

    // Render registered talhoes
    talhoes.forEach(t => {
      if (mode === 'edit' && editingTalhao?.id === t.id) return;

      const coords = t.coordenadas || [];
      if (coords.length === 0) return;

      const isSelected = selectedTalhao?.id === t.id;
      const color = t.cor || '#10b981';

      const polygon = new googleMaps.maps.Polygon({
        paths: coords,
        strokeColor: color,
        strokeOpacity: isSelected ? 1.0 : 0.6,
        strokeWeight: isSelected ? 4 : 2,
        fillColor: color,
        fillOpacity: isSelected ? 0.35 : 0.15,
        clickable: true,
        map: mapInstance
      });

      polygon.addListener('click', (e: any) => {
        onSelectTalhao(t);
        
        const infoWindow = new googleMaps.maps.InfoWindow({
          content: `
            <div style="font-family: sans-serif; padding: 6px 10px; color: #1e293b;">
              <h4 style="margin: 0 0 4px 0; font-weight: 700; font-size: 14px;">${t.nome}</h4>
              <p style="margin: 0; font-size: 11px; color: #64748b; font-weight: 600;">Área: ${t.area.toFixed(2)} ha</p>
            </div>
          `,
          position: e.latLng
        });
        
        infoWindow.open(mapInstance);
        setTimeout(() => infoWindow.close(), 4000);
      });

      mapOverlayPolygonsRef.current[t.id] = polygon;
    });

  }, [talhoes, selectedTalhao, mapInstance, googleMaps, mode, editingTalhao]);

  // Handle Map Clicks & Vertex drawing
  useEffect(() => {
    if (!mapInstance || !googleMaps) return;

    if (activeEditPolygonRef.current) {
      activeEditPolygonRef.current.setMap(null);
      activeEditPolygonRef.current = null;
    }
    if (activeDrawPolylineRef.current) {
      activeDrawPolylineRef.current.setMap(null);
      activeDrawPolylineRef.current = null;
    }
    activeDrawMarkersRef.current.forEach(m => m.setMap(null));
    activeDrawMarkersRef.current = [];

    googleMaps.maps.event.clearListeners(mapInstance, 'click');

    if (mode === 'draw') {
      activeDrawPolylineRef.current = new googleMaps.maps.Polyline({
        path: polygonCoords,
        strokeColor: selectedColor,
        strokeOpacity: 0.8,
        strokeWeight: 3,
        map: mapInstance
      });

      polygonCoords.forEach((coord, index) => {
        const isFirst = index === 0;
        const marker = new googleMaps.maps.Marker({
          position: coord,
          map: mapInstance,
          label: isFirst ? { text: '🏠', fontSize: '12px' } : undefined,
          icon: {
            path: googleMaps.maps.SymbolPath.CIRCLE,
            scale: isFirst ? 7 : 5,
            fillColor: isFirst ? '#df1818' : '#22c55e',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          }
        });

        if (isFirst) {
          marker.addListener('click', () => {
            closePolygon();
          });
        }

        activeDrawMarkersRef.current.push(marker);
      });

      mapInstance.addListener('click', (e: any) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        const newPoint = { lat, lng };

        setPolygonCoords(prev => {
          const updated = [...prev, newPoint];
          recalculatePathArea(updated);
          return updated;
        });
      });
    }

    if (mode === 'edit' && editingTalhao) {
      const initialCoords = editingTalhao.coordenadas || [];
      
      const poly = new googleMaps.maps.Polygon({
        paths: initialCoords,
        strokeColor: selectedColor,
        strokeOpacity: 0.9,
        strokeWeight: 3,
        fillColor: selectedColor,
        fillOpacity: 0.25,
        editable: true,
        draggable: true,
        map: mapInstance
      });

      activeEditPolygonRef.current = poly;

      const gPath = poly.getPath();
      const areaM2 = googleMaps.maps.geometry.spherical.computeArea(gPath);
      setCalculatedArea(areaM2 / 10000);

      const syncPathState = () => {
        const arr: { lat: number; lng: number }[] = [];
        const path = poly.getPath();
        for (let i = 0; i < path.getLength(); i++) {
          const latLng = path.getAt(i);
          arr.push({ lat: latLng.lat(), lng: latLng.lng() });
        }
        setPolygonCoords(arr);
        const updatedAreaM2 = googleMaps.maps.geometry.spherical.computeArea(path);
        setCalculatedArea(updatedAreaM2 / 10000);
      };

      const pathArray = poly.getPath();
      googleMaps.maps.event.addListener(pathArray, 'set_at', syncPathState);
      googleMaps.maps.event.addListener(pathArray, 'insert_at', syncPathState);
      googleMaps.maps.event.addListener(pathArray, 'remove_at', syncPathState);
      
      poly.addListener('dragend', () => {
        syncPathState();
      });

      poly.addListener('rightclick', (e: any) => {
        if (e.vertex !== undefined) {
          const path = poly.getPath();
          if (path.getLength() > 3) {
            path.removeAt(e.vertex);
          } else {
            alert('Um polígono necessita de pelo menos 3 vértices.');
          }
        }
      });
    }

  }, [mode, polygonCoords, editingTalhao, mapInstance, googleMaps, selectedColor]);

  const recalculatePathArea = (points: { lat: number; lng: number }[]) => {
    if (!googleMaps || points.length < 3) {
      setCalculatedArea(0);
      return;
    }
    const paths = points.map(p => new googleMaps.maps.LatLng(p.lat, p.lng));
    const areaM2 = googleMaps.maps.geometry.spherical.computeArea(paths);
    setCalculatedArea(areaM2 / 10000);
  };

  const closePolygon = () => {
    if (polygonCoords.length < 3) {
      alert('Selecione pelo menos 3 pontos no mapa antes de fechar!');
      return;
    }
    recalculatePathArea(polygonCoords);
    alert('Polígono fechado com sucesso! Clique em salvar após preencher os dados.');
  };

  const handleUndoPoint = () => {
    if (polygonCoords.length > 0) {
      const updated = [...polygonCoords];
      updated.pop();
      setPolygonCoords(updated);
      recalculatePathArea(updated);
    }
  };

  const handleClearAll = () => {
    setPolygonCoords([]);
    setCalculatedArea(0);
  };

  const startDrawingMode = () => {
    if (!canManage) return;
    setEditingTalhao(null);
    setMode('draw');
    setNome('');
    setSelectedColor(PRESET_COLORS[0].value);
    setPolygonCoords([]);
    setCalculatedArea(0);
  };

  const startEditMode = (talhao: Talhao) => {
    if (!canManage) return;
    setEditingTalhao(talhao);
    setMode('edit');
    setNome(talhao.nome);
    setSelectedColor(talhao.cor || PRESET_COLORS[0].value);
    setPolygonCoords(talhao.coordenadas || []);
    setCalculatedArea(talhao.areaHa || talhao.area || 0);
    centerOnTalhao(talhao);
  };

  const handleCancel = () => {
    setMode('view');
    setEditingTalhao(null);
    setNome('');
    setPolygonCoords([]);
    setCalculatedArea(0);
  };

  const handleDeleteTalhao = async (talhaoId: string) => {
    if (!canManage) return;
    if (!window.confirm('Tem certeza que deseja excluir este talhão?')) return;

    setLoading(true);
    try {
      await deleteDoc(doc(db, 'talhoes', talhaoId));
      onSelectTalhao(null);
      setMode('view');
    } catch (err) {
      handleFirestoreError(err, 'delete' as any, 'talhoes');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      alert('O nome do talhão é obrigatório.');
      return;
    }
    if (polygonCoords.length < 3) {
      alert('Desenhe o polígono adicionando pelo menos 3 vértices.');
      return;
    }

    setLoading(true);
    try {
      const isNew = mode === 'draw';
      const currentUser = auth.currentUser;

      const coordinatesArr: number[][][] = [
        [
          ...polygonCoords.map(p => [p.lng, p.lat]),
          [polygonCoords[0].lng, polygonCoords[0].lat]
        ]
      ];

      const geojsonSpec = {
        type: 'Feature',
        properties: { nome, cor: selectedColor },
        geometry: {
          type: 'Polygon',
          coordinates: coordinatesArr
        }
      };

      const talhaoData: any = {
        nome: nome.trim(),
        farmId,
        area: calculatedArea,
        areaHa: calculatedArea,
        coordenadas: polygonCoords,
        cor: selectedColor,
        producerId: currentUser?.uid || '',
        updatedAt: serverTimestamp()
      };

      if (isNew) {
        talhaoData.createdAt = serverTimestamp();
        talhaoData.geometria = JSON.stringify(geojsonSpec);
        await addDoc(collection(db, 'talhoes'), talhaoData);
        alert('Talhão criado com sucesso!');
      } else if (editingTalhao) {
        talhaoData.geometria = JSON.stringify(geojsonSpec);
        await updateDoc(doc(db, 'talhoes', editingTalhao.id), talhaoData);
        alert('Talhão atualizado com sucesso!');
      }

      setMode('view');
      setEditingTalhao(null);
      setNome('');
      setPolygonCoords([]);
      setCalculatedArea(0);
    } catch (err) {
      handleFirestoreError(err, 'create' as any, 'talhoes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 shadow-sm min-h-[640px]">
      
      {/* Sidebar Tool panel */}
      <div className="lg:col-span-4 bg-white p-6 flex flex-col justify-between border-r border-slate-100 max-h-[640px] overflow-y-auto">
        <div className="space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-black text-slate-800 text-lg">Mapeador</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  {mode === 'view' ? 'Visualização' : mode === 'draw' ? 'Desenho Ativo' : 'Edição de Área'}
                </p>
              </div>
            </div>
            
            {mode !== 'view' && (
              <button 
                onClick={handleCancel}
                className="p-1.5 hover:bg-slate-100 text-slate-400 rounded-lg transition-colors"
                title="Cancelar alterações"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {isAuthError && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3 text-amber-800 text-xs">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <div className="space-y-1">
                <p className="font-bold">Aviso: ApiProjectMapError</p>
                <p className="font-medium text-[11px] text-amber-700">
                  O Google Maps informou erro de projeto. <strong>Como corrigir:</strong> Habilite "Maps JavaScript API" e ative o faturamento (Billing) no Google Cloud Console.
                </p>
              </div>
            </div>
          )}

          {/* Form when drawing or editing */}
          {mode !== 'view' ? (
            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Nome do Talhão</label>
                <input 
                  type="text" 
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Ex: Talhão Sul 1A"
                  className="w-full text-sm font-semibold text-slate-800 px-4 py-3 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white"
                  required
                  disabled={loading}
                />
              </div>

              {/* Color Preset Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-slate-400" />
                  Cor do Polígono
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {PRESET_COLORS.map(color => (
                    <button
                      type="button"
                      key={color.value}
                      onClick={() => setSelectedColor(color.value)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform active:scale-90 ${selectedColor === color.value ? 'border-amber-500 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Real-time area display */}
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 space-y-1">
                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Área Estimada</p>
                <p className="text-2xl font-black">{calculatedArea.toFixed(2)} <span className="text-sm font-bold">ha</span></p>
                <p className="text-[10px] text-emerald-600 font-medium">Equivalente a {(calculatedArea * 10000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} m²</p>
              </div>

              {/* Tip instructions */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs font-medium space-y-1.5">
                <p className="font-semibold text-slate-700 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" /> 
                  {mode === 'draw' ? 'Instruções de Desenho:' : 'Instruções de Edição:'}
                </p>
                {mode === 'draw' ? (
                  <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
                    <li>Dê cliques sequenciais no mapa para desenhar o talhão</li>
                    <li>Clique no <strong>primeiro ponto (vermelho)</strong> para fechar</li>
                    <li>Use "Desfazer" para remover o último ponto inserido</li>
                  </ul>
                ) : (
                  <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
                    <li>Arraste os círculos brancos nos vértices para modificar</li>
                    <li>Arraste os círculos transparentes do meio para adicionar novos vértices</li>
                    <li>Clique com o <strong>botão direito</strong> em um vértice para apagá-lo</li>
                  </ul>
                )}
              </div>

              {/* Action operations in Draw mode */}
              {mode === 'draw' && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleUndoPoint}
                    disabled={polygonCoords.length === 0 || loading}
                    className="flex items-center justify-center gap-1.5 py-2 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-50 disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Desfazer
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    disabled={polygonCoords.length === 0 || loading}
                    className="flex items-center justify-center gap-1.5 py-2 border border-slate-200 text-rose-500 text-xs font-bold rounded-xl hover:bg-rose-50 disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Limpar
                  </button>
                </div>
              )}

              {/* Cancel and Save buttons */}
              <div className="flex gap-2 pt-2 border-t border-slate-50">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 py-3 text-center font-bold text-slate-500 text-sm hover:text-slate-800 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || polygonCoords.length < 3}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 text-center font-bold text-white bg-emerald-600 hover:bg-emerald-700 text-sm rounded-xl transition-colors disabled:opacity-50 shadow-md"
                >
                  <Save className="w-4 h-4" />
                  Salvar Talhão
                </button>
              </div>
            </form>
          ) : (
            // standard listing & tools selection
            <div className="space-y-6">
              
              {canManage && (
                <button
                  onClick={startDrawingMode}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-md"
                >
                  <Plus className="w-5 h-5" />
                  ➕ Novo Talhão
                </button>
              )}

              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Talhão Ativo / Selecionado</p>
                {selectedTalhao ? (
                  <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full shadow-inner border border-slate-100" 
                          style={{ backgroundColor: selectedTalhao.cor || '#10b981' }} 
                        />
                        <h4 className="font-bold text-slate-800 text-base">{selectedTalhao.nome}</h4>
                      </div>
                      <p className="text-xs text-slate-400 font-medium mt-1">Área total: {(selectedTalhao.areaHa !== undefined ? selectedTalhao.areaHa : selectedTalhao.area).toFixed(2)} ha</p>
                    </div>

                    {canManage && (
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
                        <button
                          onClick={() => startEditMode(selectedTalhao)}
                          className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          ✏️ Editar Talhão
                        </button>
                        <button
                          onClick={() => handleDeleteTalhao(selectedTalhao.id)}
                          className="flex items-center justify-center gap-1.5 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold text-xs rounded-xl"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          🗑️ Excluir Talhão
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 text-xs font-medium space-y-2">
                    <Layers className="w-8 h-8 mx-auto text-slate-300" />
                    <p>Selecione um talhão no mapa ou na lista abaixo para visualizar seus detalhes.</p>
                  </div>
                )}
              </div>

              {/* Instructions and help */}
              <div className="p-4 bg-blue-50 border border-blue-100 text-blue-800 rounded-2xl text-[11px] leading-relaxed font-semibold">
                💡 <strong>Dica de Navegação:</strong> Clique em qualquer polígono de talhão no mapa para ver nome, área exata e Diário Agronômico.
              </div>

            </div>
          )}

        </div>
        <div className="pt-4 border-t border-slate-50 text-[10px] text-slate-400 font-medium text-center">
          Projetado para Android e iOS • Google Maps Satélite
        </div>
      </div>

      {/* Map View Canvas */}
      <div className="lg:col-span-8 relative min-h-[400px] h-[550px] lg:h-[640px]">
        {/* Floating instructions Overlay when drawing or editing */}
        {mode !== 'view' && (
          <div className="absolute top-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-700/50 shadow-xl max-w-sm text-white">
            <div className="flex items-center gap-2">
              <div className="animate-ping w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
              <p className="text-xs font-black uppercase tracking-wider text-rose-400">
                {mode === 'draw' ? 'Desenho Ativo' : 'Edição Ativa'}
              </p>
            </div>
            <p className="text-[11px] font-medium text-slate-200 mt-1">
              {mode === 'draw' 
                ? 'Clique no mapa para criar pontos. Clique no primeiro ponto vermelho para fechar.' 
                : 'Arraste os vértices no mapa. Use os controles para salvar.'}
            </p>
            {calculatedArea > 0 && (
              <p className="text-xs font-bold text-emerald-400 mt-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Área calculada: {calculatedArea.toFixed(2)} ha
              </p>
            )}
          </div>
        )}

        <div ref={mapRef} className="w-full h-full rounded-b-3xl lg:rounded-b-none lg:rounded-r-3xl overflow-hidden" />
      </div>

    </div>
  );
}
