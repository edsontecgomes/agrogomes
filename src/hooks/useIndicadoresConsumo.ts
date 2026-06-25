import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { IndicadorConsumo } from '../types';
import { handleFirestoreError, OperationType } from '../utils/errorHandling';

export function useIndicadoresConsumo(farmId: string | null) {
  const [indicadores, setIndicadores] = useState<IndicadorConsumo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!farmId) {
      setIndicadores([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'indicadores_consumo'),
      where('farmId', '==', farmId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(docSnap => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          ...d,
          ultimaAtualizacao: d.ultimaAtualizacao?.toDate ? d.ultimaAtualizacao.toDate() : d.ultimaAtualizacao,
        } as unknown as IndicadorConsumo;
      });

      setIndicadores(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'indicadores_consumo');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [farmId]);

  const atualizarIndicador = async (maquinaId: string, dados: Partial<IndicadorConsumo>) => {
    if (!farmId) throw new Error('Farm ID é necessário');
    try {
      // Find existing
      const existing = indicadores.find(i => i.maquinaId === maquinaId);
      
      let docRef;
      if (existing) {
        docRef = doc(db, 'indicadores_consumo', existing.id);
      } else {
        docRef = doc(collection(db, 'indicadores_consumo'));
      }

      await setDoc(docRef, {
        id: docRef.id,
        farmId,
        maquinaId,
        ...dados,
        ultimaAtualizacao: serverTimestamp()
      }, { merge: true });

    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'indicadores_consumo');
      throw error;
    }
  };

  return {
    indicadores,
    loading,
    atualizarIndicador
  };
}
