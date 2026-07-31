import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import {
  cacheEquipamentos,
  getCachedEquipamentos,
  OFFLINE_REFERENCE_STORE_EVENT
} from '../services/offlineReferenceStore';
import { useFarm } from '../contexts/FarmContext';
import { Equipamento } from '../types';
import { handleFirestoreError, OperationType } from '../utils/errorHandling';

// Default mock equipment to seed if none exist, ensuring delightful UX out of the box
const DEFAULT_EQUIPAMENTOS = [
  { nome: 'Trator John Deere 6115J', tipo: 'maquina' as const },
  { nome: 'Trator Case IH Puma 200', tipo: 'maquina' as const },
  { nome: 'Colheitadeira New Holland CR 7.90', tipo: 'maquina' as const },
  { nome: 'Semeadora Baldan', tipo: 'implemento' as const },
  { nome: 'Pulverizador Jacto Uniport 3030', tipo: 'implemento' as const },
  { nome: 'Grade Niveladora Civemasa', tipo: 'implemento' as const },
];

export function useEquipamentos(farmId: string | null) {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!farmId) {
      setEquipamentos([]);
      setLoading(false);
      return;
    }

    const readCachedEquipamentos = () => {
      setEquipamentos(
        getCachedEquipamentos(farmId)
      );
    };

    readCachedEquipamentos();

    window.addEventListener(
      OFFLINE_REFERENCE_STORE_EVENT,
      readCachedEquipamentos
    );

    const q = query(
      collection(db, 'equipamentos'),
      where('farmId', '==', farmId)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const data = snapshot.docs.map(docSnap => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          ...d,
          createdAt: d.createdAt?.toDate ? d.createdAt.toDate() : d.createdAt,
        } as unknown as Equipamento;
      });

      // Se não houver equipamentos cadastrados, gerar alguns iniciais automáticos para facilitar a usabilidade de teste
      if (
        snapshot.empty &&
        data.length === 0 &&
        navigator.onLine &&
        !snapshot.metadata.fromCache &&
        getCachedEquipamentos(farmId).length === 0
      ) {
        setLoading(true);
        try {
          for (const eq of DEFAULT_EQUIPAMENTOS) {
            const newDocRef = doc(collection(db, 'equipamentos'));
            await setDoc(newDocRef, {
              id: newDocRef.id,
              farmId,
              nome: eq.nome,
              tipo: eq.tipo,
              ativo: true,
              createdAt: serverTimestamp()
            });
          }
          // The onSnapshot will trigger again, so we can just return
          return;
        } catch (err) {
          console.error('Erro ao semear equipamentos padrão:', err);
        }
      }

      if (
        snapshot.metadata.fromCache &&
        !navigator.onLine &&
        data.length === 0 &&
        getCachedEquipamentos(farmId).length > 0
      ) {
        readCachedEquipamentos();
        setLoading(false);
        return;
      }

      setEquipamentos(data);
      cacheEquipamentos(farmId, data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'equipamentos');
      readCachedEquipamentos();
      setLoading(false);
    });

    return () => {
      unsubscribe();
      window.removeEventListener(
        OFFLINE_REFERENCE_STORE_EVENT,
        readCachedEquipamentos
      );
    };
  }, [farmId]);

  const criarEquipamento = async (
    nome: string, 
    tipo: 'maquina' | 'implemento',
    extraData?: { marca?: string; modelo?: string; potencia?: string; largura?: string }
  ) => {
    if (!farmId) throw new Error('Farm ID é necessário');
    try {
      const newDocRef = doc(collection(db, 'equipamentos'));
      const payload = {
        id: newDocRef.id,
        farmId,
        nome: nome.trim(),
        tipo,
        ativo: true,
        ...extraData,
        createdAt: serverTimestamp()
      };
      await setDoc(newDocRef, payload);
      return newDocRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'equipamentos');
    }
  };

  const atualizarEquipamento = async (id: string, data: Partial<Equipamento>) => {
    try {
      const docRef = doc(db, 'equipamentos', id);
      await updateDoc(docRef, data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `equipamentos/${id}`);
    }
  };

  const desativarEquipamento = async (id: string) => {
    try {
      const docRef = doc(db, 'equipamentos', id);
      await updateDoc(docRef, { ativo: false });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `equipamentos/${id}`);
    }
  };

  return {
    equipamentos,
    loading,
    criarEquipamento,
    atualizarEquipamento,
    desativarEquipamento
  };
}
