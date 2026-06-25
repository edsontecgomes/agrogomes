import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  getDocs,
  getDoc,
  arrayUnion
} from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { syncService } from '../services/syncService';
import { OrdemServico, ExecucaoServico } from '../types';
import { handleFirestoreError, OperationType } from '../utils/errorHandling';

export function useOrdensServico(farmId: string | null) {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!farmId || !auth.currentUser) {
      setOrdens([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'ordens_servico'),
      where('farmId', '==', farmId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordensData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          janelaInicio: data.janelaInicio?.toDate(),
          janelaFim: data.janelaFim?.toDate(),
        } as OrdemServico;
      });
      setOrdens(ordensData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'ordens_servico');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [farmId]);

  const criarOrdem = async (ordem: Omit<OrdemServico, 'id' | 'createdAt' | 'status' | 'createdBy' | 'farmId'>) => {
    if (!farmId || !auth.currentUser) return;
    
    try {
      await addDoc(collection(db, 'ordens_servico'), {
        ...ordem,
        farmId,
        status: 'pendente',
        createdBy: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'ordens_servico');
    }
  };

  const atualizarStatusOS = async (ordemId: string, status: OrdemServico['status']) => {
    try {
      await updateDoc(doc(db, 'ordens_servico', ordemId), {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `ordens_servico/${ordemId}`);
    }
  };

  const listarOrdensPorTalhao = (talhaoId: string) => {
    return ordens.filter(o => o.talhaoId === talhaoId);
  };

  const listarOrdensAtivas = () => {
    return ordens.filter(o => o.status !== 'finalizada');
  };

  return { 
    ordens, 
    loading, 
    criarOrdem, 
    atualizarStatusOS, 
    listarOrdensPorTalhao, 
    listarOrdensAtivas 
  };
}

export function useOrdemServico(ordemId: string | null) {
  const [ordem, setOrdem] = useState<OrdemServico | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ordemId) {
      setOrdem(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'ordens_servico', ordemId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setOrdem({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          janelaInicio: data.janelaInicio?.toDate(),
          janelaFim: data.janelaFim?.toDate(),
        } as OrdemServico);
      } else {
        setOrdem(null);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `ordens_servico/${ordemId}`);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [ordemId]);

  return { ordem, loading };
}

