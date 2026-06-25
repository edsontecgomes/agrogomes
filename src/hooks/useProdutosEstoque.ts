import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { useFarm } from '../contexts/FarmContext';
import { ProdutoEstoque } from '../types';
import { handleFirestoreError, OperationType } from '../utils/errorHandling';

export function useProdutosEstoque(farmId: string | null) {
  const [produtos, setProdutos] = useState<ProdutoEstoque[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeFarm } = useFarm();

  const syncPecaManutencao = async (
    pFarmId: string, 
    produtoId: string, 
    nome: string, 
    categoria: string, 
    estoqueMinimo: number, 
    ativo: boolean
  ) => {
    try {
      const q = query(
        collection(db, 'pecas_manutencao'),
        where('farmId', '==', pFarmId),
        where('produtoEstoqueId', '==', produtoId)
      );
      const snap = await getDocs(q);

      if (categoria === 'Peça de Manutenção') {
        if (!snap.empty) {
          const pecaDoc = snap.docs[0];
          await updateDoc(doc(db, 'pecas_manutencao', pecaDoc.id), {
            nome: nome.trim(),
            quantidadeMinima: estoqueMinimo,
            ativo: ativo,
            updatedAt: serverTimestamp()
          });
        } else {
          const newPecaDocRef = doc(collection(db, 'pecas_manutencao'));
          await setDoc(newPecaDocRef, {
            id: newPecaDocRef.id,
            farmId: pFarmId,
            nome: nome.trim(),
            codigo: '',
            marca: '',
            quantidadeMinima: estoqueMinimo,
            produtoEstoqueId: produtoId,
            equipamentosCompativeis: [],
            manutencoesAssociadas: [],
            ativo: ativo,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
      } else {
        if (!snap.empty) {
          const pecaDoc = snap.docs[0];
          await updateDoc(doc(db, 'pecas_manutencao', pecaDoc.id), {
            ativo: false,
            updatedAt: serverTimestamp()
          });
        }
      }
    } catch (error) {
      console.error('Erro ao sincronizar peça de manutenção:', error);
    }
  };

  useEffect(() => {
    if (!farmId) {
      setProdutos([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'produtos'),
      where('farmId', '==', farmId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(docSnap => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          ...d,
          createdAt: d.createdAt?.toDate ? d.createdAt.toDate() : d.createdAt,
          updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate() : d.updatedAt,
        } as unknown as ProdutoEstoque;
      });
      setProdutos(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'produtos');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [farmId]);

  const criarProduto = async (
    nome: string,
    categoria: string,
    unidade: string,
    estoqueAtual: number,
    estoqueMinimo: number
  ) => {
    if (!farmId) throw new Error('Farm ID é necessário');
    const producerId = activeFarm?.producerId || auth.currentUser?.uid || '';
    
    try {
      const newDocRef = doc(collection(db, 'produtos'));
      const productPayload = {
        id: newDocRef.id,
        farmId,
        producerId,
        nome,
        categoria,
        unidade,
        estoqueAtual,
        estoqueMinimo,
        ativo: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await setDoc(newDocRef, productPayload);

      // Automatic Sync to pecas_manutencao
      await syncPecaManutencao(farmId, newDocRef.id, nome, categoria, estoqueMinimo, true);

      return newDocRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'produtos');
    }
  };

  const atualizarProduto = async (id: string, data: Partial<ProdutoEstoque>) => {
    try {
      const prodRef = doc(db, 'produtos', id);
      await updateDoc(prodRef, {
        ...data,
        updatedAt: serverTimestamp()
      });

      // Automatic Sync to pecas_manutencao on update
      if (farmId) {
        const oldProd = produtos.find(p => p.id === id);
        const updatedNome = data.nome !== undefined ? data.nome : (oldProd?.nome || '');
        const updatedCategoria = data.categoria !== undefined ? data.categoria : (oldProd?.categoria || '');
        const updatedEstoqueMinimo = data.estoqueMinimo !== undefined ? data.estoqueMinimo : (oldProd?.estoqueMinimo || 0);
        const updatedAtivo = data.ativo !== undefined ? data.ativo : (oldProd?.ativo ?? true);

        await syncPecaManutencao(farmId, id, updatedNome, updatedCategoria, updatedEstoqueMinimo, updatedAtivo);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'produtos');
    }
  };

  const desativarProduto = async (id: string) => {
    try {
      const prodRef = doc(db, 'produtos', id);
      await updateDoc(prodRef, {
        ativo: false,
        updatedAt: serverTimestamp()
      });

      // Automatic Sync to pecas_manutencao on deactivation
      if (farmId) {
        const oldProd = produtos.find(p => p.id === id);
        const updatedNome = oldProd?.nome || '';
        const updatedCategoria = oldProd?.categoria || '';
        const updatedEstoqueMinimo = oldProd?.estoqueMinimo || 0;

        await syncPecaManutencao(farmId, id, updatedNome, updatedCategoria, updatedEstoqueMinimo, false);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'produtos');
    }
  };

  return {
    produtos,
    loading,
    criarProduto,
    atualizarProduto,
    desativarProduto
  };
}
