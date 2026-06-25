import React, { useState } from 'react';
import { useManutencoesExecutadas, usePlanosManutencao } from '../../hooks/useManutencao';
import { Equipamento, Abastecimento, IndicadorConsumo } from '../../types';
import { Settings, Droplets } from 'lucide-react';

interface MaquinaDetailsViewProps {
  farmId: string;
  maquina: Equipamento;
  maquinaAbastecimentos: Abastecimento[];
  indicador?: IndicadorConsumo;
  lastHorimetro: number;
}

export function MaquinaDetailsView({ farmId, maquina, maquinaAbastecimentos, indicador, lastHorimetro }: MaquinaDetailsViewProps) {
  const [activeTab, setActiveTab] = useState<'abastecimento' | 'manutencao'>('abastecimento');
  const { manutencoes } = useManutencoesExecutadas(farmId);
  const { planos } = usePlanosManutencao(farmId);

  const maquinaManutencoes = manutencoes.filter(m => m.equipamentoId === maquina.id);
  const maquinaPlanos = planos.filter(p => p.equipamentoId === maquina.id);

  return (
    <div>
      <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
         <div>
           <h3 className="text-xl font-black text-emerald-900">{maquina.nome}</h3>
           <p className="text-sm font-medium text-emerald-700 mt-1">Horímetro Atual: {lastHorimetro.toFixed(1)} h</p>
         </div>
         <div className="flex gap-4">
            <div className="text-right">
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Consumo</p>
              <p className="font-black text-emerald-800">{indicador?.litrosHora ? `${indicador.litrosHora.toFixed(1)} L/h` : '--'}</p>
            </div>
         </div>
      </div>

      <div className="mt-8 flex gap-2 border-b border-slate-200">
         <button
           onClick={() => setActiveTab('abastecimento')}
           className={`px-4 py-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'abastecimento' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
         >
           <Droplets className="w-4 h-4" />
           Abastecimentos
         </button>
         <button
           onClick={() => setActiveTab('manutencao')}
           className={`px-4 py-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'manutencao' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
         >
           <Settings className="w-4 h-4" />
           Manutenções
         </button>
      </div>

      <div className="mt-6">
         {activeTab === 'abastecimento' && (
           <div>
             {maquinaAbastecimentos.length === 0 ? (
               <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-slate-100">Sem registros de abastecimento.</div>
             ) : (
               <div className="overflow-x-auto bg-white border border-slate-100 rounded-xl">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold">
                         <th className="py-3 px-4">Data</th>
                         <th className="py-3 px-4">Horímetro</th>
                         <th className="py-3 px-4 text-right">Litros</th>
                         <th className="py-3 px-4 text-right">Valor Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {maquinaAbastecimentos.map(a => (
                        <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-medium text-slate-700">{a.dataAbastecimento.toLocaleDateString('pt-BR')}</td>
                          <td className="py-3 px-4 text-slate-600 font-medium">{a.horimetroAtual.toFixed(1)} h</td>
                          <td className="py-3 px-4 text-right font-bold text-slate-800">{a.litros.toFixed(1)} L</td>
                          <td className="py-3 px-4 text-right font-bold text-emerald-700">{a.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
             )}
           </div>
         )}

         {activeTab === 'manutencao' && (
           <div className="space-y-6">
             <div>
                <h4 className="font-bold text-slate-800 mb-4">Próximas Manutenções</h4>
                {maquinaPlanos.length === 0 ? (
                   <p className="text-sm text-slate-500">Nenhum plano associado.</p>
                ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                     {maquinaPlanos.map(p => {
                        const faltam = p.proximaExecucaoHorimetro - lastHorimetro;
                        const ok = faltam > 0;
                        return (
                          <div key={p.id} className={`p-4 rounded-xl border ${ok ? 'bg-white border-slate-200' : 'bg-rose-50 border-rose-200'}`}>
                             <p className="font-bold text-slate-800">{p.tipoManutencao}</p>
                             <div className="mt-2 flex justify-between items-end">
                                <div>
                                   <p className="text-xs text-slate-500 font-medium tracking-wide">PRÓXIMA (h)</p>
                                   <p className="text-lg font-black text-slate-700">{p.proximaExecucaoHorimetro.toFixed(1)}</p>
                                </div>
                                <div className="text-right">
                                  {ok ? (
                                    <span className="text-emerald-600 font-bold text-sm">Faltam {faltam.toFixed(1)}h</span>
                                  ) : (
                                    <span className="text-rose-600 font-bold text-sm">Vencida {Math.abs(faltam).toFixed(1)}h</span>
                                  )}
                                </div>
                             </div>
                          </div>
                        );
                     })}
                   </div>
                )}
             </div>

             <div>
               <h4 className="font-bold text-slate-800 mb-4">Histórico</h4>
               {maquinaManutencoes.length === 0 ? (
                 <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-slate-100">Sem registros de manutenção.</div>
               ) : (
                 <div className="overflow-x-auto bg-white border border-slate-100 rounded-xl">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold">
                           <th className="py-3 px-4">Data</th>
                           <th className="py-3 px-4">Horímetro</th>
                           <th className="py-3 px-4">Tipo</th>
                           <th className="py-3 px-4 text-right">Custo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {maquinaManutencoes.map(m => (
                          <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-medium text-slate-700">{new Date(m.dataExecucao).toLocaleDateString('pt-BR')}</td>
                            <td className="py-3 px-4 text-slate-600 font-medium">{m.horimetroExecucao.toFixed(1)} h</td>
                            <td className="py-3 px-4 text-slate-800 font-medium">{m.tipoManutencao}</td>
                            <td className="py-3 px-4 text-right font-bold text-emerald-700">
                              {m.custo > 0 ? m.custo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '--'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
               )}
             </div>
           </div>
         )}
      </div>
    </div>
  );
}
