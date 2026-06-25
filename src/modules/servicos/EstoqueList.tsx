import React, { useState } from 'react';
import { Estoque } from '../../types';
import { Plus, Package, Edit2, Trash2 } from 'lucide-react';
import { addDoc, collection, doc, updateDoc, deleteDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import { handleFirestoreError } from '../../utils/errorHandling';

interface EstoqueListProps {
  estoque: Estoque[];
  farmId: string;
  userRole: string;
}

export function EstoqueList({ estoque, farmId, userRole }: EstoqueListProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('defensivo');
  const [quantidadeAtual, setQuantidadeAtual] = useState<number>(0);
  const [unidade, setUnidade] = useState('L');
  const [lote, setLote] = useState('');
  const [validade, setValidade] = useState('');
  const [addingStockTo, setAddingStockTo] = useState<string | null>(null);
  const [addQuantidade, setAddQuantidade] = useState<number>(0);

  const isAdmin = userRole === 'admin';

  const handleCreateProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome) return;

    try {
      const docRef = await addDoc(collection(db, 'estoque'), {
        nome,
        tipo,
        quantidadeAtual,
        unidade,
        lote: lote || null,
        validade: validade ? new Date(validade) : null,
        farmId,
        updatedAt: serverTimestamp()
      });

      if (quantidadeAtual > 0) {
        await addDoc(collection(db, 'movimentacoes_estoque'), {
          farmId,
          produtoId: docRef.id,
          userId: auth.currentUser?.uid,
          tipo: 'entrada',
          quantidade: quantidadeAtual,
          motivo: 'Cadastro inicial de produto',
          createdAt: serverTimestamp()
        });
      }

      setIsCreating(false);
      setNome('');
      setTipo('defensivo');
      setQuantidadeAtual(0);
      setUnidade('L');
      setLote('');
      setValidade('');
    } catch (error) {
      handleFirestoreError(error, 'create' as any, 'estoque');
    }
  };

  const handleDeleteProduto = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este produto do estoque?')) {
      try {
        await deleteDoc(doc(db, 'estoque', id));
      } catch (error) {
        handleFirestoreError(error, 'delete' as any, 'estoque');
      }
    }
  };

  const handleAddStock = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (addQuantidade <= 0) return;

    try {
      await updateDoc(doc(db, 'estoque', id), {
        quantidadeAtual: increment(addQuantidade),
        updatedAt: serverTimestamp()
      });

      await addDoc(collection(db, 'movimentacoes_estoque'), {
        farmId,
        produtoId: id,
        userId: auth.currentUser?.uid,
        tipo: 'entrada',
        quantidade: addQuantidade,
        motivo: 'Entrada manual',
        createdAt: serverTimestamp()
      });

      setAddingStockTo(null);
      setAddQuantidade(0);
    } catch (error) {
      handleFirestoreError(error, 'update' as any, 'estoque');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Controle de Estoque</h2>
        {isAdmin && (
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Produto
          </button>
        )}
      </div>

      {isCreating && isAdmin && (
        <form onSubmit={handleCreateProduto} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <h3 className="font-semibold text-slate-800">Adicionar Produto</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Produto</label>
              <input
                type="text"
                required
                value={nome}
                onChange={e => setNome(e.target.value)}
                className="w-full rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Ex: Glifosato"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
              <select
                value={tipo}
                onChange={e => setTipo(e.target.value)}
                className="w-full rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="defensivo">Defensivo</option>
                <option value="fertilizante">Fertilizante</option>
                <option value="semente">Semente</option>
                <option value="combustivel">Combustível</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quantidade Inicial</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={quantidadeAtual}
                onChange={e => setQuantidadeAtual(Number(e.target.value))}
                className="w-full rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Unidade</label>
              <select
                value={unidade}
                onChange={e => setUnidade(e.target.value)}
                className="w-full rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="L">Litros (L)</option>
                <option value="kg">Quilogramas (kg)</option>
                <option value="g">Gramas (g)</option>
                <option value="un">Unidades (un)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Lote (Opcional)</label>
              <input
                type="text"
                value={lote}
                onChange={e => setLote(e.target.value)}
                className="w-full rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Ex: L12345"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Validade (Opcional)</label>
              <input
                type="date"
                value={validade}
                onChange={e => setValidade(e.target.value)}
                className="w-full rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              Salvar Produto
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {estoque.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-100">
            <p className="text-slate-500">Nenhum produto cadastrado no estoque.</p>
          </div>
        ) : (
          estoque.map(item => (
            <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{item.nome}</h3>
                    <p className="text-xs text-slate-500">Tipo: {item.tipo}</p>
                    {item.lote && <p className="text-xs text-slate-500">Lote: {item.lote}</p>}
                    {item.validade && <p className="text-xs text-slate-500">Validade: {item.validade.toLocaleDateString('pt-BR')}</p>}
                    <p className="text-xs text-slate-500 mt-1">Atualizado: {item.updatedAt.toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleDeleteProduto(item.id)}
                    className="text-slate-400 hover:text-red-600 transition-colors"
                    title="Remover"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Quantidade</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {item.quantidadeAtual} <span className="text-lg text-slate-500 font-normal">{item.unidade}</span>
                    </p>
                  </div>
                  {isAdmin && addingStockTo !== item.id && (
                    <button
                      onClick={() => setAddingStockTo(item.id)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      + Adicionar
                    </button>
                  )}
                </div>

                {addingStockTo === item.id && (
                  <form onSubmit={(e) => handleAddStock(e, item.id)} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      required
                      value={addQuantidade || ''}
                      onChange={e => setAddQuantidade(Number(e.target.value))}
                      className="w-full rounded-md border-slate-200 text-sm focus:border-blue-500 focus:ring-blue-500 py-1.5"
                      placeholder="Qtd"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                    >
                      Salvar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAddingStockTo(null);
                        setAddQuantidade(0);
                      }}
                      className="px-2 py-1.5 text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
