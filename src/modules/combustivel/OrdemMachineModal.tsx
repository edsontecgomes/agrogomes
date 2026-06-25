import React, { useState } from 'react';
import { X, PlayCircle, CheckCircle2, Calculator } from 'lucide-react';
import { OrdemServico, ExecucaoServico } from '../../types';
import { useIndicadoresConsumo } from '../../hooks/useIndicadoresConsumo';

interface OrdemMachineModalProps {
  ordem: OrdemServico;
  action: 'start' | 'finish';
  onConfirm: (horimetro: number) => void;
  onCancel: () => void;
  farmId: string;
}

export function OrdemMachineModal({ ordem, action, onConfirm, onCancel, farmId }: OrdemMachineModalProps) {
  const [horimetro, setHorimetro] = useState('');
  const [error, setError] = useState('');
  const { indicadores } = useIndicadoresConsumo(farmId);

  const indicador = indicadores.find(i => i.maquinaId === ordem.maquinaId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!horimetro) {
      setError('Informe o horímetro da máquina.');
      return;
    }
    const val = parseFloat(horimetro);
    if (isNaN(val)) return;
    onConfirm(val);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
             <div className={`p-2 rounded-xl ${action === 'start' ? 'bg-sky-100 text-sky-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {action === 'start' ? <PlayCircle className="w-5 h-5"/> : <CheckCircle2 className="w-5 h-5"/>}
             </div>
             <h3 className="font-bold text-slate-800">
                {action === 'start' ? 'Iniciar Operação' : 'Finalizar Operação'}
             </h3>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 p-2 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
             <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
               <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Máquina Vinculada</p>
               <p className="font-bold text-slate-700">{ordem.maquinaNome}</p>
             </div>

             {action === 'start' && indicador?.litrosHora && (
               <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3 text-amber-800">
                  <Calculator className="w-5 h-5 text-amber-600 shrink-0" />
                  <div className="text-xs font-medium">
                    Consumo médio histórico: <strong className="font-black">{indicador.litrosHora.toFixed(1)} L/h</strong>
                  </div>
               </div>
             )}

             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  {action === 'start' ? 'Horímetro Inicial *' : 'Horímetro Final *'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={horimetro}
                  onChange={(e) => setHorimetro(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-lg font-bold text-slate-800 focus:ring-2 focus:ring-sky-500"
                  placeholder="Ex: 1540.5"
                  autoFocus
                />
                {error && <p className="text-rose-500 text-xs font-medium mt-2">{error}</p>}
             </div>
          </div>

          <button
            type="submit"
            className={`w-full py-3.5 rounded-xl text-white font-bold transition-transform active:scale-95 ${
              action === 'start' 
                ? 'bg-sky-500 hover:bg-sky-600 shadow-md shadow-sky-500/20' 
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20'
            }`}
          >
            {action === 'start' ? 'Confirmar Início' : 'Confirmar Término'}
          </button>
        </form>
      </div>
    </div>
  );
}
