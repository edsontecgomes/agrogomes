import React, { useState } from 'react';
import { useFarm } from '../../contexts/FarmContext';
import { useProdutosEstoque } from '../../hooks/useProdutosEstoque';
import { ProdutoEstoque } from '../../types';
import { 
  Package, 
  Plus, 
  Search, 
  Edit2, 
  Archive, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  X,
  Layers,
  Thermometer,
  Boxes,
  Loader2
} from 'lucide-react';

interface EstoqueDashboardProps {
  farmId: string;
}

const CATEGORIAS = [
  'Semente',
  'Fertilizante',
  'Herbicida',
  'Inseticida',
  'Fungicida',
  'Combustivel',
  'Peça de Manutenção',
  'Outros'
] as const;

const UNIDADES = [
  'kg',
  'saca',
  'litro',
  'ml',
  'unidade'
] as const;

export function EstoqueDashboard({ farmId }: EstoqueDashboardProps) {
  const { currentFarmId, activeFarm } = useFarm();
  const { produtos, loading, criarProduto, atualizarProduto, desativarProduto } = useProdutosEstoque(currentFarmId);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProdutoEstoque | null>(null);
  const [viewInactive, setViewInactive] = useState(false);

  // Modal form states
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState<typeof CATEGORIAS[number]>('Semente');
  const [unidade, setUnidade] = useState<typeof UNIDADES[number]>('kg');
  const [estoqueAtual, setEstoqueAtual] = useState<number>(0);
  const [estoqueMinimo, setEstoqueMinimo] = useState<number>(0);
  const [modalLoading, setModalLoading] = useState(false);

  const openNewModal = () => {
    setEditingProduct(null);
    setNome('');
    setCategoria('Semente');
    setUnidade('kg');
    setEstoqueAtual(0);
    setEstoqueMinimo(0);
    setShowModal(true);
  };

  const openEditModal = (product: ProdutoEstoque) => {
    setEditingProduct(product);
    setNome(product.nome);
    setCategoria(product.categoria as any);
    setUnidade(product.unidade as any);
    setEstoqueAtual(product.estoqueAtual);
    setEstoqueMinimo(product.estoqueMinimo);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    setModalLoading(true);
    try {
      if (editingProduct) {
        await atualizarProduto(editingProduct.id, {
          nome: nome.trim(),
          categoria,
          unidade,
          estoqueAtual,
          estoqueMinimo,
        });
      } else {
        await criarProduto(
          nome.trim(),
          categoria,
          unidade,
          estoqueAtual,
          estoqueMinimo
        );
      }
      setShowModal(false);
    } catch (err) {
      console.error('Error saving product:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (window.confirm('Deseja realmente arquivar este produto do estoque?')) {
      try {
        await desativarProduto(id);
      } catch (err) {
        console.error('Error deactivating product:', err);
      }
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await atualizarProduto(id, { ativo: true });
    } catch (err) {
      console.error('Error activating product:', err);
    }
  };

  // Filters and processing
  const filteredProducts = produtos.filter(p => {
    const matchesSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'todas' || p.categoria === selectedCategory;
    const matchesStatus = viewInactive ? !p.ativo : p.ativo;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Analytics helper
  const totalItems = produtos.filter(p => p.ativo).length;
  const lowStockItems = produtos.filter(p => p.ativo && p.estoqueAtual < p.estoqueMinimo).length;
  const exactStockItems = produtos.filter(p => p.ativo && p.estoqueAtual === p.estoqueMinimo).length;

  const getStatusInfo = (atual: number, minimo: number) => {
    if (atual > minimo) {
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        text: 'Adequado',
        colorClass: 'bg-emerald-500',
        textColor: 'text-emerald-600',
        badge: 'bg-emerald-100 border border-emerald-200'
      };
    } else if (atual === minimo) {
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-100',
        text: 'No Limite',
        colorClass: 'bg-amber-500',
        textColor: 'text-amber-600',
        badge: 'bg-amber-100 border border-amber-200'
      };
    } else {
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-100',
        text: 'Abaixo do Mínimo',
        colorClass: 'bg-rose-500',
        textColor: 'text-rose-600',
        badge: 'bg-rose-100 border border-rose-200'
      };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-500 font-sans">Carregando estoque da fazenda...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-sans">Controle de Estoque</h1>
          <p className="text-slate-500 mt-2 font-sans">Gerencie saldos e níveis mínimos de sementes, fertilizantes, defensivos e combustível.</p>
        </div>
        <button 
          onClick={openNewModal}
          className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-100 font-sans text-sm active:scale-95"
        >
          <Plus className="w-5 h-5 font-black" />
          Novo Produto
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 rounded-2xl text-emerald-600">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 font-sans">Itens Ativos</p>
            <p className="text-2xl font-black text-slate-900 font-sans leading-tight mt-1">{totalItems}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-rose-50 rounded-2xl text-rose-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 font-sans font-sans">Estoque Crítico</p>
            <p className="text-2xl font-black text-rose-600 font-sans leading-tight mt-1">{lowStockItems}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 rounded-2xl text-amber-600">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 font-sans">Ponto de Atenção</p>
            <p className="text-2xl font-black text-amber-600 font-sans leading-tight mt-1">{exactStockItems}</p>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search bar */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Buscar produto pelo nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-100 focus:bg-white rounded-2xl border-0 focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
            />
          </div>

          {/* Filtering buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setSelectedCategory('todas')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === 'todas'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todas Categorias
            </button>
            {CATEGORIAS.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>

        {/* Action Toggle to View Archival Items */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
          <div className="text-xs text-slate-400 font-medium">
            Exibindo {filteredProducts.length} de {produtos.length} produtos
          </div>
          <button
            onClick={() => setViewInactive(!viewInactive)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <Archive className="w-3.5 h-3.5" />
            {viewInactive ? 'Ver Ativos no Estoque' : 'Ver Produtos Arquivados'}
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-[32px] p-12 text-center max-w-xl mx-auto shadow-sm">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
            <Package className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-1 font-sans">
            {viewInactive ? 'Nenhum produto arquivado' : 'Nenhum item cadastrado'}
          </h2>
          <p className="text-sm text-slate-500 mb-8 max-w-sm mx-auto font-sans">
            {viewInactive 
              ? 'Não encontramos nenhum produto que tenha sido desativado ou enviado para o arquivo.' 
              : 'O estoque para esta fazenda está vazio. Cadastre o seu primeiro produto para começar.'}
          </p>
          {!viewInactive && (
            <button 
              onClick={openNewModal}
              className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl active:scale-95 transition-all text-sm font-sans"
            >
              Começar Cadastro
            </button>
          )}
        </div>
      )}

      {/* Inventory Products List / Grid */}
      {filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => {
            const status = getStatusInfo(p.estoqueAtual, p.estoqueMinimo);
            return (
              <div 
                key={p.id}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-all group hover:border-emerald-100"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-4">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 mr-2">
                        {p.categoria}
                      </span>
                      {(!p.ativo) && (
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                          Arquivado
                        </span>
                      )}
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEditModal(p)}
                        className="p-1.5 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-lg transition-colors"
                        title="Editar Produto"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {p.ativo ? (
                        <button 
                          onClick={() => handleDeactivate(p.id)}
                          className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="Arquivar Produto"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleActivate(p.id)}
                          className="p-1.5 hover:bg-emerald-50 text-emerald-500 hover:text-emerald-700 rounded-lg transition-colors"
                          title="Reativar Produto"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="font-sans font-bold text-slate-800 text-lg group-hover:text-emerald-700 transition-colors">
                    {p.nome}
                  </h3>

                  {/* Stock Levels progress visualizer */}
                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between items-end text-xs font-sans">
                      <span className="text-slate-400 font-medium">Saldo em Estoque</span>
                      <span className="font-bold text-slate-800">
                        {p.estoqueAtual} {p.unidade}
                      </span>
                    </div>

                    {/* Progress Indicator */}
                    <div className="w-full h-2 bg-slate-50 border border-slate-100/50 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${status.colorClass}`}
                        style={{ 
                          width: `${Math.min((p.estoqueAtual / Math.max(p.estoqueMinimo || 1, p.estoqueAtual || 1)) * 100, 100)}%` 
                        }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] font-sans text-slate-400 pt-1">
                      <span>Mínimo: {p.estoqueMinimo} {p.unidade}</span>
                      <span className={`font-semibold ${status.textColor}`}>
                        {status.text}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-xs`}>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Estoque Unitário</span>
                  </div>
                  <span className="font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                    {p.unidade}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit product modal */}
      {showModal && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 font-sans">
                  {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-sans">
                  {editingProduct ? 'Modifique os detalhes do produto cadastrado' : 'Insira as informações de saldo do produto agrícola.'}
                </p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
              
              {/* Product Name */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 font-sans">Nome do Produto</label>
                <input 
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Ureia Super N, Glifosato WG, etc."
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                />
              </div>

              {/* Category & Unit (Two columns on grid desktop) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 font-sans">Categoria</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value as any)}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all bg-white"
                  >
                    {CATEGORIAS.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 font-sans">Unidade de Medida</label>
                  <select
                    value={unidade}
                    onChange={(e) => setUnidade(e.target.value as any)}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all bg-white"
                  >
                    {UNIDADES.map(uni => (
                      <option key={uni} value={uni}>{uni}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Initial stock and Min Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 font-sans">
                    {editingProduct ? 'Saldo Atual' : 'Saldo Inicial'}
                  </label>
                  <div className="relative">
                    <input 
                      type="number"
                      required
                      min="0"
                      step="any"
                      value={estoqueAtual}
                      onChange={(e) => setEstoqueAtual(Number(e.target.value))}
                      className="w-full h-12 px-4 pr-12 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                    />
                    <div className="absolute right-4 top-3.5 text-xs font-semibold text-slate-400 uppercase pointer-events-none">
                      {unidade}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 font-sans">Estoque Mínimo</label>
                  <div className="relative">
                    <input 
                      type="number"
                      required
                      min="0"
                      step="any"
                      value={estoqueMinimo}
                      onChange={(e) => setEstoqueMinimo(Number(e.target.value))}
                      className="w-full h-12 px-4 pr-12 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                    />
                    <div className="absolute right-4 top-3.5 text-xs font-semibold text-slate-400 uppercase pointer-events-none">
                      {unidade}
                    </div>
                  </div>
                </div>

              </div>

              {/* Help tip card */}
              <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 flex gap-3 text-amber-800 text-xs leading-relaxed">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <span className="font-bold">Dica AgroGomes: </span>
                  O sistema alertará em vermelho quando o estoque ficar abaixo do nível mínimo estipulado.
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="p-4 bg-slate-50 -mx-6 -mb-6 flex gap-3 justify-end border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-sm transition-all font-sans"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md active:scale-95 flex items-center gap-1.5 font-sans"
                >
                  {modalLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingProduct ? 'Atualizar Produto' : 'Gravar Produto'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
