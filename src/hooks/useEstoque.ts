import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { Estoque } from '../types';
import { handleFirestoreError } from '../utils/errorHandling';

export function useEstoque(farmId: string | null) {
  const [estoque, setEstoque] = useState<Estoque[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!farmId || !auth.currentUser) {
      setEstoque([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'estoque'),
      where('farmId', '==', farmId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const estoqueData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          validade: data.validade?.toDate(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Estoque;
      });
      setEstoque(estoqueData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, 'list' as any, 'estoque');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [farmId]);

  return { estoque, loading };
}