export function useExecucoesServico(ordemId: string | null) {
  const [execucoes, setExecucoes] = useState<ExecucaoServico[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ordemId || !auth.currentUser) {
      setExecucoes([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'execucoes_servico'),
      where('ordemId', '==', ordemId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const execucoesData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          dataInicio: data.dataInicio?.toDate(),
          dataFim: data.dataFim?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
        } as ExecucaoServico;
      });
      setExecucoes(execucoesData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'execucoes_servico');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [ordemId]);

  const updateOSStatusFromExecutions = async (ordemId: string) => {
    const q = query(
      collection(db, 'execucoes_servico'),
      where('ordemId', '==', ordemId)
    );
    const snapshot = await getDocs(q);
    const execs = snapshot.docs.map(d => d.data() as ExecucaoServico);
    
    const osRef = doc(db, 'ordens_servico', ordemId);
    const osSnap = await getDoc(osRef);
    if (!osSnap.exists()) return;
    const osData = osSnap.data() as OrdemServico;

    // "A OS NÃO deve ser finalizada automaticamente ao finalizar uma execução."
    // If OS is already 'finalizada', don't change it back unless manually requested?
    // Requirement: "Quando existir pelo menos uma execução ativa: status = em_execucao"
    // Requirement: "Quando existir pelo menos uma execução finalizada mas ainda não concluída totalmente: status = parcial"
    
    if (osData.status === 'finalizada') return;

    const hasActive = execs.some(e => e.status === 'em_execucao');
    const hasFinished = execs.some(e => e.status === 'finalizada');

    let nextStatus: OrdemServico['status'] = 'pendente';
    if (hasActive) {
      nextStatus = 'em_execucao';
    } else if (hasFinished) {
      nextStatus = 'parcial';
    }

    if (osData.status !== nextStatus) {
      await updateDoc(osRef, { status: nextStatus });
    }
  };

  const iniciarExecucao = async (farmId: string, talhaoId: string, location?: { lat: number, lng: number, accuracy?: number }) => {
    if (!ordemId || !auth.currentUser) return;

    try {
      // Get current user name for denormalization
      let operadorNome = 'Operador';
      try {
        const userDoc = await getDoc(doc(db, 'usuarios', auth.currentUser.uid));
        const userData = userDoc.data();
        operadorNome = userData?.nome || auth.currentUser.displayName || 'Operador';
      } catch (e) {
        console.warn('Using default operator name (offline).');
      }

      // Get equipment details from order
      let maquinaId = null;
      let maquinaNome = null;
      let implementoId = null;
      let implementoNome = null;
      try {
        const orderSnap = await getDoc(doc(db, 'ordens_servico', ordemId));
        if (orderSnap.exists()) {
          const orderData = orderSnap.data();
          maquinaId = orderData.maquinaId || null;
          maquinaNome = orderData.maquinaNome || null;
          implementoId = orderData.implementoId || null;
          implementoNome = orderData.implementoNome || null;
        }
      } catch (err) {
        console.warn('Could not retrieve order details for equipment mapping:', err);
      }

      const payload = {
        ordemId,
        farmId,
        talhaoId,
        operadorId: auth.currentUser.uid,
        operadorNome,
        status: 'em_execucao',
        origemStart: 'manual',
        locationStart: location || null,
        path: [],
        maquinaId,
        maquinaNome,
        implementoId,
        implementoNome,
      };

      if (!navigator.onLine) {
        const tempId = 'offline_' + Math.random().toString(36).substr(2, 9);
        syncService.enqueue('CREATE_EXECUCAO', payload);
        // We'll have a problem here because onSnapshot won't show it immediately 
        // unless we use a custom state for offline execs.
        // For now, let's assume we want to push to firebase if possible.
        return tempId;
      }

      const docRef = await addDoc(collection(db, 'execucoes_servico'), {
        ...payload,
        dataInicio: serverTimestamp(),
        createdAt: serverTimestamp(),
      });

      await updateOSStatusFromExecutions(ordemId);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'execucoes_servico');
    }
  };

  const pausarExecucao = async (execucaoId: string) => {
    try {
      if (!navigator.onLine) {
        syncService.enqueue('UPDATE_EXECUCAO', { id: execucaoId, status: 'pausada' });
        return;
      }
      await updateDoc(doc(db, 'execucoes_servico', execucaoId), {
        status: 'pausada',
        updatedAt: serverTimestamp(),
      });
      await updateOSStatusFromExecutions(ordemId!);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `execucoes_servico/${execucaoId}`);
    }
  };

  const finalizarExecucao = async (execucaoId: string, location?: { lat: number, lng: number, accuracy?: number }) => {
    try {
      if (!navigator.onLine) {
        syncService.enqueue('UPDATE_EXECUCAO', { 
          id: execucaoId, 
          status: 'finalizada',
          dataFim: Date.now(),
          locationEnd: location || null
        });
        return;
      }
      await updateDoc(doc(db, 'execucoes_servico', execucaoId), {
        status: 'finalizada',
        dataFim: serverTimestamp(),
        locationEnd: location || null,
        updatedAt: serverTimestamp(),
      });
      await updateOSStatusFromExecutions(ordemId!);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `execucoes_servico/${execucaoId}`);
    }
  };

  const adicionarPontoPath = async (execucaoId: string, ponto: { lat: number, lng: number, timestamp: number, accuracy?: number }) => {
    try {
      if (!navigator.onLine) {
        syncService.enqueue('ADD_PATH_POINT', { execId: execucaoId, points: [ponto] });
        return;
      }
      await updateDoc(doc(db, 'execucoes_servico', execucaoId), {
        path: arrayUnion(ponto),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `execucoes_servico/${execucaoId}`);
    }
  };

  return { 
    execucoes, 
    loading, 
    iniciarExecucao, 
    pausarExecucao, 
    finalizarExecucao, 
    adicionarPontoPath 
  };
}

export function useMinhasExecucoesAtivas(farmId: string | null) {
  const [execucoesAtivas, setExecucoesAtivas] = useState<ExecucaoServico[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!farmId || !auth.currentUser) {
      setExecucoesAtivas([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'execucoes_servico'),
      where('operadorId', '==', auth.currentUser.uid),
      where('status', 'in', ['em_execucao', 'pausada'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const execucoesData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          dataInicio: data.dataInicio?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
        } as ExecucaoServico;
      });
      
      setExecucoesAtivas(execucoesData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'execucoes_servico');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [farmId]);

  return { execucoesAtivas, loading };
}

export function useTodasExecucoesServico(farmId: string | null) {
  const [execucoes, setExecucoes] = useState<ExecucaoServico[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!farmId || !auth.currentUser) {
      setExecucoes([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'execucoes_servico'),
      where('farmId', '==', farmId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const execucoesData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          dataInicio: data.dataInicio?.toDate(),
          dataFim: data.dataFim?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
        } as ExecucaoServico;
      });
      setExecucoes(execucoesData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'execucoes_servico');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [farmId]);

  return { execucoes, loading };
}

