import React, { useState } from 'react';
import { useEquipamentos } from '../../hooks/useEquipamentos';
import { usePlanosManutencao, useManutencoesExecutadas } from '../../hooks/useManutencao';
import { PlanoManutencaoForm } from './PlanoManutencaoForm';
import { ManutencaoExecutadaForm } from './ManutencaoExecutadaForm';
import { Plus, CheckCircle2, AlertTriangle, AlertOctagon, Wrench, Calendar, Clock, DollarSign } from 'lucide-react';

interface ManutencaoDashboardProps {
  farmId: string;
}

export function ManutencaoDashboard({ farmId }: ManutencaoDashboardProps) {
  const { equipamentos } = useEquipamentos(farmId);
  const { planos } = usePlanosManutencao(farmId);
  const { manutencoes } = useManutencoesExecutadas(farmId);

  const [showPlanoForm, setShowPlanoForm] = useState(false);
  const [showExecucaoForm, setShowExecucaoForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'planos' | 'historico'>('planos');

  // Calcular status
  const getStatusInfo = (plano: any) => {
    const maquina = equipamentos.find(e => e.id === plano.equipamentoId);
    const horimetroAtual = maquina?.horimetroAtual || plano.ultimaExecucaoHorimetro;
    const faltam = plano.proximaExecucaoHorimetro - horimetroAtual;
    const perRestante = (faltam / plano.intervaloHoras) * 100;

    let statusType = 'ok';
    if (faltam <= 0) {
      statusType = 'danger';
    } else if (perRestante <= 20) {
      statusType = 'warning';
    }

    return { faltam, perRestante, statusType, horimetroAtual };
  };

  const planosAtrasados = planos.filter(p => getStatusInfo(p).statusType === 'danger');
  const planosProximos = planos.filter(p => getStatusInfo(p).statusType === 'warning');

  // Agrupar execucoes para mostrar valor total?
  const custoTotal = manutencoes.reduce((acc, m) => acc + (m.custo || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border text-center border-slate-200 rounded-2xl p-4 flex flex-col justify-center">
           <div className="flex justify-center mb-2">
             <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
               <AlertOctagon className="w-6 h-6" />
             </div>
           </div>
           <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Vencidas</p>
           <h3 className="text-2xl font-black text-rose-600">{planosAtrasados.length}</h3>
        </div>
        <div className="bg-white border text-center border-slate-200 rounded-2xl p-4 flex flex-col justify-center">
           <div className="flex justify-center mb-2">
             <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
               <AlertTriangle className="w-6 h-6" />
             </div>
           </div>
           <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Próximas</p>
           <h3 className="text-2xl font-black text-amber-600">{planosProximos.length}</h3>
        </div>
        <div className="bg-white border text-center border-slate-200 rounded-2xl p-4 flex flex-col justify-center">
           <div className="flex justify-center mb-2">
             <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
               <CheckCircle2 className="w-6 h-6" />
             </div>
           </div>
           <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Planos Ativos</p>
           <h3 className="text-2xl font-black text-slate-800">{planos.length}</h3>
        </div>
        <div className="bg-white border text-center border-slate-200 rounded-2xl p-4 flex flex-col justify-center">
           <div className="flex justify-center mb-2">
             <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
               <DollarSign className="w-6 h-6" />
             </div>
           </div>
           <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Custo Total</p>
           <h3 className="text-2xl font-black text-slate-800">{custoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h3>
        </div>
      </div>

      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shrink-0 overflow-x-auto gap-4">
         <div className="flex flex-col sm:flex-row gap-2 shrink-0">
           <button
             onClick={() => setActiveTab('planos')}
             className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors ${activeTab === 'planos' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}
           >
             Planos Preventivos
           </button>
           <button
             onClick={() => setActiveTab('historico')}
             className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors ${activeTab === 'historico' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}
           >
             Histórico de Execuções
           </button>
         </div>
         <div className="flex gap-2 shrink-0">
            <button
               onClick={() => setShowExecucaoForm(true)}
               className="px-4 py-2 bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-2"
            >
               <CheckCircle2 className="w-4 h-4" />
               Registrar Execução
            </button>
            <button
               onClick={() => setShowPlanoForm(true)}
               className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-2"
            >
               <Plus className="w-4 h-4" />
               Novo Plano
            </button>
         </div>
      </div>

      {activeTab === 'planos' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
           {planos.length === 0 ? (
             <div className="lg:col-span-2 text-center py-12 bg-white border border-slate-200 rounded-2xl text-slate-500">
               Nenhum plano cadastrado.
             </div>
           ) : (
             planos.map(plano => {
               const { faltam, perRestante, statusType, horimetroAtual } = getStatusInfo(plano);
               
               let cardClass = "bg-white border-slate-200";
               let badgeClass = "bg-emerald-100 text-emerald-700";
               let badgeText = "Em Dia";
               
               if (statusType === 'danger') {
                 cardClass = "bg-rose-50 border-rose-200";
                 badgeClass = "bg-rose-200 text-rose-800";
                 badgeText = "Atrasada";
               } else if (statusType === 'warning') {
                 cardClass = "bg-amber-50 border-amber-200";
                 badgeClass = "bg-amber-200 text-amber-800";
                 badgeText = "Atenção";
               }

               return (
                 <div key={plano.id} className={`p-5 rounded-2xl border ${cardClass} shadow-sm relative overflow-hidden`}>
                    {/* Status bar na base do card */}
                    <div className="absolute bottom-0 left-0 w-full h-1.5 bg-slate-100">
                      <div 
                         className={`h-full transition-all ${statusType === 'danger' ? 'bg-rose-500' : statusType === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                         style={{ width: `${Math.min(100, Math.max(0, 100 - perRestante))}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-start mb-4">
                       <div className="flex items-center gap-3">
                         <div className="p-2 bg-slate-100 rounded-xl shrink-0">
                           <Wrench className="w-5 h-5 text-slate-600" />
                         </div>
                         <div>
                           <h4 className="font-black text-slate-800 text-lg leading-tight">{plano.tipoManutencao}</h4>
                           <p className="text-slate-500 text-sm font-medium">{plano.equipamentoNome}</p>
                         </div>
                       </div>
                       <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wide ${badgeClass}`}>
                         {badgeText}
                       </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                       <div className="bg-white/60 p-3 rounded-xl border border-slate-100">
                         <p className="text-xs font-bold text-slate-500 uppercase">Intervalo</p>
                         <p className="font-black text-slate-800">{plano.intervaloHoras} h</p>
                       </div>
                       <div className="bg-white/60 p-3 rounded-xl border border-slate-100">
                         <p className="text-xs font-bold text-slate-500 uppercase">Próxima</p>
                         <p className="font-black text-slate-800">{plano.proximaExecucaoHorimetro.toFixed(1)} h</p>
                       </div>
                    </div>

                    <div className="mt-4 flex justify-between items-end pb-2">
                       <div className="flex flex-col">
                         <span className="text-xs font-medium text-slate-500">Horímetro Atual: {horimetroAtual.toFixed(1)}h</span>
                         <span className={`text-sm font-bold ${statusType === 'danger' ? 'text-rose-600' : 'text-slate-700'}`}>
                           {statusType === 'danger' 
                             ? `Vencida por ${Math.abs(faltam).toFixed(1)}h!` 
                             : `Faltam ${faltam.toFixed(1)}h`}
                         </span>
                       </div>
                    </div>
                 </div>
               );
             })
           )}
        </div>
      )}

      {activeTab === 'historico' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
           {manutencoes.length === 0 ? (
              <div className="text-center py-12 text-slate-500">Nenhum histórico encontrado.</div>
           ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs">
                    <th className="py-4 px-6">Data</th>
                    <th className="py-4 px-6">Máquina & Tipo</th>
                    <th className="py-4 px-6">Horímetro</th>
                    <th className="py-4 px-6 max-w-[200px] truncate">Serviço/Peças</th>
                    <th className="py-4 px-6 text-right">Custo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {manutencoes.map(m => {
                    const eq = equipamentos.find(e => e.id === m.equipamentoId);
                    return (
                      <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6 font-medium text-slate-700">
                          {new Date(m.dataExecucao).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-800">
                          {eq?.nome}
                          <span className="block text-xs font-medium text-slate-500">{m.tipoManutencao}</span>
                        </td>
                        <td className="py-4 px-6 font-medium text-slate-600">
                          {m.horimetroExecucao.toFixed(1)} h
                        </td>
                        <td className="py-4 px-6 text-slate-500 truncate max-w-[200px]">
                          {m.descricao || m.observacao || '--'}
                        </td>
                        <td className="py-4 px-6 text-right font-black text-emerald-700">
                          {m.custo > 0 ? m.custo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '--'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
           )}
        </div>
      )}

      {showPlanoForm && (
        <PlanoManutencaoForm farmId={farmId} onClose={() => setShowPlanoForm(false)} />
      )}
      {showExecucaoForm && (
        <ManutencaoExecutadaForm farmId={farmId} onClose={() => setShowExecucaoForm(false)} />
      )}
    </div>
  );
}
