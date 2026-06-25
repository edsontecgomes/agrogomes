import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, setDoc, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { Abastecimento } from '../types';
import { handleFirestoreError, OperationType } from '../utils/errorHandling';

export function useAbastecimentos(farmId: string | null, maquinaId?: string) {
  const [abastecimentos, setAbastecimentos] = useState<Abastecimento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!farmId) {
      setAbastecimentos([]);
      setLoading(false);
      return;
    }

    let q = query(
      collection(db, 'abastecimentos'),
      where('farmId', '==', farmId),
      orderBy('dataAbastecimento', 'desc')
    );

    if (maquinaId) {
      q = query(
        collection(db, 'abastecimentos'),
        where('farmId', '==', farmId),
        where('maquinaId', '==', maquinaId),
        orderBy('dataAbastecimento', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(docSnap => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          ...d,
          dataAbastecimento: d.dataAbastecimento?.toDate ? d.dataAbastecimento.toDate() : new Date(),
          createdAt: d.createdAt?.toDate ? d.createdAt.toDate() : d.createdAt,
        } as unknown as Abastecimento;
      });

      setAbastecimentos(data);
      setLoading(false);
    }, (error) => {
       if (error.message.includes('index')) {
         console.warn('Missing composite index for abastecimentos. Running simple query backup.');
         const simpleQ = maquinaId 
            ? query(collection(db, 'abastecimentos'), where('farmId', '==', farmId), where('maquinaId', '==', maquinaId))
            : query(collection(db, 'abastecimentos'), where('farmId', '==', farmId));
         
         onSnapshot(simpleQ, (snap) => {
             const fallbackData = snap.docs.map(docSnap => {
                const d = docSnap.data();
                return {
                id: docSnap.id,
                ...d,
                dataAbastecimento: d.dataAbastecimento?.toDate ? d.dataAbastecimento.toDate() : new Date(),
                } as unknown as Abastecimento;
             }).sort((a,b) => b.dataAbastecimento.getTime() - a.dataAbastecimento.getTime());
             setAbastecimentos(fallbackData);
             setLoading(false);
         }, (err) => {
            handleFirestoreError(err, OperationType.LIST, 'abastecimentos');
            setLoading(false);
         });
      } else {
         handleFirestoreError(error, OperationType.LIST, 'abastecimentos');
         setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [farmId, maquinaId]);

  const registrarAbastecimento = async (dados: Omit<Abastecimento, 'id' | 'farmId' | 'producerId' | 'createdAt'>) => {
    if (!farmId) throw new Error('Farm ID é necessário');
    try {
      const newDocRef = doc(collection(db, 'abastecimentos'));
      await setDoc(newDocRef, {
        id: newDocRef.id,
        farmId,
        producerId: auth.currentUser?.uid || '',
        ...dados,
        createdAt: serverTimestamp()
      });
      return newDocRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'abastecimentos');
      throw error;
    }
  };

  return {
    abastecimentos,
    loading,
    registrarAbastecimento
  };
}
