import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, writeBatch, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { PlanoManutencao, ManutencaoExecutada } from '../types';
import { handleFirestoreError, OperationType } from '../utils/errorHandling';

export function usePlanosManutencao(farmId: string | null) {
  const [planos, setPlanos] = useState<PlanoManutencao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!farmId) {
      setPlanos([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'planos_manutencao'),
      where('farmId', '==', farmId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PlanoManutencao[];
      setPlanos(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'planos_manutencao');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [farmId]);

  const addPlano = async (planoData: Omit<PlanoManutencao, 'id' | 'farmId' | 'producerId' | 'createdAt'>) => {
    if (!farmId) throw new Error('Farm ID é necessário');
    try {
      const newRef = doc(collection(db, 'planos_manutencao'));
      await setDoc(newRef, {
        id: newRef.id,
        farmId,
        producerId: auth.currentUser?.uid || '',
        ...planoData,
        createdAt: serverTimestamp()
      });
      return newRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'planos_manutencao');
      throw error;
    }
  };

  const updatePlano = async (id: string, updates: Partial<PlanoManutencao>) => {
    try {
      await updateDoc(doc(db, 'planos_manutencao', id), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `planos_manutencao/${id}`);
      throw error;
    }
  };

  const toggleAtivo = async (id: string, currentStatus: boolean) => {
    return updatePlano(id, { ativo: !currentStatus });
  };

  return { planos, loading, addPlano, updatePlano, toggleAtivo };
}

export function useManutencoesExecutadas(farmId: string | null) {
  const [manutencoes, setManutencoes] = useState<ManutencaoExecutada[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!farmId) {
      setManutencoes([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'manutencoes_executadas'),
      where('farmId', '==', farmId),
      orderBy('dataExecucao', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Adjust for firestore timestamp
        dataExecucao: doc.data().dataExecucao?.toDate ? doc.data().dataExecucao.toDate() : doc.data().dataExecucao
      })) as ManutencaoExecutada[];
      setManutencoes(data);
      setLoading(false);
    }, (error) => {
      // It might fail index initially, so handle gracefully
      if (error.code === 'failed-precondition') {
         console.warn('Index missing for manutencoes_executadas, falling back to unordered read');
         const qFallback = query(
           collection(db, 'manutencoes_executadas'),
           where('farmId', '==', farmId)
         );
         onSnapshot(qFallback, (snapshotFallback) => {
            const dataFallback = snapshotFallback.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              dataExecucao: doc.data().dataExecucao?.toDate ? doc.data().dataExecucao.toDate() : doc.data().dataExecucao
            })) as ManutencaoExecutada[];
            // Sort client-side
            dataFallback.sort((a, b) => b.dataExecucao - a.dataExecucao);
            setManutencoes(dataFallback);
            setLoading(false);
         });
      } else {
        handleFirestoreError(error, OperationType.LIST, 'manutencoes_executadas');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [farmId]);

  const addManutencao = async (dados: Omit<ManutencaoExecutada, 'id' | 'farmId' | 'producerId' | 'createdAt'>) => {
    if (!farmId) throw new Error('Farm ID é necessário');
    try {
      const batch = writeBatch(db);
      
      const newRef = doc(collection(db, 'manutencoes_executadas'));
      batch.set(newRef, {
        id: newRef.id,
        farmId,
        producerId: auth.currentUser?.uid || '',
        ...dados,
        createdAt: serverTimestamp()
      });

      if (dados.planoId) {
        const planoRef = doc(db, 'planos_manutencao', dados.planoId);
        // We read it quickly or just update what we know. The new next execution will be:
        // By rules, proximaExecucao = horimetroExecucao + intervaloHoras
        // But we need to know the intervaloHoras. We can read the plano or pass it as parameter.
        // It's safer to pass plano.intervaloHoras into the app hook. Let's do it below without batch if we need a read, but it's simpler if caller calculates and passes the update.
      }
      
      await batch.commit();
      return newRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'manutencoes_executadas');
      throw error;
    }
  };

  return { manutencoes, loading, addManutencao };
}
