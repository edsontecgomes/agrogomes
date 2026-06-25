import React, { useState } from 'react';
import { useEquipamentos } from '../../hooks/useEquipamentos';
import { useAbastecimentos } from '../../hooks/useAbastecimentos';
import { useHorimetros } from '../../hooks/useHorimetros';
import { useIndicadoresConsumo } from '../../hooks/useIndicadoresConsumo';
import { X, Save, Fuel } from 'lucide-react';
import { auth, db } from '../../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface AbastecimentoFormProps {
  farmId: string;
  onClose: () => void;
}

export function AbastecimentoForm({ farmId, onClose }: AbastecimentoFormProps) {
  const { equipamentos } = useEquipamentos(farmId);
  const { registrarAbastecimento, abastecimentos } = useAbastecimentos(farmId);
  const { registrarHorimetro, horimetros } = useHorimetros(farmId);
  const { atualizarIndicador } = useIndicadoresConsumo(farmId);
  const user = auth.currentUser;

  const [maquinaId, setMaquinaId] = useState('');
  const [horimetroAtual, setHorimetroAtual] = useState('');
  const [litros, setLitros] = useState('');
  const [valorLitro, setValorLitro] = useState('');
  const [posto, setPosto] = useState('');
  const [observacoes, setObservacoes] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const maquinas = equipamentos.filter(eq => eq.tipo === 'maquina');

  // Calcular valor total automaticamente
  const numLitros = parseFloat(litros) || 0;
  const numValorLitro = parseFloat(valorLitro.replace(',', '.')) || 0;
  const valorTotal = numLitros * numValorLitro;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maquinaId || !horimetroAtual || !litros || !valorLitro) {
      setError('Preencha os campos obrigatórios.');
      return;
    }

    const maquina = maquinas.find(m => m.id === maquinaId);
    if (!maquina) return;

    const numHorimetro = parseFloat(horimetroAtual);

    setSubmitting(true);
    setError('');

    try {
      // Registrar horimetro
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
        observacao: `Registro via abastecimento. ${observacoes}`
      });

      // Registrar abastecimento
      await registrarAbastecimento({
        maquinaId,
        maquinaNome: maquina.nome,
        operadorId: user?.uid || '',
        operadorNome: user?.displayName || 'Operador',
        dataAbastecimento: new Date(),
        horimetroAtual: numHorimetro,
        litros: numLitros,
        valorLitro: numValorLitro,
        valorTotal,
        postoCombustivel: posto,
        observacoes
      });

      // Calcular consumo iterativo se houver abastecimento anterior proximo
      const ultimosAbast = abastecimentos.filter(a => a.maquinaId === maquinaId);
      if (ultimosAbast.length > 0) {
        const abastAnterior = ultimosAbast[0];
        const horasTrabalhadas = numHorimetro - abastAnterior.horimetroAtual;
        
        if (horasTrabalhadas > 0) {
           const litrosHora = numLitros / horasTrabalhadas;
           const custoHora = valorTotal / horasTrabalhadas;

           await atualizarIndicador(maquinaId, {
             litrosHora,
             custoHora
           });
        }
      }

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
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
              <Fuel className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Novo Abastecimento</h2>
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
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Selecione uma máquina...</option>
                {maquinas.map(m => (
                  <option key={m.id} value={m.id}>{m.nome}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Horímetro Atual *</label>
                <input
                  type="number"
                  step="0.1"
                  value={horimetroAtual}
                  onChange={e => setHorimetroAtual(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Ex: 5600.5"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Posto / Tanque</label>
                <input
                  type="text"
                  value={posto}
                  onChange={e => setPosto(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Ex: Sede"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Litros *</label>
                <input
                  type="number"
                  step="0.01"
                  value={litros}
                  onChange={e => setLitros(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Ex: 250"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">R$ por Litro *</label>
                <input
                  type="number"
                  step="0.01"
                  value={valorLitro}
                  onChange={e => setValorLitro(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Ex: 5.40"
                  required
                />
              </div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex justify-between items-center">
              <span className="text-sm font-bold text-emerald-800">Valor Total:</span>
              <span className="text-xl font-black text-emerald-600">
                {valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Observações</label>
              <textarea
                value={observacoes}
                onChange={e => setObservacoes(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none h-24"
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
              disabled={submitting || !maquinaId || !horimetroAtual || !litros || !valorLitro}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-colors disabled:opacity-50"
            >
              {submitting ? 'Salvando...' : (
                <>
                  <Save className="w-5 h-5" />
                  Salvar Abastecimento
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
