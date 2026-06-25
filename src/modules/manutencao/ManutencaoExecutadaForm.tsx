import React, { useState, useEffect } from 'react';
import { useEquipamentos } from '../../hooks/useEquipamentos';
import { usePlanosManutencao, useManutencoesExecutadas } from '../../hooks/useManutencao';
import { X, Save, CheckCircle2 } from 'lucide-react';
import { PlanoManutencao } from '../../types';

interface ManutencaoExecutadaFormProps {
  farmId: string;
  equipamentoId?: string;
  planoId?: string;
  onClose: () => void;
}

export function ManutencaoExecutadaForm({ farmId, equipamentoId: initialEquip, planoId: initialPlano, onClose }: ManutencaoExecutadaFormProps) {
  const { equipamentos } = useEquipamentos(farmId);
  const { planos, updatePlano } = usePlanosManutencao(farmId);
  const { addManutencao } = useManutencoesExecutadas(farmId);

  const [equipamentoId, setEquipamentoId] = useState(initialEquip || '');
  const [planoId, setPlanoId] = useState(initialPlano || '');
  const [tipoManutencao, setTipoManutencao] = useState('');
  const [horimetroExecucao, setHorimetroExecucao] = useState('');
  const [dataExecucao, setDataExecucao] = useState(new Date().toISOString().slice(0, 10));
  const [custo, setCusto] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [descricao, setDescricao] = useState('');

  // Update type and default values based on selected plan
  useEffect(() => {
    if (planoId) {
      const p = planos.find(x => x.id === planoId);
      if (p) {
        setEquipamentoId(p.equipamentoId);
        setTipoManutencao(p.tipoManutencao);
        const eq = equipamentos.find(e => e.id === p.equipamentoId);
        if (eq?.horimetroAtual) {
          setHorimetroExecucao(eq.horimetroAtual.toString());
        }
      }
    }
  }, [planoId, planos, equipamentos]);

  // Update defaults based on equip
  useEffect(() => {
    if (equipamentoId && !planoId) {
      const eq = equipamentos.find(e => e.id === equipamentoId);
      if (eq?.horimetroAtual && !horimetroExecucao) {
        setHorimetroExecucao(eq.horimetroAtual.toString());
      }
    }
  }, [equipamentoId]);

  const planosDaMaquina = planos.filter(p => !equipamentoId || p.equipamentoId === equipamentoId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipamentoId || !tipoManutencao || !horimetroExecucao || !dataExecucao) return;

    try {
      const hExecu = Number(horimetroExecucao);
      await addManutencao({
        equipamentoId,
        planoId: planoId || undefined,
        tipoManutencao,
        horimetroExecucao: hExecu,
        dataExecucao: new Date(dataExecucao + 'T12:00:00Z'),
        custo: Number(custo) || 0,
        responsavel,
        descricao,
        observacao: ''
      });

      // Se estivesse ligado a um plano, atualiza o plano
      if (planoId) {
        const plano = planos.find(p => p.id === planoId);
        if (plano) {
           await updatePlano(plano.id, {
             ultimaExecucaoHorimetro: hExecu,
             proximaExecucaoHorimetro: hExecu + plano.intervaloHoras
           });
        }
      }

      onClose();
    } catch (error) {
      console.error('Error adding execution:', error);
      alert('Erro ao registrar a manutenção. Tente novamente.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Registrar Execução</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <form id="execucao-manutencao" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Máquina</label>
              <select
                value={equipamentoId}
                onChange={(e) => setEquipamentoId(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
                required
              >
                <option value="">Selecione uma máquina...</option>
                {equipamentos.map(eq => (
                  <option key={eq.id} value={eq.id}>
                    {eq.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Vincular a um Plano Preventivo (Opcional)</label>
              <select
                value={planoId}
                onChange={(e) => setPlanoId(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
              >
                <option value="">Manutenção Avulsa / Corretiva</option>
                {planosDaMaquina.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.equipamentoNome} - {p.tipoManutencao} (a cada {p.intervaloHoras}h)
                  </option>
                ))}
              </select>
            </div>

            {!planoId && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tipo de Manutenção</label>
                <input
                  type="text"
                  value={tipoManutencao}
                  onChange={(e) => setTipoManutencao(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
                  placeholder="Ex: Reparo Hidráulico"
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Data</label>
                <input
                  type="date"
                  value={dataExecucao}
                  onChange={(e) => setDataExecucao(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Horímetro</label>
                <input
                  type="number"
                  step="0.1"
                  value={horimetroExecucao}
                  onChange={(e) => setHorimetroExecucao(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Responsável</label>
                <input
                  type="text"
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                  placeholder="Mecânico / Oficina"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Custo Total (Opcional)</label>
                <input
                  type="number"
                  step="0.01"
                  value={custo}
                  onChange={(e) => setCusto(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                  placeholder="R$ 0,00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Descrição dos Serviços / Peças</label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium min-h-[100px]"
                placeholder="Detalhes do que foi feito..."
              />
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="execucao-manutencao"
            className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
