import React, { useState } from 'react';
import { useEquipamentos } from '../../hooks/useEquipamentos';
import { useHorimetros } from '../../hooks/useHorimetros';
import { auth } from '../../services/firebase';
import { X, Save, Clock } from 'lucide-react';

interface HorimetroFormProps {
  farmId: string;
  onClose: () => void;
}

export function HorimetroForm({ farmId, onClose }: HorimetroFormProps) {
  const { equipamentos } = useEquipamentos(farmId);
  const { registrarHorimetro, horimetros } = useHorimetros(farmId);
  const user = auth.currentUser;

  const [maquinaId, setMaquinaId] = useState('');
  const [horimetroAtual, setHorimetroAtual] = useState('');
  const [observacao, setObservacao] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const maquinas = equipamentos.filter(eq => eq.tipo === 'maquina');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maquinaId || !horimetroAtual) {
      setError('Preencha os campos obrigatórios.');
      return;
    }

    const maquina = maquinas.find(m => m.id === maquinaId);
    if (!maquina) return;

    const numHorimetro = parseFloat(horimetroAtual);

    setSubmitting(true);
    setError('');

    try {
      // Encontrar horimetro anterior da maquina
      const ultimosHr = horimetros.filter(h => h.maquinaId === maquinaId);
      const horimetroAnteriorObj = ultimosHr.length > 0 ? ultimosHr[0] : null;
      const horimetroAnterior = horimetroAnteriorObj ? horimetroAnteriorObj.horimetroAtual : 0;

      if (numHorimetro < horimetroAnterior) {
        throw new Error(`Horímetro atual (${numHorimetro}) não pode ser menor que o anterior (${horimetroAnterior}).`);
      }

      await registrarHorimetro({
        maquinaId,
        maquinaNome: maquina.nome,
        horimetroAnterior,
        horimetroAtual: numHorimetro,
        dataRegistro: new Date(),
        operadorId: user?.uid || '',
        operadorNome: user?.displayName || 'Operador',
        observacao
      });

      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao salvar. Verifique conexão e tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-100 text-sky-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Novo Horímetro</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-sm font-medium rounded-xl border border-rose-200">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Máquina *</label>
              <select
                value={maquinaId}
                onChange={e => setMaquinaId(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                required
              >
                <option value="">Selecione uma máquina...</option>
                {maquinas.map(m => (
                  <option key={m.id} value={m.id}>{m.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Horímetro Atual *</label>
              <input
                type="number"
                step="0.1"
                value={horimetroAtual}
                onChange={e => setHorimetroAtual(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder="Ex: 5600.5"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Observações</label>
              <textarea
                value={observacao}
                onChange={e => setObservacao(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none h-24"
                placeholder="Observações adicionais..."
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || !maquinaId || !horimetroAtual}
              className="flex-1 flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-colors disabled:opacity-50"
            >
              {submitting ? 'Salvando...' : (
                <>
                  <Save className="w-5 h-5" />
                  Registrar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
