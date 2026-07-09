import React, { useState } from 'react';
import { useOrdensServico } from '../../hooks/useServicos';
import { useEstoque } from '../../hooks/useEstoque';
import { useUsuario, useUsuarios } from '../../hooks/useUsuarios';
import { useTalhoes } from '../../hooks/useTalhoes';
import { OrdensList } from './OrdensList';
import { EstoqueList } from './EstoqueList';
import { ExecucoesMap } from './ExecucoesMap';
import { ChecklistTemplates } from './ChecklistTemplates';
import { ClipboardList, Package, Map as MapIcon, ClipboardCheck } from 'lucide-react';

import { useFarm } from '../../contexts/FarmContext';

interface ServicosDashboardProps {
  farmId: string;
}

export function ServicosDashboard({ farmId }: ServicosDashboardProps) {
  const { activeFarm } = useFarm();
  const { usuario, loading: loadingUser } = useUsuario(farmId);
  const { ordens, loading: loadingOrdens } = useOrdensServico(farmId);
  const { estoque, loading: loadingEstoque } = useEstoque(farmId);
  const { usuarios, loading: loadingUsuarios } = useUsuarios(farmId);
  const { talhoes, loading: loadingTalhoes } = useTalhoes(farmId);
  
  const [activeTab, setActiveTab] = useState<'ordens' | 'estoque' | 'mapa' | 'checklists'>('ordens');

  if (loadingUser || loadingOrdens || loadingEstoque || loadingUsuarios || loadingTalhoes) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!usuario) return null;

  const canManage = usuario.role === 'admin' || usuario.role === 'gerente';
  const userRole = usuario.role ?? "operador";

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Módulo de Serviços</h1>
          <p className="text-slate-500 mt-1">Gestão de ordens de serviço e estoque</p>
        </div>
      </div>

      {talhoes.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
              <MapIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">Mapeamento Incompleto</p>
              <p className="text-xs text-amber-700">Cadastre seus talhões para desbloquear recursos de mapas e filtros por área.</p>
            </div>
          </div>
          <button 
            onClick={() => {
              const event = new CustomEvent('set-active-module', { detail: 'talhoes' });
              window.dispatchEvent(event);
            }}
            className="px-4 py-2 bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm"
          >
            Cadastrar Agora
          </button>
        </div>
      )}

      {canManage && (
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-fit flex-wrap">
          <button
            onClick={() => setActiveTab('ordens')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'ordens' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Ordens de Serviço
          </button>
          <button
            onClick={() => setActiveTab('estoque')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'estoque' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <Package className="w-4 h-4" />
            Estoque
          </button>
          <button
            onClick={() => setActiveTab('mapa')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'mapa' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            Mapa de Execuções
          </button>
          <button
            onClick={() => setActiveTab('checklists')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'checklists' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            Checklists
          </button>
        </div>
      )}

      {activeTab === 'ordens' && (
        <OrdensList 
          ordens={ordens} 
          farmId={farmId} 
          userRole={userRole} 
          usuarios={usuarios} 
          usuarioId={usuario.id}
          estoque={estoque}
          talhoes={talhoes}
        />
      )}
      
      {activeTab === 'estoque' && (
        <EstoqueList estoque={estoque} farmId={farmId} userRole={usuario.role} />
      )}

      {activeTab === 'mapa' && (
        <ExecucoesMap farmId={farmId} usuarios={usuarios} estoque={estoque} />
      )}

      {activeTab === 'checklists' && canManage && (
        <ChecklistTemplates farmId={farmId} />
      )}
    </div>
  );
}
