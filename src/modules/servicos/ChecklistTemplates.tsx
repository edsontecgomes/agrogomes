import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useChecklistTemplates } from '../../hooks/useChecklists';
import { ChecklistTemplate, ChecklistItem } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface ChecklistTemplatesProps {
  farmId: string;
}

export function ChecklistTemplates({ farmId }: ChecklistTemplatesProps) {
  const { templates, loading, saveTemplate } = useChecklistTemplates(farmId);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<Partial<ChecklistTemplate>>({
    nome: '',
    tipoOperacao: 'Outros',
    itens: [],
    ativo: true
  });

  const handleAddItem = () => {
    const newItem: ChecklistItem = {
      id: Math.random().toString(36).substr(2, 9),
      pergunta: '',
      obrigatorio: true,
      tipo: 'boolean'
    };
    setCurrentTemplate(prev => ({
      ...prev,
      itens: [...(prev.itens || []), newItem]
    }));
  };

  const handleUpdateItem = (id: string, updates: Partial<ChecklistItem>) => {
    setCurrentTemplate(prev => ({
      ...prev,
      itens: prev.itens?.map(item => item.id === id ? { ...item, ...updates } : item)
    }));
  };

  const handleRemoveItem = (id: string) => {
    setCurrentTemplate(prev => ({
      ...prev,
      itens: prev.itens?.filter(item => item.id !== id)
    }));
  };

  const handleSave = async () => {
    if (!currentTemplate.nome || !currentTemplate.itens?.length) return;
    await saveTemplate(currentTemplate);
    setIsEditing(false);
    setCurrentTemplate({ nome: '', tipoOperacao: 'Outros', itens: [], ativo: true });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Checklists Operacionais</h2>
          <p className="text-sm text-slate-500">Padronização de início de operações</p>
        </div>
        <button 
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-200"
        >
          <Plus className="w-4 h-4" />
          Novo Checklist
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <motion.div 
            key={template.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-emerald-200 transition-all ${!template.ativo ? 'opacity-60' : ''}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
                {template.tipoOperacao}
              </div>
              <button 
                onClick={() => saveTemplate({ id: template.id, ativo: !template.ativo })}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                {template.ativo ? <ToggleRight className="w-6 h-6 text-emerald-600" /> : <ToggleLeft className="w-6 h-6" />}
              </button>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 mb-2">{template.nome}</h3>
            <p className="text-xs text-slate-500 mb-6 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              {template.itens.length} itens configurados
            </p>

            <button 
              onClick={() => {
                setCurrentTemplate(template);
                setIsEditing(true);
              }}
              className="w-full py-3 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
            >
              Editar Configuração
            </button>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-50 w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="bg-white p-8 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Configurar Checklist</h3>
                  <p className="text-sm text-slate-500">Defina os itens obrigatórios</p>
                </div>
              </div>

              <div className="p-8 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Nome do Checklist</label>
                    <input 
                      type="text"
                      value={currentTemplate.nome}
                      onChange={(e) => setCurrentTemplate(prev => ({ ...prev, nome: e.target.value }))}
                      className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                      placeholder="Ex: Checklist Pulverização Manhã"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Tipo de Operação</label>
                    <select 
                      value={currentTemplate.tipoOperacao}
                      onChange={(e) => setCurrentTemplate(prev => ({ ...prev, tipoOperacao: e.target.value as any }))}
                      className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                    >
                      <option value="Plantio">Plantio</option>
                      <option value="Pulverizacao">Pulverização</option>
                      <option value="Adubacao">Adubação</option>
                      <option value="Colheita">Colheita</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-slate-800">Itens do Checklist</h4>
                    <button 
                      onClick={handleAddItem}
                      className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {currentTemplate.itens?.map((item, index) => (
                      <div key={item.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <div className="flex gap-4">
                          <div className="flex-1 space-y-2">
                            <input 
                              type="text"
                              value={item.pergunta}
                              onChange={(e) => handleUpdateItem(item.id, { pergunta: e.target.value })}
                              className="w-full px-4 py-3 bg-slate-50 border border-transparent focus:border-emerald-500 rounded-xl transition-all outline-none font-medium"
                              placeholder="Qual a pergunta?"
                            />
                          </div>
                          <button 
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-3 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-6">
                           <div className="flex items-center gap-2">
                             <input 
                              type="checkbox"
                              checked={item.obrigatorio}
                              onChange={(e) => handleUpdateItem(item.id, { obrigatorio: e.target.checked })}
                              id={`check-${item.id}`}
                              className="w-4 h-4 accent-emerald-600"
                             />
                             <label htmlFor={`check-${item.id}`} className="text-xs font-bold text-slate-600">Obrigatório</label>
                           </div>

                           <div className="flex bg-slate-50 p-1 rounded-xl">
                              {(['boolean', 'texto', 'numero'] as const).map(type => (
                                <button 
                                  key={type}
                                  onClick={() => handleUpdateItem(item.id, { tipo: type })}
                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                    item.tipo === type ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'
                                  }`}
                                >
                                  {type}
                                </button>
                              ))}
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 mt-auto flex gap-4">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Salvar Checklist
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
