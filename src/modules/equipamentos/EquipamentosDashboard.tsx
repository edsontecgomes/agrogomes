import React, { useState } from 'react';
import { useEquipamentos } from '../../hooks/useEquipamentos';
import { Equipamento } from '../../types';
import { 
  Wrench, 
  Settings, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Cpu, 
  Compass, 
  Activity, 
  Search, 
  SlidersHorizontal,
  PlusCircle,
  Eye,
  EyeOff,
  Edit2,
  Check,
  X,
  Gauge,
  Tag,
  CircleDot
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EquipamentosDashboardProps {
  farmId: string;
}

export function EquipamentosDashboard({ farmId }: EquipamentosDashboardProps) {
  const { 
    equipamentos, 
    loading, 
    criarEquipamento, 
    atualizarEquipamento, 
    desativarEquipamento 
  } = useEquipamentos(farmId);

  const [activeTab, setActiveTab] = useState<'todos' | 'maquinas' | 'implementos' | 'inativos'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals / Form States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<Equipamento | null>(null);
  
  // Create New Equipment Form State
  const [newNome, setNewNome] = useState('');
  const [newTipo, setNewTipo] = useState<'maquina' | 'implemento'>('maquina');
  const [newMarca, setNewMarca] = useState('');
  const [newModelo, setNewModelo] = useState('');
  const [newPotencia, setNewPotencia] = useState('');
  const [newLargura, setNewLargura] = useState('');
  const [newHorimetro, setNewHorimetro] = useState<string>('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Equipment Form State
  const [editNome, setEditNome] = useState('');
  const [editTipo, setEditTipo] = useState<'maquina' | 'implemento'>('maquina');
  const [editMarca, setEditMarca] = useState('');
  const [editModelo, setEditModelo] = useState('');
  const [editPotencia, setEditPotencia] = useState('');
  const [editLargura, setEditLargura] = useState('');
  const [editHorimetro, setEditHorimetro] = useState<string>('');
  const [editAtivo, setEditAtivo] = useState(true);

  // Stats calculation
  const totalEquipamentos = equipamentos.length;
  const maquinasCount = equipamentos.filter(e => e.tipo === 'maquina' && e.ativo).length;
  const implementosCount = equipamentos.filter(e => e.tipo === 'implemento' && e.ativo).length;
  const inativosCount = equipamentos.filter(e => !e.ativo).length;
  const ativosCount = equipamentos.filter(e => e.ativo).length;

  // Filtered equipments
  const filteredEquipamentos = equipamentos.filter(eq => {
    // Tab filter
    if (activeTab === 'maquinas' && (eq.tipo !== 'maquina' || !eq.ativo)) return false;
    if (activeTab === 'implementos' && (eq.tipo !== 'implemento' || !eq.ativo)) return false;
    if (activeTab === 'inativos' && eq.ativo) return false;
    if (activeTab === 'todos' && !eq.ativo) return false; // Default 'todos' shows active only

    // Search filter
    if (searchTerm.trim() !== '') {
      const matchSearch = (
        eq.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (eq.marca && eq.marca.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (eq.modelo && eq.modelo.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      return matchSearch;
    }

    return true;
  });

  const handleOpenCreateModal = () => {
    setNewNome('');
    setNewTipo('maquina');
    setNewMarca('');
    setNewModelo('');
    setNewPotencia('');
    setNewLargura('');
    setNewHorimetro('');
    setFormError('');
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNome.trim()) {
      setFormError('O nome do equipamento é obrigatório.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const extraData = {
        marca: newMarca.trim() || undefined,
        modelo: newModelo.trim() || undefined,
        potencia: newTipo === 'maquina' && newPotencia.trim() ? newPotencia.trim() : undefined,
        largura: newTipo === 'implemento' && newLargura.trim() ? newLargura.trim() : undefined
      };

      const eqId = await criarEquipamento(newNome, newTipo, extraData);
      
      // If a machine was created and an initial horimeter was specified, update it
      if (eqId && newTipo === 'maquina' && newHorimetro) {
        const horimetroVal = parseFloat(newHorimetro);
        if (!isNaN(horimetroVal)) {
          await atualizarEquipamento(eqId, {
            horimetroAtual: horimetroVal,
            ultimaAtualizacaoHorimetro: new Date()
          });
        }
      }

      setShowCreateModal(false);
    } catch (err: any) {
      setFormError('Falha ao salvar equipamento. Tente novamente.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditModal = (eq: Equipamento) => {
    setShowEditModal(eq);
    setEditNome(eq.nome);
    setEditTipo(eq.tipo);
    setEditMarca(eq.marca || '');
    setEditModelo(eq.modelo || '');
    setEditPotencia(eq.potencia || '');
    setEditLargura(eq.largura || '');
    setEditHorimetro(eq.horimetroAtual?.toString() || '');
    setEditAtivo(eq.ativo);
    setFormError('');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal) return;
    if (!editNome.trim()) {
      setFormError('O nome do equipamento é obrigatório.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const updates: Partial<Equipamento> = {
        nome: editNome.trim(),
        tipo: editTipo,
        ativo: editAtivo,
        marca: editMarca.trim() || undefined,
        modelo: editModelo.trim() || undefined,
        potencia: editTipo === 'maquina' && editPotencia.trim() ? editPotencia.trim() : undefined,
        largura: editTipo === 'implemento' && editLargura.trim() ? editLargura.trim() : undefined
      };

      if (editTipo === 'maquina') {
        const horimetroVal = editHorimetro ? parseFloat(editHorimetro) : undefined;
        if (horimetroVal !== undefined && !isNaN(horimetroVal)) {
          updates.horimetroAtual = horimetroVal;
          updates.ultimaAtualizacaoHorimetro = new Date();
        }
      } else {
        // Clear horimeter if updated to an implement
        updates.horimetroAtual = undefined;
        updates.ultimaAtualizacaoHorimetro = undefined;
        updates.potencia = undefined;
      }

      await atualizarEquipamento(showEditModal.id, updates);
      setShowEditModal(null);
    } catch (err) {
      setFormError('Falha ao atualizar equipamento.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (eq: Equipamento) => {
    try {
      await atualizarEquipamento(eq.id, { ativo: !eq.ativo });
    } catch (err) {
      console.error('Erro ao alternar status do equipamento:', err);
    }
  };

  return (
    <div id="equipamentos-panel" className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
      
      {/* Header section with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Wrench className="w-8 h-8 text-emerald-600" />
            Máquinas & Implementos
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Gestão do ativo mecânico, tratores, colheitadeiras e implementos agrícolas
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm shadow-emerald-200/50 transition-all active:scale-95 text-sm"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Equipamento
        </button>
      </div>

      {/* Metric/Card Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Compass className="w-5 h-5" />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Tratores/Máquinas</p>
          </div>
          <p className="text-3xl font-black text-slate-800 mt-2">
            {maquinasCount} <span className="text-sm font-semibold text-slate-400">ativos</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <Cpu className="w-5 h-5" />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Implementos</p>
          </div>
          <p className="text-3xl font-black text-slate-800 mt-2">
            {implementosCount} <span className="text-sm font-semibold text-slate-400">ativos</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Geral</p>
          </div>
          <p className="text-3xl font-black text-slate-800 mt-2">
            {totalEquipamentos} <span className="text-sm font-semibold text-slate-400">cadastros</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <EyeOff className="w-5 h-5" />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Inativos</p>
          </div>
          <p className="text-3xl font-black text-slate-800 mt-2">
            {inativosCount} <span className="text-sm font-semibold text-slate-400">fora de uso</span>
          </p>
        </div>
      </div>

      {/* Search, Filter Tabs */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 md:border-none overflow-x-auto pb-2 md:pb-0 gap-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('todos')}
            className={`px-4 py-2 rounded-xl text-sm font-black whitespace-nowrap transition-all ${
              activeTab === 'todos' 
                ? 'bg-slate-100 text-slate-800' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            Todos Ativos ({ativosCount})
          </button>
          <button
            onClick={() => setActiveTab('maquinas')}
            className={`px-4 py-2 rounded-xl text-sm font-black whitespace-nowrap transition-all ${
              activeTab === 'maquinas' 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            Máquinas ({maquinasCount})
          </button>
          <button
            onClick={() => setActiveTab('implementos')}
            className={`px-4 py-2 rounded-xl text-sm font-black whitespace-nowrap transition-all ${
              activeTab === 'implementos' 
                ? 'bg-emerald-50 text-emerald-700' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            Implementos ({implementosCount})
          </button>
          <button
            onClick={() => setActiveTab('inativos')}
            className={`px-4 py-2 rounded-xl text-sm font-black whitespace-nowrap transition-all ${
              activeTab === 'inativos' 
                ? 'bg-amber-50 text-amber-700' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            Arquivados ({inativosCount})
          </button>
        </div>

        {/* Live Filter Inputs */}
        <div className="flex flex-1 md:max-w-md items-center gap-2">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar por nome, marca ou modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 outline-none rounded-xl focus:border-emerald-500 hover:border-slate-300 text-sm transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Grid Render */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
          <p className="text-slate-500 font-bold text-sm">Carregando frota de equipamentos...</p>
        </div>
      ) : filteredEquipamentos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm text-center px-6">
          <div className="w-16 h-16 bg-slate-50 border border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mb-4">
            <SlidersHorizontal className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-700">Nenhum equipamento encontrado</h3>
          <p className="text-slate-400 font-medium max-w-md mt-1 mb-6 text-sm">
            {searchTerm 
              ? `Não encontramos resultados para "${searchTerm}". Tente outra pesquisa.`
              : 'Nenhum equipamento desse tipo foi cadastrado ou está ativo.'}
          </p>
          {!searchTerm && (
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all text-sm shadow-sm active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Cadastrar Primeiro Ativo
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredEquipamentos.map((eq, idx) => (
              <motion.div
                key={eq.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: Math.min(idx * 0.05, 0.3) }}
                className={`bg-white rounded-3xl border p-6 flex flex-col justify-between transition-all hover:shadow-md ${
                  eq.ativo ? 'border-slate-100' : 'border-slate-200 bg-slate-50/50 opacity-75'
                }`}
              >
                <div>
                  {/* Category badging */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border ${
                      eq.tipo === 'maquina' 
                        ? 'bg-blue-50 text-blue-700 border-blue-100' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    }`}>
                      {eq.tipo === 'maquina' ? 'Máquina / Trator' : 'Implemento'}
                    </span>
                    
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                      eq.ativo 
                        ? 'bg-emerald-500/10 text-emerald-600' 
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${eq.ativo ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                      {eq.ativo ? 'Ativo' : 'Arquivado'}
                    </span>
                  </div>

                  {/* Info */}
                  <h3 className="text-lg font-black text-slate-800 leading-tight mb-1">
                    {eq.nome}
                  </h3>
                  
                  {/* Metadata labels (Marca/Modelo) */}
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-4 items-center">
                    {eq.marca && (
                      <span className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-lg flex items-center gap-1 font-medium select-none">
                        <Tag className="w-3 h-3 text-slate-400" />
                        {eq.marca}
                      </span>
                    )}
                    {eq.modelo && (
                      <span className="text-slate-400">
                        • {eq.modelo}
                      </span>
                    )}
                  </div>

                  {/* Dynamic Technical Specs Grid (Potência / Largura) */}
                  {(eq.potencia || eq.largura) && (
                    <div className="grid grid-cols-2 gap-4 py-3 px-3.5 bg-slate-50 rounded-2xl border border-slate-100 mb-4 text-xs">
                      {eq.tipo === 'maquina' && eq.potencia && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Potência</p>
                          <p className="font-extrabold text-slate-700 mt-0.5">{eq.potencia}</p>
                        </div>
                      )}
                      {eq.tipo === 'implemento' && eq.largura && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Largura total</p>
                          <p className="font-extrabold text-slate-700 mt-0.5">{eq.largura}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Conditionally reveal Horímeter statistics if it is a machine */}
                  {eq.tipo === 'maquina' && (
                    <div className="p-3.5 bg-blue-50/40 rounded-2xl border border-blue-100/40 flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <Gauge className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="text-[10px] font-bold text-blue-500/80 uppercase tracking-widest leading-none">Horímetro</p>
                          <p className="text-sm font-black text-slate-800 mt-1">
                            {eq.horimetroAtual !== undefined ? `${eq.horimetroAtual.toLocaleString('pt-BR')} h` : '-- h'}
                          </p>
                        </div>
                      </div>
                      {eq.ultimaAtualizacaoHorimetro && (
                        <span className="text-[10px] font-medium text-slate-400 block text-right">
                          Alt: {new Date(eq.ultimaAtualizacaoHorimetro?.seconds * 1000 || eq.ultimaAtualizacaoHorimetro).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-1.5 mt-6 border-t border-slate-100 pt-4">
                  <button
                    onClick={() => handleToggleStatus(eq)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      eq.ativo 
                        ? 'text-amber-600 hover:bg-amber-50' 
                        : 'text-emerald-600 hover:bg-emerald-50'
                    }`}
                    title={eq.ativo ? 'Arquivar Equipamento' : 'Ativar Equipamento'}
                  >
                    {eq.ativo ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        Arquivar
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        Reativar
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleOpenEditModal(eq)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Editar Ativo
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* CREATE MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-xl border border-slate-100"
            >
              <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-emerald-600" />
                  Cadastrar Equipamento
                </h3>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-150 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto scrollbar-thin">
                {formError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold rounded-2xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Classificação do Equipamento</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewTipo('maquina')}
                      className={`py-3 px-4 rounded-2xl border text-sm font-black flex flex-col items-center gap-1.5 transition-all ${
                        newTipo === 'maquina' 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <Compass className="w-5 h-5" />
                      Máquina/Trator
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTipo('implemento')}
                      className={`py-3 px-4 rounded-2xl border text-sm font-black flex flex-col items-center gap-1.5 transition-all ${
                        newTipo === 'implemento' 
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <Cpu className="w-5 h-5" />
                      Implemento
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nome / Identificação</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Trator John Deere 6115J, Pulverizador Jacto Uniport"
                    value={newNome}
                    onChange={(e) => setNewNome(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 outline-none rounded-2xl focus:border-emerald-500 hover:border-slate-300 transition-all text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Marca / Fabricante</label>
                    <input
                      type="text"
                      placeholder="Ex: John Deere, Case, Baldan"
                      value={newMarca}
                      onChange={(e) => setNewMarca(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 outline-none rounded-2xl focus:border-emerald-500 hover:border-slate-300 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Modelo</label>
                    <input
                      type="text"
                      placeholder="Ex: 6115J, CR 7.90"
                      value={newModelo}
                      onChange={(e) => setNewModelo(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 outline-none rounded-2xl focus:border-emerald-500 hover:border-slate-300 transition-all text-sm"
                    />
                  </div>
                </div>

                {newTipo === 'maquina' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Potência (ex: cv / HP)</label>
                      <input
                        type="text"
                        placeholder="Ex: 115 cv, 200 HP"
                        value={newPotencia}
                        onChange={(e) => setNewPotencia(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 outline-none rounded-2xl focus:border-emerald-500 hover:border-slate-300 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Horímetro Inicial (h)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Ex: 1250.5"
                        value={newHorimetro}
                        onChange={(e) => setNewHorimetro(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 outline-none rounded-2xl focus:border-emerald-500 hover:border-slate-300 transition-all text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Largura de Trabalho / Linhas</label>
                    <input
                      type="text"
                      placeholder="Ex: 12 linhas, 4.5m, 32m de barras"
                      value={newLargura}
                      onChange={(e) => setNewLargura(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 outline-none rounded-2xl focus:border-emerald-500 hover:border-slate-300 transition-all text-sm"
                    />
                  </div>
                )}

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-50">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="py-2.5 px-4 text-slate-500 hover:bg-slate-50 font-bold rounded-xl transition-all text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all active:scale-95 text-sm disabled:opacity-50"
                  >
                    {isSubmitting ? 'Salvando...' : 'Adicionar Ativo'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-xl border border-slate-100"
            >
              <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-emerald-600" />
                  Editar Equipamento
                </h3>
                <button 
                  onClick={() => setShowEditModal(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-150 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto scrollbar-thin">
                {formError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold rounded-2xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Classificação do Equipamento</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setEditTipo('maquina')}
                      className={`py-3 px-4 rounded-2xl border text-sm font-black flex flex-col items-center gap-1.5 transition-all ${
                        editTipo === 'maquina' 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <Compass className="w-5 h-5" />
                      Máquina/Trator
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditTipo('implemento')}
                      className={`py-3 px-4 rounded-2xl border text-sm font-black flex flex-col items-center gap-1.5 transition-all ${
                        editTipo === 'implemento' 
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <Cpu className="w-5 h-5" />
                      Implemento
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nome / Identificação</label>
                  <input
                    type="text"
                    required
                    value={editNome}
                    onChange={(e) => setEditNome(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 outline-none rounded-2xl focus:border-emerald-500 hover:border-slate-300 transition-all text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Marca / Fabricante</label>
                    <input
                      type="text"
                      placeholder="Ex: John Deere, Case"
                      value={editMarca}
                      onChange={(e) => setEditMarca(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 outline-none rounded-2xl focus:border-emerald-500 hover:border-slate-300 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Modelo</label>
                    <input
                      type="text"
                      placeholder="Ex: 6115J"
                      value={editModelo}
                      onChange={(e) => setEditModelo(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 outline-none rounded-2xl focus:border-emerald-500 hover:border-slate-300 transition-all text-sm"
                    />
                  </div>
                </div>

                {editTipo === 'maquina' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Potência (ex: cv / HP)</label>
                      <input
                        type="text"
                        placeholder="Ex: 115 cv"
                        value={editPotencia}
                        onChange={(e) => setEditPotencia(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 outline-none rounded-2xl focus:border-emerald-500 hover:border-slate-300 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Horímetro Atual (h)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Ex: 1250.5"
                        value={editHorimetro}
                        onChange={(e) => setEditHorimetro(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 outline-none rounded-2xl focus:border-emerald-500 hover:border-slate-300 transition-all text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Largura de Trabalho / Linhas</label>
                    <input
                      type="text"
                      placeholder="Ex: 12 linhas"
                      value={editLargura}
                      onChange={(e) => setEditLargura(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 outline-none rounded-2xl focus:border-emerald-500 hover:border-slate-300 transition-all text-sm"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-2xl">
                  <div>
                    <span className="block text-sm font-bold text-slate-700">Status Ativo</span>
                    <span className="block text-xs text-slate-400">Ativos aparecem nos selects de apontamento de serviços</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditAtivo(!editAtivo)}
                    className={`w-11 h-6 rounded-full transition-colors relative outline-none ${
                      editAtivo ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <span className={`w-5 h-5 bg-white rounded-full p-2 absolute top-0.5 transition-transform ${
                      editAtivo ? 'translate-x-5.5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-50">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(null)}
                    className="py-2.5 px-4 text-slate-500 hover:bg-slate-50 font-bold rounded-xl transition-all text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all active:scale-95 text-sm disabled:opacity-50"
                  >
                    {isSubmitting ? 'Atualizando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
