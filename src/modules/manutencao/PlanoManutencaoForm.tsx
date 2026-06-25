import React, { useState } from 'react';
import { useEquipamentos } from '../../hooks/useEquipamentos';
import { usePlanosManutencao } from '../../hooks/useManutencao';
import { X, Save, Wrench } from 'lucide-react';

interface PlanoManutencaoFormProps {
  farmId: string;
  onClose: () => void;
}

export function PlanoManutencaoForm({ farmId, onClose }: PlanoManutencaoFormProps) {
  const { equipamentos } = useEquipamentos(farmId);
  const { addPlano } = usePlanosManutencao(farmId);

  const [equipamentoId, setEquipamentoId] = useState('');
  const [tipoManutencao, setTipoManutencao] = useState('');
  const [intervaloHoras, setIntervaloHoras] = useState('');

  const tiposDisponiveis = [
    'Troca de Óleo',
    'Troca de Filtro',
    'Lubrificação',
    'Revisão',
    'Pneus',
    'Correias',
    'Sistema Hidráulico',
    'Outros'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipamentoId || !tipoManutencao || !intervaloHoras) return;

    const maquina = equipamentos.find(eq => eq.id === equipamentoId);
    if (!maquina) return;

    try {
      await addPlano({
        equipamentoId,
        equipamentoNome: maquina.nome,
        tipoManutencao: tipoManutencao as any,
        intervaloHoras: Number(intervaloHoras),
        ultimaExecucaoHorimetro: maquina.horimetroAtual || 0,
        proximaExecucaoHorimetro: (maquina.horimetroAtual || 0) + Number(intervaloHoras),
        ativo: true
      });
      onClose();
    } catch (error) {
      console.error('Error adding plano:', error);
      alert('Erro ao registrar o plano. Tente novamente.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
              <Wrench className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Novo Plano</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                  {eq.nome} {eq.horimetroAtual ? `(${eq.horimetroAtual.toFixed(1)}h)` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Tipo de Manutenção</label>
            <select
              value={tipoManutencao}
              onChange={(e) => setTipoManutencao(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
              required
            >
              <option value="">Selecione o tipo...</option>
              {tiposDisponiveis.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Intervalo de Execução (Horas)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={intervaloHoras}
              onChange={(e) => setIntervaloHoras(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
              placeholder="Ex: 250"
              required
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar Plano
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
