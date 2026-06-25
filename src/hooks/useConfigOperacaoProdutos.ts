import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { ConfigOperacaoProduto } from '../types';
import { handleFirestoreError } from '../utils/errorHandling';

export function useConfigOperacaoProdutos(farmId: string | null) {
  const [configs, setConfigs] = useState<ConfigOperacaoProduto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!farmId || !auth.currentUser) {
      setConfigs([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'config_operacao_produtos'),
      where('farmId', '==', farmId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const configsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ConfigOperacaoProduto[];
      setConfigs(configsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, 'list' as any, 'config_operacao_produtos');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [farmId]);

  return { configs, loading };
}
