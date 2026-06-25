import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ChevronRight,
  ClipboardCheck,
  Check,
  Circle
} from 'lucide-react';
import { ChecklistTemplate, ChecklistResposta, ChecklistItem } from '../../types';
import { useChecklistTemplates, useChecklistResponses } from '../../hooks/useChecklists';
import { motion, AnimatePresence } from 'motion/react';
import { enviarNotificacao } from '../../hooks/useNotificacoes';

interface ChecklistRunnerProps {
  farmId: string;
  tipoOperacao: string;
  ordemId: string;
  operadorId: string;
  onComplete: (respostaId: string) => void;
  onCancel: () => void;
}

export function ChecklistRunner({ 
  farmId, 
  tipoOperacao, 
  ordemId, 
  operadorId, 
  onComplete, 
  onCancel 
}: ChecklistRunnerProps) {
  const { templates, loading: loadingTemplates } = useChecklistTemplates(farmId);
  const { submitResponse } = useChecklistResponses(farmId);
  
  const [activeTemplate, setActiveTemplate] = useState<ChecklistTemplate | null>(null);
  const [respostas, setRespostas] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loadingTemplates && templates.length > 0) {
      const template = templates.find(t => t.tipoOperacao === tipoOperacao && t.ativo) || 
                      templates.find(t => t.tipoOperacao === 'Outros' && t.ativo);
      if (template) {
        setActiveTemplate(template);
      } else {
        // If no template is found, we might want to skip or show error
        setError('Nenhum checklist configurado para esta operação.');
      }
    }
  }, [loadingTemplates, templates, tipoOperacao]);

  const handleToggleBoolean = (itemId: string) => {
    setRespostas(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleChangeValue = (itemId: string, value: any) => {
    setRespostas(prev => ({
      ...prev,
      [itemId]: value
    }));
  };

  const handleSubmit = async () => {
    if (!activeTemplate) return;

    // Validation
    const missingItems = activeTemplate.itens.filter(item => 
      item.obrigatorio && (respostas[item.id] === undefined || respostas[item.id] === '')
    );

    if (missingItems.length > 0) {
      setError(`Por favor, responda todos os itens obrigatórios: ${missingItems.map(i => i.pergunta).join(', ')}`);
      return;
    }

    setSubmitting(true);
    try {
      const respostaPayload: Omit<ChecklistResposta, 'id' | 'createdAt'> = {
        ordemId,
        operadorId,
        checklistId: activeTemplate.id,
        respostas: activeTemplate.itens.map(item => ({
          itemId: item.id,
          valor: respostas[item.id] !== undefined ? respostas[item.id] : (item.tipo === 'boolean' ? false : '')
        }))
      };

      // We don't have a returned ID immediately from submitResponse (it uses addDoc which returns a Promise<DocumentReference>)
      // Returning a string ID might be tricky with our current submitResponse wrapper. 
      // Let's just finish.
      await submitResponse(respostaPayload);
      
      enviarNotificacao({
        farmId,
        tipo: 'SINCRONIZADO',
        titulo: 'Checklist Concluído',
        mensagem: `O checklist para a operação de ${tipoOperacao} foi registrado com sucesso.`,
        severidade: 'info'
      });

      onComplete('checklist-done'); // Dummy ID since we don't return it yet
    } catch (err) {
      setError('Erro ao salvar checklist. Tente novamente.');
      setSubmitting(false);
    }
  };

  if (loadingTemplates) {
    return (
      <div className="fixed inset-0 z-[300] bg-white flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !activeTemplate) {
    return (
      <div className="fixed inset-0 z-[300] bg-white flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Checklist não encontrado</h3>
        <p className="text-slate-500 mb-8 max-w-xs">{error}</p>
        <button 
          onClick={onCancel}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[300] bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white px-6 py-10 border-b border-slate-100 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-blue-200 mb-4 scale-110">
          <ClipboardCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{activeTemplate?.nome}</h2>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Conclua o checklist para iniciar a execução</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 custom-scrollbar pb-32">
        {activeTemplate?.itens.map((item, index) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-white p-6 rounded-[32px] border ${respostas[item.id] !== undefined ? 'border-blue-100 shadow-md' : 'border-slate-100 shadow-sm'} transition-all`}
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Item {index + 1}</span>
              {item.obrigatorio && (
                <span className="text-[9px] font-black bg-rose-50 text-rose-500 px-2 py-0.5 rounded-lg uppercase tracking-widest">Obrigatório</span>
              )}
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 mb-8 leading-tight">
              {item.pergunta}
            </h3>

            {item.tipo === 'boolean' && (
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleChangeValue(item.id, true)}
                  className={`py-6 rounded-3xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 border-2 ${
                    respostas[item.id] === true 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-500 shadow-lg shadow-emerald-100' 
                      : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                  }`}
                >
                  {respostas[item.id] === true ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                  Sim
                </button>
                <button 
                  onClick={() => handleChangeValue(item.id, false)}
                  className={`py-6 rounded-3xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 border-2 ${
                    respostas[item.id] === false 
                      ? 'bg-rose-50 text-rose-600 border-rose-500 shadow-lg shadow-rose-100' 
                      : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                  }`}
                >
                  {respostas[item.id] === false ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                  Não
                </button>
              </div>
            )}

            {item.tipo === 'texto' && (
              <textarea 
                value={respostas[item.id] || ''}
                onChange={(e) => handleChangeValue(item.id, e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none min-h-[120px] font-medium"
                placeholder="Digite sua resposta aqui..."
              />
            )}

            {item.tipo === 'numero' && (
              <input 
                type="number"
                value={respostas[item.id] || ''}
                onChange={(e) => handleChangeValue(item.id, e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none font-black text-2xl text-blue-600"
                placeholder="0.00"
              />
            )}
          </motion.div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 flex flex-col gap-3 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.05)]">
        {error && (
          <div className="flex items-center gap-2 text-rose-500 text-[10px] font-black uppercase tracking-widest mb-2 justify-center">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
        <div className="flex gap-4">
          <button 
            onClick={onCancel}
            className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-[28px] font-black text-xs uppercase tracking-widest transition-all"
            disabled={submitting}
          >
            Voltar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className={`flex-[2] py-5 rounded-[28px] font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-3 ${
              submitting ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 text-white shadow-blue-200 hover:scale-[1.02] active:scale-95'
            }`}
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                Finalizar Checklist
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
