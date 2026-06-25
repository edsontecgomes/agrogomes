import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { PecaManutencao } from '../types';
import { handleFirestoreError, OperationType } from '../utils/errorHandling';

const DEFAULT_PECAS = [
  { nome: 'Filtro de Óleo Lubrificante JD 6115', codigo: 'RE504836', marca: 'John Deere', quantidadeMinima: 2 },
  { nome: 'Filtro de Combustível Separador Puma', codigo: '84348882', marca: 'Case IH', quantidadeMinima: 2 },
  { nome: 'Bico de Pulverização Defletor', codigo: 'DEF-02', marca: 'Jacto', quantidadeMinima: 10 },
  { nome: 'Correia Alternador Estriada', codigo: '8PK1435', marca: 'Gates', quantidadeMinima: 1 },
];

export function usePecasManutencao(farmId: string | null) {
  const [pecas, setPecas] = useState<PecaManutencao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!farmId) {
      setPecas([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'pecas_manutencao'),
      where('farmId', '==', farmId)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const data = snapshot.docs.map(docSnap => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          ...d,
          createdAt: d.createdAt?.toDate ? d.createdAt.toDate() : d.createdAt,
          updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate() : d.updatedAt,
        } as unknown as PecaManutencao;
      });

      // Seed pieces dynamically if there is none to ensure a delight UI
      if (snapshot.empty && data.length === 0) {
        setLoading(true);
        try {
          for (const pc of DEFAULT_PECAS) {
            const newDocRef = doc(collection(db, 'pecas_manutencao'));
            await setDoc(newDocRef, {
              id: newDocRef.id,
              farmId,
              nome: pc.nome,
              codigo: pc.codigo,
              marca: pc.marca,
              quantidadeMinima: pc.quantidadeMinima,
              equipamentosCompativeis: [],
              manutencoesAssociadas: [],
              ativo: true,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          }
          return;
        } catch (err) {
          console.error('Erro ao semear peças padrão:', err);
        }
      }

      setPecas(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'pecas_manutencao');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [farmId]);

  const criarPeca = async (
    nome: string,
    codigo?: string,
    marca?: string,
    quantidadeMinima?: number,
    produtoEstoqueId?: string,
    equipamentosCompativeis: string[] = [],
    manutencoesAssociadas: string[] = []
  ) => {
    if (!farmId) throw new Error('Farm ID é necessário');
    try {
      const newDocRef = doc(collection(db, 'pecas_manutencao'));
      const payload = {
        id: newDocRef.id,
        farmId,
        nome: nome.trim(),
        codigo: codigo?.trim() || '',
        marca: marca?.trim() || '',
        quantidadeMinima: quantidadeMinima || 0,
        produtoEstoqueId: produtoEstoqueId || '',
        equipamentosCompativeis,
        manutencoesAssociadas,
        ativo: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await setDoc(newDocRef, payload);
      return newDocRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'pecas_manutencao');
    }
  };

  const atualizarPeca = async (id: string, data: Partial<PecaManutencao>) => {
    try {
      const docRef = doc(db, 'pecas_manutencao', id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `pecas_manutencao/${id}`);
    }
  };

  const desativarPeca = async (id: string) => {
    try {
      const docRef = doc(db, 'pecas_manutencao', id);
      await updateDoc(docRef, {
        ativo: false,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `pecas_manutencao/${id}`);
    }
  };

  return {
    pecas,
    loading,
    criarPeca,
    atualizarPeca,
    desativarPeca
  };
}
