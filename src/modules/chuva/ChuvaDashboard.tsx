import React, { useState, useMemo } from 'react';
import { usePluviometros } from '../../hooks/usePluviometros';
import { useChuvasComunitarias } from '../../hooks/useChuvasComunitarias';
import { useTalhoes } from '../../hooks/useTalhoes';
import { ChuvaForm } from './ChuvaForm';
import { Map } from '../../components/Map';
import { CloudRain, MapPin, Calendar, Plus, Filter } from 'lucide-react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../services/firebase';

import { useFarm } from '../../contexts/FarmContext';

interface ChuvaDashboardProps {
  farmId: string;
}

type FilterType = 'hoje' | '7dias' | '30dias' | 'personalizado' | 'todos';

export function ChuvaDashboard({ farmId }: ChuvaDashboardProps) {
  const { activeFarm } = useFarm();
  const { pluviometros, loading: loadingPluviometros } = usePluviometros(farmId);
  const { chuvasComunitarias, loading: loadingChuvas } = useChuvasComunitarias(farmId);
  const { talhoes } = useTalhoes(farmId);

  const [filterType, setFilterType] = useState<FilterType>('30dias');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const handleSeedPluviometro = async () => {
    await addDoc(collection(db, 'pluviometros'), {
      nome: 'Pluviômetro Sede',
      location: { lat: -14.235, lng: -51.925 }, // Center of Brazil
      farmId
    });
  };

  const filteredChuvas = useMemo(() => {
    if (filterType === 'todos') return chuvasComunitarias;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return chuvasComunitarias.filter(chuva => {
      const chuvaDate = new Date(chuva.timestamp);
      const chuvaDay = new Date(chuvaDate.getFullYear(), chuvaDate.getMonth(), chuvaDate.getDate());

      switch (filterType) {
        case 'hoje':
          return chuvaDay.getTime() === today.getTime();
        case '7dias': {
          const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setDate(today.getDate() - 7);
          return chuvaDay >= sevenDaysAgo && chuvaDay <= today;
        }
        case '30dias': {
          const thirtyDaysAgo = new Date(today);
          thirtyDaysAgo.setDate(today.getDate() - 30);
          return chuvaDay >= thirtyDaysAgo && chuvaDay <= today;
        }
        case 'personalizado': {
          if (!customStartDate || !customEndDate) return true;
          const start = new Date(customStartDate + 'T00:00:00');
          const end = new Date(customEndDate + 'T23:59:59');
          return chuvaDate >= start && chuvaDate <= end;
        }
        default:
          return true;
      }
    });
  }, [chuvasComunitarias, filterType, customStartDate, customEndDate]);

  if (loadingPluviometros || loadingChuvas) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalRain = filteredChuvas.reduce((sum, c) => sum + c.mm, 0);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Módulo de Chuvas</h1>
          <p className="text-slate-500 mt-1">Gestão pluviométrica da fazenda</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
            <Filter className="w-4 h-4 text-slate-400 ml-2" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="bg-transparent border-none text-sm font-medium text-slate-700 focus:ring-0 cursor-pointer"
            >
              <option value="hoje">Hoje</option>
              <option value="7dias">Últimos 7 dias</option>
              <option value="30dias">Últimos 30 dias</option>
              <option value="todos">Todo o período</option>
              <option value="personalizado">Personalizado</option>
            </select>
            
            {filterType === 'personalizado' && (
              <div className="flex items-center gap-2 border-l border-slate-200 pl-2 ml-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="text-sm border-slate-200 rounded-md py-1 px-2"
                />
                <span className="text-slate-400 text-sm">até</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="text-sm border-slate-200 rounded-md py-1 px-2"
                />
              </div>
            )}
          </div>

          <div className="bg-blue-50 px-4 py-2 rounded-xl flex items-center gap-3 border border-blue-100">
            <CloudRain className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">Volume no Período</p>
              <p className="text-lg font-bold text-blue-900">{totalRain.toFixed(1)} mm</p>
            </div>
          </div>
        </div>
      </div>

      {talhoes.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
               <MapPin className="w-5 h-5" />
             </div>
             <div>
               <p className="text-sm font-bold text-amber-900">Mapeamento Geográfico</p>
               <p className="text-xs text-amber-700">A correlação entre chuva e produtividade requer o mapeamento dos talhões.</p>
             </div>
          </div>
          <button 
            onClick={() => {
              const event = new CustomEvent('set-active-module', { detail: 'talhoes' });
              window.dispatchEvent(event);
            }}
            className="px-4 py-2 bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm"
          >
            Cadastrar Talhões
          </button>
        </div>
      )}

      {pluviometros.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between">
          <p className="text-amber-800 text-sm">Nenhum pluviômetro cadastrado para esta fazenda.</p>
          <button 
            onClick={handleSeedPluviometro}
            className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Criar Pluviômetro de Teste
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <ChuvaForm pluviometros={pluviometros} farmId={farmId} />
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              Registros no Período
            </h3>
            
            {filteredChuvas.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Nenhum registro encontrado para este período.</p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {filteredChuvas.slice(0, 50).map(chuva => {
                  const pluv = pluviometros.find(p => p.id === chuva.pluviometroId);
                  const date = chuva.timestamp;
                  
                  return (
                    <div key={chuva.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{pluv?.nome || 'Desconhecido'}</p>
                        <p className="text-xs text-slate-500">
                          {date.toLocaleDateString('pt-BR')} às {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="font-bold text-blue-600">
                        {chuva.mm.toFixed(1)} mm
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            Mapa de Pluviômetros
          </h3>
          <Map pluviometros={pluviometros} chuvasComunitarias={filteredChuvas} />
        </div>
      </div>
    </div>
  );
}
