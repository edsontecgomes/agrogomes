import React, { useState } from 'react';
import { useTalhoes } from '../../hooks/useTalhoes';
import { useUsuarioProfile } from '../../hooks/useUsuarios';
import { usePluviometros } from '../../hooks/usePluviometros';
import { useChuvasComunitarias } from '../../hooks/useChuvasComunitarias';
import { auth } from '../../services/firebase';
import { TalhaoMapEditor } from './TalhaoMapEditor';
import { TalhaoHistorico } from './TalhaoHistorico';
import { Talhao } from '../../types';
import { ChevronRight, MapPin } from 'lucide-react';

interface TalhoesDashboardProps {
  farmId: string;
}

export function TalhoesDashboard({ farmId }: TalhoesDashboardProps) {
  const { talhoes, loading: loadingTalhoes } = useTalhoes(farmId);
  const { pluviometros } = usePluviometros(farmId);
  const { chuvasComunitarias } = useChuvasComunitarias(farmId);
  const { usuario, loading: loadingUser } = useUsuarioProfile(auth.currentUser?.uid);
  const [selectedTalhao, setSelectedTalhao] = useState<Talhao | null>(null);

  if (loadingTalhoes || loadingUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gestão de Talhões</h1>
          <p className="text-slate-500 mt-2">Desenhe e gerencie as áreas da sua fazenda.</p>
        </div>
      </div>

      <TalhaoMapEditor 
        talhoes={talhoes} 
        farmId={farmId} 
        userRole={usuario?.role || 'colaborador'} 
        selectedTalhao={selectedTalhao}
        onSelectTalhao={setSelectedTalhao}
      />

      {talhoes.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-[32px] p-8 text-center max-w-2xl mx-auto shadow-sm">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <MapPin className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-amber-900 mb-2">Primeiros Passos com Mapas</h2>
          <p className="text-amber-700 mb-8 max-w-md mx-auto">Você ainda não mapeou seus talhões. Utilize o mapa acima para começar a desenhar suas áreas por caminhada ou manual.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-6 py-3 bg-amber-600 text-white font-bold rounded-xl active:scale-95 transition-all">
              Tutorial de Mapeamento
            </button>
          </div>
        </div>
      )}

      {selectedTalhao && (
        <TalhaoHistorico 
          talhao={selectedTalhao} 
          onClose={() => setSelectedTalhao(null)} 
        />
      )}

      {/* Talhoes List for easy access */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {talhoes.map(t => (
          <button 
            key={t.id}
            onClick={() => setSelectedTalhao(t)}
            className="text-left bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">{t.nome}</h3>
              <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg uppercase tracking-widest">
                {t.area.toFixed(2)} ha
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4 truncate">Área mapeada e produtiva</p>
            <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
              Ver Diário Agronômico
              <ChevronRight className="w-3 h-3" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
