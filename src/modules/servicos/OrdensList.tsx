import React, { useState, useEffect } from 'react';
import { OrdemServico, Usuario, Estoque, Talhao } from '../../types';
import { 
  Plus, 
  CheckCircle2, 
  Clock, 
  PlayCircle, 
  StopCircle, 
  MapPin, 
  Package, 
  Trash2, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import { useOrdensServico, useExecucoesServico, useMinhasExecucoesAtivas } from '../../hooks/useServicos';
import { useConfigOperacaoProdutos } from '../../hooks/useConfigOperacaoProdutos';
import { useEquipamentos } from '../../hooks/useEquipamentos';
import { ExecucoesList } from './ExecucoesList';
import { TalhaoWalkingDrawer } from '../talhoes/TalhaoWalkingDrawer';
import { ChecklistRunner } from './ChecklistRunner';
import { OrdemCard } from './OrdemCard';
import { OrdemMachineModal } from '../combustivel/OrdemMachineModal';
import { addDoc, collection, serverTimestamp, updateDoc, doc, query, where, getDocs, writeBatch, increment } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import { handleFirestoreError, OperationType } from '../../utils/errorHandling';

interface OrdensListProps {
  ordens: OrdemServico[];
  farmId: string;
  userRole: string;
  usuarios: Usuario[];
  talhoes: Talhao[];
  usuarioId: string;
  estoque: Estoque[];
}

type ProdutoOrdem = NonNullable<OrdemServico['produtos']>[number];

export function OrdensList({ farmId, userRole, usuarios, talhoes, usuarioId, estoque }: OrdensListProps) {
  const { 
    ordens, 
    loading: loadingOrdens, 
    criarOrdem, 
    atualizarStatusOS 
  } = useOrdensServico(farmId);
  
  const { execucoesAtivas } = useMinhasExecucoesAtivas(farmId);
  const { configs } = useConfigOperacaoProdutos(farmId);
  const { equipamentos } = useEquipamentos(farmId);
  
  const [isCreating, setIsCreating] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipoOperacao, setTipoOperacao] = useState<OrdemServico['tipoOperacao']>('Outros');
  const [talhaoId, setTalhaoId] = useState('');
  const [larguraOperacional, setLarguraOperacional] = useState<number>(0);
  const [osProdutos, setOsProdutos] = useState<ProdutoOrdem[]>([]);
  const [maquinaId, setMaquinaId] = useState('');
  const [implementoId, setImplementoId] = useState('');
  
  const [checklistOrdem, setChecklistOrdem] = useState<OrdemServico | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Product Selector inside Form states
  const [selectedProdutoId, setSelectedProdutoId] = useState('');
  const [doseInput, setDoseInput] = useState<string>('');

  // Insufficient stock alert state
  const [insufficientStockData, setInsufficientStockData] = useState<{
    execucaoId: string;
    ordem: OrdemServico;
    products: { nome: string; atual: number; necessario: number; unidade: string }[];
    location: any;
  } | null>(null);

  const [machineModalStart, setMachineModalStart] = useState<OrdemServico | null>(null);
  const [machineModalFinish, setMachineModalFinish] = useState<{ordem: OrdemServico, execucaoId: string} | null>(null);

  const canManage = userRole === 'admin' || userRole === 'gerente';

  const encontrarItemEstoque = (produto: {
    produtoId: string;
    origemEstoque?: 'produtos' | 'estoque';
  }) => {
    return estoque.find(item =>
      item.id === produto.produtoId &&
      (
        !produto.origemEstoque ||
        item.origemEstoque === produto.origemEstoque
      )
    ) || estoque.find(item => item.id === produto.produtoId);
  };

  const enriquecerProduto = (produto: ProdutoOrdem): ProdutoOrdem => {
    const itemEstoque = encontrarItemEstoque(produto);
    const {
      categoria: categoriaProduto,
      lote: loteProduto,
      origemEstoque: origemProduto,
      ...dadosProduto
    } = produto;
    const categoria = categoriaProduto || itemEstoque?.tipo;
    const lote = loteProduto || itemEstoque?.lote;

    return {
      ...dadosProduto,
      ...(categoria ? { categoria } : {}),
      ...(lote ? { lote } : {}),
      origemEstoque:
        origemProduto ||
        itemEstoque?.origemEstoque ||
        'estoque'
    };
  };

  const tiposOperacao: OrdemServico['tipoOperacao'][] = [
    'Plantio',
    'Pulverizacao',
    'Adubacao',
    'Colheita',
    'Outros'
  ];

  useEffect(() => {
    if (tipoOperacao) {
      const config = configs.find(c => c.tipoOperacao === tipoOperacao);
      if (config) {
        setOsProdutos(config.produtosPadrao);
      } else {
        setOsProdutos([]);
      }
    }
  }, [tipoOperacao, configs]);

  const handleStartService = async (ordem: OrdemServico) => {
    if (ordem.maquinaId) {
       setMachineModalStart(ordem);
       return;
    }
    processStartService(ordem);
  };

  const processStartService = async (ordem: OrdemServico, horimetroInicial?: number) => {
    try {
      let location;
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { 
            enableHighAccuracy: true, 
            timeout: 5000, 
            maximumAge: 0 
          });
        });
        location = { lat: position.coords.latitude, lng: position.coords.longitude, accuracy: position.coords.accuracy };
      } catch (e) { console.warn('GPS failed', e); }

      const newExecRef = await addDoc(collection(db, 'execucoes_servico'), {
        ordemId: ordem.id,
        farmId,
        talhaoId: ordem.talhaoId,
        operadorId: auth.currentUser?.uid,
        status: 'em_execucao',
        dataInicio: serverTimestamp(),
        origemStart: 'manual',
        locationStart: location || null,
        createdAt: serverTimestamp(),
        maquinaId: ordem.maquinaId || null,
        maquinaNome: ordem.maquinaNome || null,
        implementoId: ordem.implementoId || null,
        implementoNome: ordem.implementoNome || null,
        produtos: ordem.produtos || [],
        ...(horimetroInicial !== undefined ? { horimetroInicial } : {})
      });

      if (horimetroInicial !== undefined && ordem.maquinaId) {
        await addDoc(collection(db, 'horimetros'), {
          farmId,
          producerId: auth.currentUser?.uid || '',
          maquinaId: ordem.maquinaId,
          maquinaNome: ordem.maquinaNome || '',
          horimetroAnterior: horimetroInicial, // Best effort
          horimetroAtual: horimetroInicial,
          dataRegistro: serverTimestamp(),
          operadorId: auth.currentUser?.uid || '',
          operadorNome: 'Operador',
          observacao: `Abertura da Ordem #${ordem.id.slice(-6)}`,
          createdAt: serverTimestamp()
        });
        
        await updateDoc(doc(db, 'equipamentos', ordem.maquinaId), {
          horimetroAtual: horimetroInicial,
          ultimaAtualizacaoHorimetro: serverTimestamp()
        });
      }

      if (ordem.status === 'pendente') {
        await updateDoc(doc(db, 'ordens_servico', ordem.id), { status: 'em_execucao' });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'execucoes_servico');
    }
  };

  const executeAtomicFinalization = async (execucaoId: string, ordem: OrdemServico, location: any, horimetroFinal?: number) => {
    try {
      const batch = writeBatch(db);

      // 1. Finalize execution
      const execRef = doc(db, 'execucoes_servico', execucaoId);
      batch.update(execRef, {
        status: 'finalizada',
        dataFim: serverTimestamp(),
        locationEnd: location || null,
        ...(horimetroFinal !== undefined ? { horimetroFinal } : {})
      });

      if (horimetroFinal !== undefined && ordem.maquinaId) {
        const hRef = doc(collection(db, 'horimetros'));
        batch.set(hRef, {
          farmId,
          producerId: auth.currentUser?.uid || '',
          maquinaId: ordem.maquinaId,
          maquinaNome: ordem.maquinaNome || '',
          horimetroAnterior: horimetroFinal, // We don't have the initial exact here synchronously, so we log
          horimetroAtual: horimetroFinal,
          dataRegistro: serverTimestamp(),
          operadorId: auth.currentUser?.uid || '',
          operadorNome: 'Operador',
          observacao: `Fechamento da Ordem #${ordem.id.slice(-6)}`,
          createdAt: serverTimestamp()
        });
        
        const maquinaRef = doc(db, 'equipamentos', ordem.maquinaId);
        batch.update(maquinaRef, {
          horimetroAtual: horimetroFinal,
          ultimaAtualizacaoHorimetro: serverTimestamp()
        });
      }

      const isAreaBased = ['Plantio', 'Pulverizacao', 'Adubacao'].includes(ordem.tipoOperacao);
      const talhao = talhoes.find(t => t.id === ordem.talhaoId);
      const area = talhao?.area || 0;

      // 2. Decrement stock & Create movement for EACH product
      if (ordem.produtos && ordem.produtos.length > 0) {
        for (const p of ordem.produtos) {
          const qtyConsumida = isAreaBased && area > 0 ? (p.dose || 0) * area : (p.dose || 0);
          const itemEstoque = encontrarItemEstoque(p);
          const origemEstoque =
            p.origemEstoque ||
            itemEstoque?.origemEstoque ||
            'estoque';

          // Update stock
          const stockRef = doc(db, origemEstoque, p.produtoId);
          batch.update(
            stockRef,
            origemEstoque === 'produtos'
              ? {
                  estoqueAtual: increment(-qtyConsumida),
                  updatedAt: serverTimestamp()
                }
              : {
                  quantidadeAtual: increment(-qtyConsumida),
                  updatedAt: serverTimestamp()
                }
          );

          // Create movement
          const movRef = doc(collection(db, 'movimentacoes_estoque'));
          batch.set(movRef, {
            id: movRef.id,
            produtoId: p.produtoId,
            produtoNome: p.nome || '',
            categoria: p.categoria || itemEstoque?.tipo || null,
            lote: p.lote || itemEstoque?.lote || null,
            unidade: p.unidade || itemEstoque?.unidade || null,
            dose: p.dose || 0,
            quantidade: qtyConsumida,
            tipo: 'saida',
            origemEstoque,
            ordemId: ordem.id,
            execucaoId,
            farmId,
            producerId: auth.currentUser?.uid || '',
            data: serverTimestamp(),
            createdAt: serverTimestamp()
          });
        }
      }

      // Committing atomic batch operations!
      await batch.commit();

      // Adjust overall Service Order status
      const q = query(
        collection(db, 'execucoes_servico'),
        where('farmId', '==', farmId),
        where('ordemId', '==', ordem.id),
        where('status', '==', 'em_execucao')
      );
      const snapshot = await getDocs(q);
      const activeExecs = snapshot.docs.filter(d => d.id !== execucaoId);
      if (activeExecs.length === 0) {
        await updateDoc(doc(db, 'ordens_servico', ordem.id), { status: 'finalizada' });
      } else {
        await updateDoc(doc(db, 'ordens_servico', ordem.id), { status: 'parcial' });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `execucoes_servico/${execucaoId}`);
      throw error;
    }
  };

  const handleFinishTrabalho = async (execucaoId: string, ordem: OrdemServico) => {
    setErrorMsg('');
    try {
      let location;
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { 
            enableHighAccuracy: true, 
            timeout: 5000, 
            maximumAge: 0 
          });
        });
        location = { lat: position.coords.latitude, lng: position.coords.longitude, accuracy: position.coords.accuracy };
      } catch (e) { console.warn('GPS failed', e); }

      // PRE-CHECK STOCK INSUFFICENCY
      const isAreaBased = ['Plantio', 'Pulverizacao', 'Adubacao'].includes(ordem.tipoOperacao);
      const talhao = talhoes.find(t => t.id === ordem.talhaoId);
      const area = talhao?.area || 0;

      const insufficientList = [];
      if (ordem.produtos && ordem.produtos.length > 0) {
        for (const p of ordem.produtos) {
          const qtyRequired = isAreaBased && area > 0 ? (p.dose || 0) * area : (p.dose || 0);
          const stockItem = encontrarItemEstoque(p);
          const currentQty = stockItem ? stockItem.quantidadeAtual : 0;
          if (currentQty < qtyRequired) {
            insufficientList.push({
              nome: p.nome || 'Produto',
              atual: currentQty,
              necessario: qtyRequired,
              unidade: p.unidade || 'un'
            });
          }
        }
      }

      if (insufficientList.length > 0) {
        setInsufficientStockData({
          execucaoId,
          ordem,
          location,
          products: insufficientList
        });
        return;
      }

      if (ordem.maquinaId) {
         setMachineModalFinish({ ordem, execucaoId, location } as any);
         return;
      }

      await executeAtomicFinalization(execucaoId, ordem, location);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `execucoes_servico/${execucaoId}`);
    }
  };

  if (loadingOrdens) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Carregando ordens de serviço...</p>
      </div>
    );
  }

  const filteredOrdens = canManage ? ordens : ordens.filter(o => o.status !== 'finalizada');

  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Operações em Campo</h2>
          <p className="text-sm text-slate-500">Gerencie ordens de serviço e execuções</p>
        </div>
        {canManage && (
          <button
            onClick={() => {
              if (!isCreating) {
                setTitulo('');
                setDescricao('');
                setTipoOperacao('Outros');
                setTalhaoId('');
                setLarguraOperacional(0);
                setOsProdutos([]);
                setMaquinaId('');
                setImplementoId('');
              }
              setIsCreating(!isCreating);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            Nova Ordem
          </button>
        )}
      </div>

      {isCreating && canManage && (
        <form 
          onSubmit={async (e) => {
            e.preventDefault();
            setErrorMsg('');
            
            // Check if selected products exist in stock
            if (osProdutos.length > 0) {
              const invalidProducts = osProdutos.filter(p => !estoque.some(estItem => estItem.id === p.produtoId));
              if (invalidProducts.length > 0) {
                setErrorMsg(`Os seguintes produtos selecionados não foram encontrados no estoque recente da fazenda: ${invalidProducts.map(p => p.nome).join(', ')}. Favor selecionar insumos ativos.`);
                return;
              }
            }

            const selectedMaquina = equipamentos.find(eq => eq.id === maquinaId);
            const selectedImplemento = equipamentos.find(eq => eq.id === implementoId);
            const produtosNormalizados = osProdutos.map(enriquecerProduto);

            await criarOrdem({
              titulo,
              descricao,
              tipoOperacao,
              talhaoId,
              larguraOperacional,
              produtos: produtosNormalizados,
              maquinaId: maquinaId || undefined,
              maquinaNome: selectedMaquina ? selectedMaquina.nome : undefined,
              implementoId: implementoId || undefined,
              implementoNome: selectedImplemento ? selectedImplemento.nome : undefined,
            });
            setIsCreating(false);
          }} 
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-lg">Nova Ordem de Serviço</h3>
            <button type="button" onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-600">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Título</label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  className="w-full rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Ex: Aplicação de Herbicida"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Operação</label>
                <select
                  required
                  value={tipoOperacao}
                  onChange={e => setTipoOperacao(e.target.value as any)}
                  className="w-full rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                >
                  {tiposOperacao.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Talhão</label>
                <select
                  required
                  value={talhaoId}
                  onChange={e => setTalhaoId(e.target.value)}
                  className="w-full rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Selecione o talhão</option>
                  {talhoes.map(t => <option key={t.id} value={t.id}>{t.nome} ({t.area} ha)</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Largura Operacional (metros)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={larguraOperacional}
                  onChange={e => setLarguraOperacional(parseFloat(e.target.value))}
                  className="w-full rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Ex: 12.0"
                />
              </div>

              {/* Seção Equipamentos */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Equipamentos</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Máquina</label>
                    <select
                      value={maquinaId}
                      onChange={e => setMaquinaId(e.target.value)}
                      className="w-full text-sm rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Selecione Máquina</option>
                      {equipamentos
                        .filter(e => e.ativo && e.tipo === 'maquina')
                        .map(e => (
                          <option key={e.id} value={e.id}>{e.nome}</option>
                        ))
                      }
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Implemento</label>
                    <select
                      value={implementoId}
                      onChange={e => setImplementoId(e.target.value)}
                      className="w-full text-sm rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Selecione Implemento</option>
                      {equipamentos
                        .filter(e => e.ativo && e.tipo === 'implemento')
                        .map(e => (
                          <option key={e.id} value={e.id}>{e.nome}</option>
                        ))
                      }
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Dynamic Products and Doses Selector */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-500" />
                  Produtos da Operação (Insumos)
                </span>
                
                {/* List of current selected products */}
                <div className="space-y-2">
                  {osProdutos.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Nenhum produto cadastrado nesta Ordem de Serviço.</p>
                  ) : (
                    osProdutos.map((p, idx) => {
                      const existInEstoque = estoque.some(e => e.id === p.produtoId);
                      return (
                        <div key={idx} className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm animate-fade-in">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              {p.nome}
                              {!existInEstoque && (
                                <span className="inline-flex text-[9px] bg-rose-100 text-rose-700 px-1 py-0.5 rounded font-black uppercase">
                                  Inexistente no Estoque
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              Dose: {p.dose} {p.unidade}
                              {p.lote ? ` • Lote: ${p.lote}` : ''}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setOsProdutos(osProdutos.filter((_, i) => i !== idx))}
                            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Adding form controls */}
                <div className="border-t border-slate-200/60 pt-3 flex flex-col gap-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Selecionar Insumo</label>
                      <select
                        value={selectedProdutoId}
                        onChange={e => setSelectedProdutoId(e.target.value)}
                        className="w-full text-xs rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
                      >
                        <option value="">Escolha um Insumo</option>
                        {estoque
                          .filter(e => !osProdutos.some(op => op.produtoId === e.id))
                          .map(e => (
                            <option key={e.id} value={e.id}>
                              {e.nome}
                              {e.lote ? ` • lote ${e.lote}` : ''}
                              {' '}({e.quantidadeAtual} {e.unidade} disp.)
                            </option>
                          ))
                        }
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        Dose Recom. ({selectedProdutoId ? estoque.find(e => e.id === selectedProdutoId)?.unidade : 'Un.'})
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={doseInput}
                        onChange={e => setDoseInput(e.target.value)}
                        className="w-full text-xs rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedProdutoId || !doseInput) return;
                      const selected = estoque.find(e => e.id === selectedProdutoId);
                      if (selected) {
                        setOsProdutos([...osProdutos, {
                          produtoId: selected.id,
                          nome: selected.nome,
                          dose: parseFloat(doseInput),
                          unidade: selected.unidade,
                          categoria: selected.tipo,
                          lote: selected.lote,
                          origemEstoque: selected.origemEstoque || 'estoque'
                        }]);
                        setSelectedProdutoId('');
                        setDoseInput('');
                      }
                    }}
                    disabled={!selectedProdutoId || !doseInput}
                    className="w-full py-1.5 bg-blue-50 text-blue-600 disabled:opacity-50 disabled:bg-slate-50 disabled:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-wider border border-blue-100 hover:bg-blue-100 transition-colors"
                  >
                    + Adicionar Insumo da OS
                  </button>
                </div>
              </div>

              <label className="block text-sm font-bold text-slate-700">Observações</label>
              <textarea
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                className="w-full rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                rows={4}
                placeholder="Instruções para o operador..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md"
            >
              Salvar Ordem
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {filteredOrdens.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Nenhuma ordem de serviço pendente.</p>
          </div>
        ) : (
          filteredOrdens.map(ordem => {
            const activeExecs = execucoesAtivas.filter(e => e.ordemId === ordem.id);
            const myExec = activeExecs.find(e => e.operadorId === usuarioId);
            
            return (
              <OrdemCard 
                key={ordem.id}
                ordem={ordem}
                usuarioId={usuarioId}
                usuarios={usuarios}
                talhoes={talhoes}
                estoque={estoque}
                canManage={canManage}
                activeExecs={activeExecs}
                myExec={myExec}
                onStart={setChecklistOrdem}
                onFinish={handleFinishTrabalho}
                onCloseOS={(id) => atualizarStatusOS(id, 'finalizada')}
              />
            );
          })
        )}
      </div>

      {checklistOrdem && (
        <ChecklistRunner 
          farmId={farmId}
          operadorId={usuarioId}
          ordemId={checklistOrdem.id}
          tipoOperacao={checklistOrdem.tipoOperacao}
          onCancel={() => setChecklistOrdem(null)}
          onComplete={async () => {
            const ordemToStart = checklistOrdem;
            setChecklistOrdem(null);
            await handleStartService(ordemToStart);
          }}
        />
      )}

      {insufficientStockData && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-lg w-full border border-slate-100 shadow-xl space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 text-rose-600">
               <AlertCircle className="w-8 h-8" />
               <h3 className="text-xl font-black text-slate-900">Alerta: Estoque Insuficiente</h3>
            </div>

            <p className="text-sm text-slate-500 font-medium">
              A quantidade necessária calculada para os insumos desta operação excede o saldo físico atual do estoque.
            </p>

            <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-100">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Insumos em Falta</p>
               {insufficientStockData.products.map((p, idx) => (
                 <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">{p.nome}</span>
                    <span className="text-slate-500 font-medium">
                      Saldo: {p.atual.toFixed(2)} {p.unidade} | Requerido: <strong className="text-rose-600 font-bold">{p.necessario.toFixed(2)} {p.unidade}</strong>
                    </span>
                 </div>
               ))}
            </div>

            {canManage ? (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3.5 rounded-xl text-xs font-semibold">
                   Seu perfil de <strong>Gerente/Administrador</strong> possui autorização para forçar a baixa de estoque mesmo com saldo negativo.
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    onClick={() => setInsufficientStockData(null)}
                    className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={async () => {
                      const data = insufficientStockData;
                      setInsufficientStockData(null);
                      await executeAtomicFinalization(data.execucaoId, data.ordem, data.location);
                    }}
                    className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-rose-200/50 transition-all active:scale-95"
                  >
                    Confirmar e Prosseguir
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-100 border border-slate-200 text-slate-600 p-4 rounded-xl text-xs font-semibold">
                   ⚠️ <strong>Operador:</strong> Saldo insuficiente. Solicite ao gestor ou gerente da fazenda para efetuar o ajuste ou entrada do insumo no módulo de Estoque.
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setInsufficientStockData(null)}
                    className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all"
                  >
                    Fechar e Solicitar Ajuste
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {machineModalStart && (
        <OrdemMachineModal
          farmId={farmId}
          ordem={machineModalStart}
          action="start"
          onCancel={() => setMachineModalStart(null)}
          onConfirm={(h) => {
            setMachineModalStart(null);
            processStartService(machineModalStart, h);
          }}
        />
      )}

      {machineModalFinish && (
        <OrdemMachineModal
          farmId={farmId}
          ordem={machineModalFinish.ordem}
          action="finish"
          onCancel={() => setMachineModalFinish(null)}
          onConfirm={(h) => {
            const data = machineModalFinish;
            setMachineModalFinish(null);
            executeAtomicFinalization(data.execucaoId, data.ordem, (data as any).location, h);
          }}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: OrdemServico['status'] }) {
  switch (status) {
    case 'pendente':
      return <span className="px-3 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full flex items-center gap-1 uppercase tracking-wider"><Clock className="w-3 h-3" /> Pendente</span>;
    case 'em_execucao':
      return <span className="px-3 py-1 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center gap-1 uppercase tracking-wider shadow-sm"><PlayCircle className="w-3 h-3" /> Em Execução</span>;
    case 'parcial':
      return <span className="px-3 py-1 bg-slate-300 text-slate-800 text-[10px] font-bold rounded-full flex items-center gap-1 uppercase tracking-wider"><CheckCircle2 className="w-3 h-3" /> Parcial</span>;
    case 'finalizada':
      return <span className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center gap-1 uppercase tracking-wider"><CheckCircle2 className="w-3 h-3" /> Finalizada</span>;
    default:
      return null;
  }
}
