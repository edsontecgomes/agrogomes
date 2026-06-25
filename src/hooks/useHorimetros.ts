import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, writeBatch, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { HorimetroRegistro, PlanoManutencao } from '../types';
import { handleFirestoreError, OperationType } from '../utils/errorHandling';

export function useHorimetros(farmId: string | null, maquinaId?: string) {
  const [horimetros, setHorimetros] = useState<HorimetroRegistro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!farmId) {
      setHorimetros([]);
      setLoading(false);
      return;
    }

    let q = query(
      collection(db, 'horimetros'),
      where('farmId', '==', farmId),
      orderBy('dataRegistro', 'desc')
    );

    if (maquinaId) {
      q = query(
        collection(db, 'horimetros'),
        where('farmId', '==', farmId),
        where('maquinaId', '==', maquinaId),
        orderBy('dataRegistro', 'desc') // Requires composite index if querying by maquinaId and ordering by dataRegistro
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(docSnap => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          ...d,
          dataRegistro: d.dataRegistro?.toDate ? d.dataRegistro.toDate() : new Date(),
          createdAt: d.createdAt?.toDate ? d.createdAt.toDate() : d.createdAt,
        } as unknown as HorimetroRegistro;
      });

      setHorimetros(data);
      setLoading(false);
    }, (error) => {
      // Avoid spamming missing index errors in console if offline or missing, just show basic data
      if (error.message.includes('index')) {
         console.warn('Missing composite index for horimetros. Run queries without orderBy locally or create index.');
         // Fallback to simple query to avoid breaking the app completely while index builds
         const simpleQ = maquinaId 
            ? query(collection(db, 'horimetros'), where('farmId', '==', farmId), where('maquinaId', '==', maquinaId))
            : query(collection(db, 'horimetros'), where('farmId', '==', farmId));
         
         onSnapshot(simpleQ, (snap) => {
             const fallbackData = snap.docs.map(docSnap => {
                const d = docSnap.data();
                return {
                id: docSnap.id,
                ...d,
                dataRegistro: d.dataRegistro?.toDate ? d.dataRegistro.toDate() : new Date(),
                } as unknown as HorimetroRegistro;
             }).sort((a,b) => b.dataRegistro.getTime() - a.dataRegistro.getTime());
             setHorimetros(fallbackData);
             setLoading(false);
         }, (err) => {
            handleFirestoreError(err, OperationType.LIST, 'horimetros');
            setLoading(false);
         });
      } else {
         handleFirestoreError(error, OperationType.LIST, 'horimetros');
         setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [farmId, maquinaId]);

  const registrarHorimetro = async (dados: Omit<HorimetroRegistro, 'id' | 'farmId' | 'producerId' | 'createdAt'>) => {
    if (!farmId) throw new Error('Farm ID é necessário');
    try {
      const batch = writeBatch(db);
      
      const newDocRef = doc(collection(db, 'horimetros'));
      batch.set(newDocRef, {
        id: newDocRef.id,
        farmId,
        producerId: auth.currentUser?.uid || '',
        ...dados,
        createdAt: serverTimestamp()
      });

      const maquinaRef = doc(db, 'equipamentos', dados.maquinaId);
      batch.update(maquinaRef, {
        horimetroAtual: dados.horimetroAtual,
        ultimaAtualizacaoHorimetro: serverTimestamp()
      });

      await batch.commit();

      // Envia notificação assíncrona se ultrapassar limites de manutenção
      // Fica fora do batch principal offline-first para não bloquear se falhar
      try {
         const { getDocs } = await import('firebase/firestore');
         const planosSnapshot = await getDocs(query(
            collection(db, 'planos_manutencao'), 
            where('equipamentoId', '==', dados.maquinaId),
            where('ativo', '==', true)
         ));
         
         const planos = planosSnapshot.docs.map(d => ({id: d.id, ...d.data()})) as unknown as PlanoManutencao[];
         
         for (const plano of planos) {
            const faltam = plano.proximaExecucaoHorimetro - dados.horimetroAtual;
            const perRestante = (faltam / plano.intervaloHoras) * 100;
            
            let tipo = null;
            let msg = '';
            
            if (faltam <= 0) {
               tipo = 'gerencial';
               msg = `A manutenção preventiva "${plano.tipoManutencao}" da máquina ${dados.maquinaNome} encontra-se VENCIDA (${dados.horimetroAtual}h).`;
            } else if (perRestante <= 20) {
               tipo = 'manutencao';
               msg = `A manutenção preventiva "${plano.tipoManutencao}" da máquina ${dados.maquinaNome} está próxima (Faltam ${faltam.toFixed(1)}h).`;
            }

            if (tipo) {
               const notifRef = doc(collection(db, 'notificacoes_operacionais'));
               await setDoc(notifRef, {
                 id: notifRef.id,
                 farmId,
                 tipo,
                 titulo: faltam <= 0 ? 'Manutenção Vencida!' : 'Manutenção Próxima',
                 mensagem: msg,
                 lida: false,
                 data: serverTimestamp()
               });
            }
         }
      } catch (e) {
         console.warn('Erro ao verificar planos de manutenção para notificação:', e);
      }

      return newDocRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'horimetros');
      throw error;
    }
  };

  return {
    horimetros,
    loading,
    registrarHorimetro
  };
}
