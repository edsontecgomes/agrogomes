import React, { useState } from 'react';
import { useEquipamentos } from '../../hooks/useEquipamentos';
import { useAbastecimentos } from '../../hooks/useAbastecimentos';
import { useHorimetros } from '../../hooks/useHorimetros';
import { useIndicadoresConsumo } from '../../hooks/useIndicadoresConsumo';
import { AbastecimentoForm } from './AbastecimentoForm';
import { HorimetroForm } from './HorimetroForm';
import { ManutencaoDashboard } from '../manutencao/ManutencaoDashboard';
import { MaquinaDetailsView } from './MaquinaDetailsView';
import { Fuel, Clock, Calculator, AlertTriangle, TrendingDown, Plus, Beaker, Zap, Activity } from 'lucide-react';
import { motion } from 'motion/react';

interface CombustivelDashboardProps {
  farmId: string;
}

export function CombustivelDashboard({ farmId }: CombustivelDashboardProps) {
  const { equipamentos } = useEquipamentos(farmId);
  const { abastecimentos } = useAbastecimentos(farmId);
  const { horimetros } = useHorimetros(farmId);
  const { indicadores } = useIndicadoresConsumo(farmId);

  const [activeTab, setActiveTab] = useState<'overview' | 'maquinas' | 'alertas'>('overview');
  const [selectedMaquina, setSelectedMaquina] = useState<string | null>(null);
  const [showAbastecimentoForm, setShowAbastecimentoForm] = useState(false);
  const [showHorimetroForm, setShowHorimetroForm] = useState(false);

  // Indicators mapping
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const abastecimentosMes = abastecimentos.filter(a => {
    const d = a.dataAbastecimento;
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalLitrosMes = abastecimentosMes.reduce((acc, curr) => acc + curr.litros, 0);
  const totalValorMes = abastecimentosMes.reduce((acc, curr) => acc + curr.valorTotal, 0);

  const maquinasAtivas = equipamentos.filter(eq => eq.tipo === 'maquina');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Fuel className="w-8 h-8 text-emerald-600" />
            Combustível & Máquinas
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Gestão de horímetros, consumo e custos operacionais
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHorimetroForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl shadow-sm transition-all active:scale-95 text-sm"
          >
            <Clock className="w-4 h-4 text-emerald-600" />
            Horímetro
          </button>
          <button
            onClick={() => setShowAbastecimentoForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm shadow-emerald-200/50 transition-all active:scale-95 text-sm"
          >
            <Plus className="w-4 h-4" />
            Abastecimento
          </button>
        </div>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Beaker className="w-5 h-5" />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Gasto no Mês</p>
          </div>
          <p className="text-2xl font-black text-slate-800">
            {totalLitrosMes.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} <span className="text-sm font-bold text-slate-400">L</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <Calculator className="w-5 h-5" />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Custo no Mês</p>
          </div>
          <p className="text-2xl font-black text-slate-800">
             {totalValorMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Zap className="w-5 h-5" />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Registros (Mês)</p>
          </div>
          <p className="text-2xl font-black text-slate-800">
            {abastecimentosMes.length}
          </p>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Máquinas Ativas</p>
          </div>
          <p className="text-2xl font-black text-slate-800">
            {maquinasAtivas.length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'overview' ? 'text-emerald-700 border-b-2 border-emerald-500 bg-emerald-50/30' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Últimos Registros
          </button>
          <button
            onClick={() => setActiveTab('maquinas')}
            className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'maquinas' ? 'text-emerald-700 border-b-2 border-emerald-500 bg-emerald-50/30' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Frota & Consumo
          </button>
          <button
            onClick={() => setActiveTab('alertas')}
            className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'alertas' ? 'text-rose-700 border-b-2 border-rose-500 bg-rose-50/30' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Alertas & Manutenção
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800">Histórico Recente</h3>
              {abastecimentos.length === 0 ? (
                <div className="text-center py-10 text-slate-400">Nenhum abastecimento registrado.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-500 font-semibold">
                         <th className="pb-3 px-2">Data</th>
                         <th className="pb-3 px-2">Máquina</th>
                         <th className="pb-3 px-2 text-right">Litros</th>
                         <th className="pb-3 px-2 text-right">R$ / L</th>
                         <th className="pb-3 px-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {abastecimentos.slice(0, 10).map((a) => (
                        <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                          <td className="py-3 px-2 font-medium text-slate-700">{a.dataAbastecimento.toLocaleDateString('pt-BR')}</td>
                          <td className="py-3 px-2 text-slate-600 font-medium">{a.maquinaNome}</td>
                          <td className="py-3 px-2 text-right font-bold text-slate-800">{a.litros.toFixed(1)} L</td>
                          <td className="py-3 px-2 text-right text-slate-500">{a.valorLitro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                          <td className="py-3 px-2 text-right font-bold text-emerald-700">{a.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'maquinas' && !selectedMaquina && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {maquinasAtivas.map(maquina => {
                 const indicador = indicadores.find(i => i.maquinaId === maquina.id);
                 const hms = horimetros.filter(h => h.maquinaId === maquina.id);
                 const lastHorimetro = maquina.horimetroAtual || (hms.length > 0 ? hms[0].horimetroAtual : 0);
                 
                 return (
                   <div key={maquina.id} onClick={() => setSelectedMaquina(maquina.id)} className="p-4 border border-slate-100 rounded-xl bg-slate-50 space-y-3 cursor-pointer hover:border-emerald-200 hover:shadow-sm transition-all">
                     <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-800">{maquina.nome}</h4>
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold">
                           {lastHorimetro > 0 ? `${lastHorimetro.toFixed(1)} h` : 'S/ Reg.'}
                        </span>
                     </div>
                     <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="p-3 bg-white rounded-lg border border-slate-150">
                           <p className="text-[10px] text-slate-400 font-bold uppercase">Consumo Médio</p>
                           <p className="text-lg font-black text-slate-700">
                             {indicador?.litrosHora ? indicador.litrosHora.toFixed(1) : '--'} <span className="text-xs font-medium">L/h</span>
                           </p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-slate-150">
                           <p className="text-[10px] text-slate-400 font-bold uppercase">Custo Operacional</p>
                           <p className="text-lg font-black text-slate-700">
                             {indicador?.custoHora ? indicador.custoHora.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '--'} <span className="text-xs font-medium">/h</span>
                           </p>
                        </div>
                     </div>
                     <div className="pt-2 text-center border-t border-slate-100 text-xs font-medium text-emerald-600">
                       Ver Histórico Completo &rarr;
                     </div>
                   </div>
                 );
               })}
               {maquinasAtivas.length === 0 && (
                 <div className="col-span-full text-center py-10 text-slate-500">Nenhuma máquina cadastrada em Equipamentos.</div>
               )}
             </div>
          )}

          {activeTab === 'maquinas' && selectedMaquina && (
            <div className="space-y-6">
               <button onClick={() => setSelectedMaquina(null)} className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1">
                 &larr; Voltar para Máquinas
               </button>
               
               {(() => {
                 const maquina = maquinasAtivas.find(m => m.id === selectedMaquina);
                 if (!maquina) return null;
                 const maquinaAbastecimentos = abastecimentos.filter(a => a.maquinaId === maquina.id);
                 const hms = horimetros.filter(h => h.maquinaId === maquina.id);
                 const indicador = indicadores.find(i => i.maquinaId === maquina.id);
                 const lastHorimetro = maquina.horimetroAtual || (hms.length > 0 ? hms[0].horimetroAtual : 0);

                 // Para não usar hooks dentro da render flag, podemos usar um state superior ou apenas controlar o estado na própria página.
                 // Mas como React pode reclamar se adicionarmos useState no meio de (() => {})()
                 // vamos renderizar e no topo adicionar a var.
                 return (
                   <MaquinaDetailsView 
                     farmId={farmId} 
                     maquina={maquina} 
                     maquinaAbastecimentos={maquinaAbastecimentos} 
                     indicador={indicador} 
                     lastHorimetro={lastHorimetro} 
                   />
                 );
               })()}
            </div>
          )}

          {activeTab === 'alertas' && (
             <div className="space-y-6">
                 <ManutencaoDashboard farmId={farmId} />
             </div>
          )}
        </div>
      </div>


      {showAbastecimentoForm && (
        <AbastecimentoForm 
          farmId={farmId} 
          onClose={() => setShowAbastecimentoForm(false)} 
        />
      )}

      {showHorimetroForm && (
        <HorimetroForm 
          farmId={farmId} 
          onClose={() => setShowHorimetroForm(false)} 
        />
      )}
    </div>
  );
}
