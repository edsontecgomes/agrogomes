import React, { useState } from 'react';
import { useFarm } from '../../contexts/FarmContext';
import { usePecasManutencao } from '../../hooks/usePecasManutencao';
import { useProdutosEstoque } from '../../hooks/useProdutosEstoque';
import { useEquipamentos } from '../../hooks/useEquipamentos';
import { useManutencoesExecutadas } from '../../hooks/useManutencao';
import { PecaManutencao, Equipamento, ProdutoEstoque, ManutencaoExecutada } from '../../types';
import { 
  Wrench, 
  Settings, 
  Search, 
  Plus, 
  Edit2, 
  Archive, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  X, 
  Boxes, 
  FileText, 
  Calendar, 
  ChevronRight, 
  Link2,
  RefreshCw,
  Cpu,
  Bookmark
} from 'lucide-react';

interface PecasManutencaoDashboardProps {
  farmId: string;
}

export function PecasManutencaoDashboard({ farmId }: PecasManutencaoDashboardProps) {
  const { currentFarmId, activeFarm } = useFarm();
  
  // Custom hooks
  const { pecas, loading: loadingPecas, criarPeca, atualizarPeca, desativarPeca } = usePecasManutencao(currentFarmId);
  const { produtos, loading: loadingProdutos } = useProdutosEstoque(currentFarmId);
  const { equipamentos, loading: loadingEquipamentos } = useEquipamentos(currentFarmId);
  const { manutencoes, loading: loadingManutencoes } = useManutencoesExecutadas(currentFarmId);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEquipamento, setSelectedEquipamento] = useState<string>('todos');
  const [selectedStockStatus, setSelectedStockStatus] = useState<string>('todos');
  const [viewInactive, setViewInactive] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingPeca, setEditingPeca] = useState<PecaManutencao | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Form states
  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [marca, setMarca] = useState('');
  const [quantidadeMinima, setQuantidadeMinima] = useState<number>(1);
  const [produtoEstoqueId, setProdutoEstoqueId] = useState('');
  const [equipamentosCompativeis, setEquipamentosCompativeis] = useState<string[]>([]);
  const [manutencoesAssociadas, setManutencoesAssociadas] = useState<string[]>([]);

  // Open modal for creation
  const openNewModal = () => {
    setEditingPeca(null);
    setNome('');
    setCodigo('');
    setMarca('');
    setQuantidadeMinima(2);
    setProdutoEstoqueId('');
    setEquipamentosCompativeis([]);
    setManutencoesAssociadas([]);
    setShowModal(true);
  };

  // Open modal for editing
  const openEditModal = (peca: PecaManutencao) => {
    setEditingPeca(peca);
    setNome(peca.nome);
    setCodigo(peca.codigo || '');
    setMarca(peca.marca || '');
    setQuantidadeMinima(peca.quantidadeMinima || 1);
    setProdutoEstoqueId(peca.produtoEstoqueId || '');
    setEquipamentosCompativeis(peca.equipamentosCompativeis || []);
    setManutencoesAssociadas(peca.manutencoesAssociadas || []);
    setShowModal(true);
  };

  // Handle submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      alert('O nome da peça é obrigatório');
      return;
    }

    setModalLoading(true);
    try {
      const payload = {
        nome: nome.trim(),
        codigo: codigo.trim(),
        marca: marca.trim(),
        quantidadeMinima,
        produtoEstoqueId,
        equipamentosCompativeis,
        manutencoesAssociadas,
        ativo: true
      };

      if (editingPeca) {
        await atualizarPeca(editingPeca.id, payload);
      } else {
        await criarPeca(
          payload.nome,
          payload.codigo,
          payload.marca,
          payload.quantidadeMinima,
          payload.produtoEstoqueId,
          payload.equipamentosCompativeis,
          payload.manutencoesAssociadas
        );
      }
      setShowModal(false);
    } catch (err) {
      console.error('Erro ao salvar peça:', err);
    } finally {
      setModalLoading(false);
    }
  };

  // Handle archive/deactivate
  const handleDeactivate = async (id: string) => {
    if (window.confirm('Deseja realmente arquivar esta peça de manutenção?')) {
      try {
        await desativarPeca(id);
      } catch (err) {
        console.error('Erro ao arquivar peça:', err);
      }
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await atualizarPeca(id, { ativo: true });
    } catch (err) {
      console.error('Erro ao reativar peça:', err);
    }
  };

  // Checkbox handlers
  const handleEquipamentoToggle = (id: string) => {
    setEquipamentosCompativeis(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleManutencaoToggle = (id: string) => {
    setManutencoesAssociadas(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Helper dictionary matches
  const productMap = produtos.reduce<Record<string, ProdutoEstoque>>((acc, curr) => {
    acc[curr.id] = curr;
    return acc;
  }, {});

  const equipmentMap = equipamentos.reduce<Record<string, Equipamento>>((acc, curr) => {
    acc[curr.id] = curr;
    return acc;
  }, {});

  const maintenanceMap = manutencoes.reduce<Record<string, ManutencaoExecutada>>((acc, curr) => {
    acc[curr.id] = curr;
    return acc;
  }, {});

  // Filters logic
  const filteredPecas = pecas.filter(p => {
    // 1. Search term match
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      p.nome.toLowerCase().includes(searchLower) ||
      (p.codigo && p.codigo.toLowerCase().includes(searchLower)) ||
      (p.marca && p.marca.toLowerCase().includes(searchLower));

    // 2. Active vs Archive
    const matchesStatus = viewInactive ? !p.ativo : p.ativo;

    // 3. Compatible Equipment
    const matchesEquipamento = selectedEquipamento === 'todos' || 
      (p.equipamentosCompativeis && p.equipamentosCompativeis.includes(selectedEquipamento));

    // 4. Stock link status
    const linkedProduct = p.produtoEstoqueId ? productMap[p.produtoEstoqueId] : null;
    let matchesStock = true;
    if (selectedStockStatus === 'vinculado') {
      matchesStock = !!p.produtoEstoqueId;
    } else if (selectedStockStatus === 'no_vinculado') {
      matchesStock = !p.produtoEstoqueId;
    } else if (selectedStockStatus === 'baixo') {
      if (linkedProduct) {
        matchesStock = linkedProduct.estoqueAtual < (p.quantidadeMinima || 1);
      } else {
        matchesStock = false; // can't evaluate low stock if not linked
      }
    } else if (selectedStockStatus === 'esgotado') {
      if (linkedProduct) {
        matchesStock = linkedProduct.estoqueAtual <= 0;
      } else {
        matchesStock = false;
      }
    }

    return matchesSearch && matchesStatus && matchesEquipamento && matchesStock;
  });

  // Calculate metrics (only for active items)
  const activePecas = pecas.filter(p => p.ativo);
  const totalPecas = activePecas.length;
  
  const totalVunculosEstoques = activePecas.filter(p => !!p.produtoEstoqueId).length;
  
  const lowStockCount = activePecas.filter(p => {
    if (!p.produtoEstoqueId) return false;
    const linked = productMap[p.produtoEstoqueId];
    return linked ? linked.estoqueAtual < (p.quantidadeMinima || 1) : false;
  }).length;

  const outOfStockCount = activePecas.filter(p => {
    if (!p.produtoEstoqueId) return false;
    const linked = productMap[p.produtoEstoqueId];
    return linked ? linked.estoqueAtual <= 0 : false;
  }).length;

  if (loadingPecas || loadingProdutos || loadingEquipamentos || loadingManutencoes) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-7xl mx-auto px-6">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
        <p className="text-slate-500 font-medium">Carregando catálogo de peças de reposição...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8" id="pecas-manutencao-root">
      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Wrench className="w-7 h-7 text-emerald-600" />
            Peças de Reposição & Manutenção
          </h1>
          <p className="text-slate-500 mt-1">
            Controle e rastreabilidade de peças de reposição compatíveis com maquinários e vinculadas ao estoque global.
          </p>
        </div>
        
        <button
          onClick={openNewModal}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-3 rounded-xl shadow-xs transition-colors self-start sm:self-center"
          id="btn-add-peca"
        >
          <Plus className="w-5 h-5" />
          Cadastrar Nova Peça
        </button>
      </div>

      {/* Modern Dashboard Metrics Card Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total de Peças</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalPecas}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Link2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vinculados ao Estoque</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalVunculosEstoques}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estoque Baixo</p>
            <h3 className="text-2xl font-bold text-slate-900">{lowStockCount}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
            <Archive className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sem Estoque</p>
            <h3 className="text-2xl font-bold text-slate-900">{outOfStockCount}</h3>
          </div>
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, código ou marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl outline-none text-sm transition-colors text-slate-800"
            />
          </div>

          {/* Quick Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Filter by Compatible Equipment */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Máquina/Implemento:</span>
              <select
                value={selectedEquipamento}
                onChange={(e) => setSelectedEquipamento(e.target.value)}
                className="bg-transparent border-none outline-none text-xs font-semibold text-slate-700 pr-2 cursor-pointer"
              >
                <option value="todos">Todos</option>
                {equipamentos.filter(eq => eq.ativo).map(eq => (
                  <option key={eq.id} value={eq.id}>
                    {eq.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Stock Link Status */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Estoque:</span>
              <select
                value={selectedStockStatus}
                onChange={(e) => setSelectedStockStatus(e.target.value)}
                className="bg-transparent border-none outline-none text-xs font-semibold text-slate-700 pr-2 cursor-pointer"
              >
                <option value="todos">Todos</option>
                <option value="vinculado">Com Vínculo a Item</option>
                <option value="no_vinculado">Sem Vínculo</option>
                <option value="baixo">Abaixo do Mínimo</option>
                <option value="esgotado">Esgotados</option>
              </select>
            </div>

            {/* View archied check */}
            <button
              onClick={() => setViewInactive(!viewInactive)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
                viewInactive 
                  ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {viewInactive ? 'Ver Peças Ativas' : 'Ver Arquivadas'}
            </button>
          </div>
        </div>
      </div>

      {/* Catalog items list */}
      {filteredPecas.length === 0 ? (
        <div className="bg-white p-12 text-center border border-slate-100 rounded-3xl shadow-xs">
          <Boxes className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800">Nenhum registro encontrado</h4>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Refine seus parâmetros de busca ou adicione uma nova peça de manutenção ao catálogo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="pecas-list-grid">
          {filteredPecas.map(p => {
            const linkedProduct = p.produtoEstoqueId ? productMap[p.produtoEstoqueId] : null;
            const isLowStock = linkedProduct ? linkedProduct.estoqueAtual < (p.quantidadeMinima || 1) : false;
            const isOutOfStock = linkedProduct ? linkedProduct.estoqueAtual <= 0 : false;

            return (
              <div 
                key={p.id} 
                className={`bg-white rounded-2xl border p-6 flex flex-col justify-between hover:shadow-xs transition-shadow relative ${
                  !p.ativo 
                    ? 'border-slate-100 opacity-75' 
                    : isOutOfStock 
                      ? 'border-rose-100 bg-rose-50/10'
                      : isLowStock 
                        ? 'border-amber-100 bg-amber-50/5'
                        : 'border-slate-100'
                }`}
              >
                <div>
                  {/* Title block */}
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded">
                        Código: {p.codigo || 'S/C'}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-1.5">{p.nome}</h3>
                      {p.marca && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          Marca: <strong className="text-slate-700 font-semibold">{p.marca}</strong>
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Editar peça"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      
                      {p.ativo ? (
                        <button
                          onClick={() => handleDeactivate(p.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Arquivar peça"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(p.id)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Reativar peça"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Stock connection mapping display (vincular ao estoque) */}
                  <div className="mt-4 p-3.5 rounded-xl border bg-slate-50/50 border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Boxes className="w-4 h-4 text-slate-400" />
                        Vínculo de Almoxarifado:
                      </span>
                      {linkedProduct ? (
                        <span className="font-semibold text-slate-800 underline">
                          {linkedProduct.nome}
                        </span>
                      ) : (
                        <span className="font-semibold text-rose-500 italic block">
                          Sem vínculo ao estoque
                        </span>
                      )}
                    </div>

                    {linkedProduct && (
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-dashed border-slate-200">
                        <div>
                          <span className="block text-[10px] text-slate-400 uppercase font-semibold">Saldo Atual</span>
                          <span className={`text-base font-bold ${
                            isOutOfStock 
                              ? 'text-rose-600' 
                              : isLowStock 
                                ? 'text-amber-600' 
                                : 'text-emerald-600'
                          }`}>
                            {linkedProduct.estoqueAtual} {linkedProduct.unidade}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-400 uppercase font-semibold">Mínimo Alerta</span>
                          <span className="text-sm font-semibold text-slate-700">
                            {p.quantidadeMinima} {linkedProduct.unidade}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Compatible machinery lists (associação a máquinas) */}
                  <div className="mt-4 space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5 text-emerald-500" /> Compatibilidade de Equipamentos:
                    </span>
                    {p.equipamentosCompativeis && p.equipamentosCompativeis.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {p.equipamentosCompativeis.map(eqId => {
                          const eq = equipmentMap[eqId];
                          return (
                            <span 
                              key={eqId} 
                              className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-md"
                            >
                              {eq ? eq.nome : `Equipamento #${eqId.substring(0, 5)}`}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic block pl-1">
                        Disponível ou genérico para qualquer máquina.
                      </span>
                    )}
                  </div>

                  {/* Association to Maintenance (associação a manutenções) */}
                  <div className="mt-4 space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-blue-500" /> Manutenções Associadas:
                    </span>
                    {p.manutencoesAssociadas && p.manutencoesAssociadas.length > 0 ? (
                      <div className="space-y-1.5 pt-1">
                        {p.manutencoesAssociadas.map(mRefId => {
                          const m = maintenanceMap[mRefId];
                          return (
                            <div 
                              key={mRefId} 
                              className="bg-blue-50/20 hover:bg-blue-50/40 border border-blue-50 text-slate-700 rounded-lg p-2 flex items-center justify-between text-[11px] transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <Bookmark className="w-3.5 h-3.5 text-blue-400" />
                                <div>
                                  <p className="font-bold text-slate-800">
                                    {m ? m.tipoManutencao : `Manutenção #${mRefId.substring(0, 5)}`}
                                  </p>
                                  <p className="text-slate-400 text-[10px]">
                                    {m ? m.descricao : ''}
                                  </p>
                                </div>
                              </div>
                              {m && (
                                <span className="font-semibold text-slate-500">
                                  {m.dataExecucao instanceof Date ? m.dataExecucao.toLocaleDateString('pt-BR') : String(m.dataExecucao)}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic block pl-1">
                        Nenhuma manutenção executada vinculou esta peça ainda.
                      </span>
                    )}
                  </div>
                </div>

                {/* Sub warnings */}
                {p.ativo && isOutOfStock && (
                  <div className="mt-4 flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-100 px-3 py-2 rounded-xl text-xs font-semibold">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>Atenção: Peça esgotada no estoque físico! Recomenda-se realizar pedido.</span>
                  </div>
                )}
                {p.ativo && !isOutOfStock && isLowStock && (
                  <div className="mt-4 flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-100 px-3 py-2 rounded-xl text-xs font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Aviso: Estoque atual abaixo do limite mínimo de segurança.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Creation and Edit Dialog modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" id="peca-form-modal">
          {/* Backdrop wrapper */}
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-slate-900 bg-opacity-40 transition-opacity" 
              onClick={() => setShowModal(false)}
            ></div>

            {/* Trick to center modal */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Panel wrapper */}
            <div className="relative inline-block align-middle bg-white rounded-3xl text-left overflow-hidden shadow-xl transform transition-all my-8 w-full max-w-2xl border border-slate-100">
              {/* Modal header */}
              <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-emerald-600 animate-spin-slow" />
                  {editingPeca ? 'Editar Peça de Reposição' : 'Cadastrar Nova Peça no Catálogo'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form starts */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* 1. Nome e código */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Nome da Peça *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Filtro Combustível Separador Puma"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl outline-none text-sm transition-colors text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Código de Fábrica
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 84348882"
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl outline-none text-sm transition-colors text-slate-800"
                    />
                  </div>
                </div>

                {/* 2. Marca e Qtd Alerta */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Marca/Fabricante
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Case IH, Donaldson, Baldwin"
                      value={marca}
                      onChange={(e) => setMarca(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl outline-none text-sm transition-colors text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      Mínimo no Estoque para Alerta
                      <span title="Gera aviso amarelo se o saldo for menor do que este valor.">
                        <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                      </span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={quantidadeMinima}
                      onChange={(e) => setQuantidadeMinima(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl outline-none text-sm transition-colors text-slate-800"
                    />
                  </div>
                </div>

                {/* 3. Link dynamically to product (vincular ao estoque) */}
                <div className="bg-emerald-50/30 p-4 rounded-xl border border-emerald-100">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Boxes className="w-4 h-4 text-emerald-600" />
                    Vincular a Item de Estoque Registrado *
                  </label>
                  <p className="text-xs text-slate-500 mb-2">
                    Vincule a peça a um item cadastrado no Estoque para rastrear quantitativos reais em tempo real.
                  </p>
                  <select
                    value={produtoEstoqueId}
                    onChange={(e) => setProdutoEstoqueId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl outline-none text-sm transition-colors text-slate-800"
                  >
                    <option value="">-- Selecione um produto cadastrado no estoque --</option>
                    {produtos.filter(p => p.ativo).map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nome} ({p.categoria}) - Atual: {p.estoqueAtual} {p.unidade}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Machinery association list (associação a máquinas) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Equipamentos Compatíveis (Maquinário)
                  </label>
                  <p className="text-xs text-slate-500 mb-2">
                    Indique quais máquinas ou implementos são compatíveis com esta peça de reposição.
                  </p>
                  
                  {equipamentos.filter(eq => eq.ativo).length === 0 ? (
                    <p className="text-xs text-amber-600 font-medium italic">Nenhum equipamento ativo cadastrado para associar.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-200">
                      {equipamentos.filter(eq => eq.ativo).map(eq => {
                        const isChecked = equipamentosCompativeis.includes(eq.id);
                        return (
                          <label key={eq.id} className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-white rounded transition-colors text-xs text-slate-700">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleEquipamentoToggle(eq.id)}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                            />
                            <span className="truncate">{eq.nome}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 5. Maintenance association list (associação a manutenções) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Utilizado em Manutenções Executadas
                  </label>
                  <p className="text-xs text-slate-500 mb-2">
                    Selecione as corretivas ou preventivas concluídas onde esta peça de reposição foi aplicada.
                  </p>

                  {manutencoes.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Nenhuma manutenção executada registrada de onde vincular.</p>
                  ) : (
                    <div className="space-y-2 max-h-36 overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-200">
                      {manutencoes.map(m => {
                        const isChecked = manutencoesAssociadas.includes(m.id);
                        const eqCompat = equipmentMap[m.equipamentoId];
                        return (
                          <label key={m.id} className="flex items-start gap-2.5 cursor-pointer p-1.5 hover:bg-white rounded transition-colors text-xs text-slate-755">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleManutencaoToggle(m.id)}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 mt-0.5"
                            />
                            <div>
                              <p className="font-bold text-slate-800">{m.tipoManutencao} ({eqCompat ? eqCompat.nome : 'Equipamento desconhecido'})</p>
                              <p className="text-slate-400 text-[10px]">{m.descricao || 'Sem descrição'}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Footer and interactive triggers */}
                <div className="bg-slate-50 -mx-6 -mb-6 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50"
                  >
                    {modalLoading && (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    )}
                    {editingPeca ? 'Salvar Edição' : 'Cadastrar Peça'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
