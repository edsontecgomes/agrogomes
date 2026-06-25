import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { Pluviometro } from '../types';
import { handleFirestoreError, OperationType } from '../utils/errorHandling';

export function usePluviometros(farmId: string | null) {
  const [pluviometros, setPluviometros] = useState<Pluviometro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!farmId || !auth.currentUser) {
      setPluviometros([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'pluviometros'), where('farmId', '==', farmId));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Pluviometro[];
      setPluviometros(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'pluviometros');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [farmId]);

  return { pluviometros, loading };
}
