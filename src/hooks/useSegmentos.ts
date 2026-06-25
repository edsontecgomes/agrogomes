import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy 
} from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { SegmentoExecucao } from '../types';
import { handleFirestoreError, OperationType } from '../utils/errorHandling';

export function useSegmentosExecucao(farmId: string | null) {
  const [segmentos, setSegmentos] = useState<SegmentoExecucao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!farmId || !auth.currentUser) {
      setSegmentos([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'segmentos_execucao'),
      where('farmId', '==', farmId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const segmentsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as SegmentoExecucao;
      });
      setSegmentos(segmentsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'segmentos_execucao');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [farmId]);

  return { segmentos, loading };
}
