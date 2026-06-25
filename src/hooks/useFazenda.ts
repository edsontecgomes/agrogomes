import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Fazenda } from '../types';

export function useFazenda(farmId: string | null) {
  const [fazenda, setFazenda] = useState<Fazenda | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!farmId) {
      setFazenda(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'fazendas', farmId), (doc) => {
      if (doc.exists()) {
        setFazenda({ id: doc.id, ...doc.data() } as Fazenda);
      } else {
        setFazenda(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [farmId]);

  return { fazenda, loading };
}
