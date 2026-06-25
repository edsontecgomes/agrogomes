import React, { useState } from 'react';
import { Talhao, Pluviometro, ChuvaComunitaria } from '../../types';
import { addDoc, collection, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { handleFirestoreError } from '../../utils/errorHandling';
import { Trash2, Navigation, Download, CloudOff, Loader2 } from 'lucide-react';
import { TalhaoWalkingDrawer } from './TalhaoWalkingDrawer';
import { downloadMapArea } from '../../utils/mapOffline';
import { HybridMap } from '../../components/map/HybridMap';

import { area as turfArea } from '@turf/area';
import { polygon as turfPolygon } from '@turf/helpers';

interface TalhoesMapProps {
  talhoes: Talhao[];
  pluviometros?: Pluviometro[];
  chuvas?: ChuvaComunitaria[];
  farmId: string;
  userRole: string;
  onSelectTalhao?: (talhao: Talhao) => void;
}

export function TalhoesMap({ 
  talhoes, 
  pluviometros = [], 
  chuvas = [], 
  farmId, 
  userRole,
  onSelectTalhao 
}: TalhoesMapProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isWalking, setIsWalking] = useState(false);
  const [newPolygon, setNewPolygon] = useState<any>(null);
  const [nome, setNome] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 });

  const canManage = userRole === 'admin' || userRole === 'gerente';

  const handleDownloadMap = async () => {
    if (!navigator.onLine) {
      alert('Você precisa estar online para baixar o mapa.');
      return;
    }

    setIsDownloading(true);
    try {
      const center = defaultCenter;
      await downloadMapArea(center[0], center[1], 5, 13, 18, (current, total) => {
        setDownloadProgress({ current, total });
      });
      alert('Mapa baixado com sucesso! Agora você pode visualizar esta área offline.');
    } catch (error) {
      console.error('Error downloading map:', error);
      alert('Erro ao baixar o mapa. Tente novamente.');
    } finally {
      setIsDownloading(false);
      setDownloadProgress({ current: 0, total: 0 });
    }
  };

  // Calculate area in hectares
  const calculateArea = (geojson: any): number => {
    try {
      const areaSquareMeters = turfArea(geojson);
      return areaSquareMeters / 10000; // Convert to hectares
    } catch (error) {
      console.error("Error calculating area:", error);
      return 0;
    }
  };

  const onCreated = (geojson: any, area: number) => {
    // If area is 0 (from Leaflet), calculate it
    const finalArea = area > 0 ? area : calculateArea(geojson);
    
    setNewPolygon({
      geojson,
      area: finalArea,
      layer: null // Layer is managed by the map components now
    });
    setIsCreating(true);
    setIsWalking(false);
  };

  const handleWalkingComplete = (geojson: any, area: number) => {
    setNewPolygon({
      geojson,
      area,
      layer: null // No Leaflet layer for walking mode
    });
    setIsCreating(true);
    setIsWalking(false);
  };

  const handleSaveTalhao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !newPolygon) return;

    try {
      await addDoc(collection(db, 'talhoes'), {
        nome,
        farmId,
        geometria: JSON.stringify(newPolygon.geojson),
        area: newPolygon.area,
        createdAt: serverTimestamp()
      });

      setIsCreating(false);
      setNewPolygon(null);
      setNome('');
    } catch (error) {
      handleFirestoreError(error, 'create' as any, 'talhoes');
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setNewPolygon(null);
    setNome('');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este talhão?')) {
      try {
        await deleteDoc(doc(db, 'talhoes', id));
      } catch (error) {
        handleFirestoreError(error, 'delete' as any, 'talhoes');
      }
    }
  };

  // Default center (Brazil approx) or first talhao
  const defaultCenter: [number, number] = talhoes.length > 0 && talhoes[0].geometria?.geometry?.coordinates?.[0]?.[0]
    ? [talhoes[0].geometria.geometry.coordinates[0][0][1], talhoes[0].geometria.geometry.coordinates[0][0][0]]
    : [-14.235, -51.925];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
        <div className="flex-1">
          <p className="text-sm text-blue-800">
            <strong>Dica:</strong> Use a ferramenta de polígono no canto superior direito do mapa ou o botão ao lado para desenhar novos talhões.
          </p>
          {!navigator.onLine && (
            <p className="text-xs text-amber-600 font-medium flex items-center gap-1 mt-1">
              <CloudOff className="w-3 h-3" />
              Você está em modo offline. Usando mapas em cache.
            </p>
          )}
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          {canManage && !isCreating && !isWalking && (
            <button
              onClick={() => setIsWalking(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
            >
              <Navigation className="w-4 h-4" />
              Desenhar por Caminhada
            </button>
          )}
          
          <button
            onClick={handleDownloadMap}
            disabled={isDownloading}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 text-sm font-bold rounded-xl transition-all shadow-sm disabled:opacity-50"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {Math.round((downloadProgress.current / downloadProgress.total) * 100) || 0}%
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Baixar Mapa Offline
              </>
            )}
          </button>
        </div>
      </div>

      {isWalking && (
        <TalhaoWalkingDrawer 
          onComplete={handleWalkingComplete} 
          onCancel={() => setIsWalking(false)} 
        />
      )}

      {isCreating && (
        <form onSubmit={handleSaveTalhao} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <h3 className="font-semibold text-slate-800">Salvar Novo Talhão</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Talhão</label>
              <input
                type="text"
                required
                value={nome}
                onChange={e => setNome(e.target.value)}
                className="w-full rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Ex: Talhão 01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Área Calculada</label>
              <input
                type="text"
                disabled
                value={`${newPolygon?.area.toFixed(2)} ha`}
                className="w-full rounded-xl border-slate-200 bg-slate-50 text-slate-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              Salvar Talhão
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-[600px] relative z-0">
        <HybridMap 
          talhoes={talhoes}
          pluviometros={pluviometros}
          chuvas={chuvas}
          farmId={farmId}
          userRole={userRole}
          onPolygonCreated={onCreated}
          onPolygonDeleted={handleDelete}
          onTalhaoClick={onSelectTalhao}
        />
      </div>
    </div>
  );
}
