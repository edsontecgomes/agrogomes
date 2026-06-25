import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { ChuvaComunitaria } from '../types';
import { handleFirestoreError, OperationType } from '../utils/errorHandling';

export function useChuvasComunitarias(farmId: string | null) {
  const [chuvasComunitarias, setChuvasComunitarias] = useState<ChuvaComunitaria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!farmId || !auth.currentUser) {
      setChuvasComunitarias([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'chuvas_comunitarias'), 
      where('farmId', '==', farmId),
      orderBy('timestamp', 'desc'),
      limit(100)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        return {
          id: doc.id,
          ...docData,
          timestamp: docData.timestamp?.toDate ? docData.timestamp.toDate() : new Date(),
          createdAt: docData.createdAt?.toDate ? docData.createdAt.toDate() : new Date()
        };
      }) as ChuvaComunitaria[];
      
      setChuvasComunitarias(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'chuvas_comunitarias');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [farmId]);

  return { chuvasComunitarias, loading };
}
