import { useState, useEffect } from 'react';
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

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const ordensData = snapshot.docs.map(documento => {
          const data = documento.data();

          return {
            id: documento.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            janelaInicio: data.janelaInicio?.toDate(),
            janelaFim: data.janelaFim?.toDate()
          } as OrdemServico;
        });

        setOrdens(ordensData);
        setLoading(false);
      },
      error => {
        handleFirestoreError(
          error,
          OperationType.LIST,
          'ordens_servico'
        );
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [farmId]);

  const criarOrdem = async (
    ordem: Omit<
      OrdemServico,
      'id' | 'createdAt' | 'status' | 'createdBy' | 'farmId'
    >
  ) => {
    if (!farmId || !auth.currentUser) return;

    try {
      await addDoc(collection(db, 'ordens_servico'), {
        ...ordem,
        configuracoes: {
          autoStartPorGeofence:
            ordem.configuracoes
              ?.autoStartPorGeofence ??
            true,
          exigirConfirmacaoManual:
            ordem.configuracoes
              ?.exigirConfirmacaoManual ??
            true
        },
        farmId,
        status: 'pendente',
        createdBy: auth.currentUser.uid,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.CREATE,
        'ordens_servico'
      );
    }
  };

  const atualizarStatusOS = async (
    ordemId: string,
    status: OrdemServico['status']
  ) => {
    try {
      await updateDoc(doc(db, 'ordens_servico', ordemId), {
        status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `ordens_servico/${ordemId}`
      );
    }
  };

  const listarOrdensPorTalhao = (talhaoId: string) => {
    return ordens.filter(ordem => ordem.talhaoId === talhaoId);
  };

  const listarOrdensAtivas = () => {
    return ordens.filter(ordem => ordem.status !== 'finalizada');
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

    const unsubscribe = onSnapshot(
      doc(db, 'ordens_servico', ordemId),
      docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();

          setOrdem({
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            janelaInicio: data.janelaInicio?.toDate(),
            janelaFim: data.janelaFim?.toDate()
          } as OrdemServico);
        } else {
          setOrdem(null);
        }

        setLoading(false);
      },
      error => {
        handleFirestoreError(
          error,
          OperationType.GET,
          `ordens_servico/${ordemId}`
        );
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [ordemId]);

  return { ordem, loading };
}

export function useExecucoesServico(
  ordemId: string | null,
  farmId: string | null
) {
  const [execucoes, setExecucoes] = useState<ExecucaoServico[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ordemId || !farmId || !auth.currentUser) {
      setExecucoes([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'execucoes_servico'),
      where('farmId', '==', farmId),
      where('ordemId', '==', ordemId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const execucoesData = snapshot.docs.map(documento => {
          const data = documento.data();

          return {
            id: documento.id,
            ...data,
            dataInicio: data.dataInicio?.toDate(),
            dataFim: data.dataFim?.toDate(),
            createdAt: data.createdAt?.toDate() || new Date()
          } as ExecucaoServico;
        });

        setExecucoes(execucoesData);
        setLoading(false);
      },
      error => {
        handleFirestoreError(
          error,
          OperationType.LIST,
          'execucoes_servico'
        );
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [ordemId, farmId]);

  const updateOSStatusFromExecutions = async (
    ordemIdAtual: string
  ) => {
    if (!farmId) return;

    const q = query(
      collection(db, 'execucoes_servico'),
      where('farmId', '==', farmId),
      where('ordemId', '==', ordemIdAtual)
    );

    const snapshot = await getDocs(q);
    const execucoesDaOrdem = snapshot.docs.map(
      documento => documento.data() as ExecucaoServico
    );

    const osRef = doc(db, 'ordens_servico', ordemIdAtual);
    const osSnap = await getDoc(osRef);

    if (!osSnap.exists()) return;

    const osData = osSnap.data() as OrdemServico;

    if (osData.status === 'finalizada') return;

    const possuiExecucaoAtiva = execucoesDaOrdem.some(
      execucao => execucao.status === 'em_execucao'
    );

    const possuiExecucaoFinalizada = execucoesDaOrdem.some(
      execucao => execucao.status === 'finalizada'
    );

    let proximoStatus: OrdemServico['status'] = 'pendente';

    if (possuiExecucaoAtiva) {
      proximoStatus = 'em_execucao';
    } else if (possuiExecucaoFinalizada) {
      proximoStatus = 'parcial';
    }

    if (osData.status !== proximoStatus) {
      await updateDoc(osRef, {
        status: proximoStatus
      });
    }
  };

  const iniciarExecucao = async (
    farmIdExecucao: string,
    talhaoId: string,
    location?: {
      lat: number;
      lng: number;
      accuracy?: number;
    },
    origemStart:
      | 'manual'
      | 'automatic_geofence' =
      'manual'
  ) => {
    if (!ordemId || !auth.currentUser) return;

    try {
      let operadorNome = 'Operador';

      try {
        const userDoc = await getDoc(
          doc(db, 'usuarios', auth.currentUser.uid)
        );

        const userData = userDoc.data();

        operadorNome =
          userData?.nome ||
          auth.currentUser.displayName ||
          'Operador';
      } catch {
        console.warn('Using default operator name (offline).');
      }

      let maquinaId = null;
      let maquinaNome = null;
      let implementoId = null;
      let implementoNome = null;
      let produtos: OrdemServico['produtos'] = [];

      try {
        const orderSnap = await getDoc(
          doc(db, 'ordens_servico', ordemId)
        );

        if (orderSnap.exists()) {
          const orderData = orderSnap.data();

          maquinaId = orderData.maquinaId || null;
          maquinaNome = orderData.maquinaNome || null;
          implementoId = orderData.implementoId || null;
          implementoNome = orderData.implementoNome || null;
          produtos = orderData.produtos || [];
        }
      } catch {
        console.warn(
          'Could not retrieve order details for equipment mapping.'
        );
      }

      const payload = {
        ordemId,
        farmId: farmIdExecucao,
        talhaoId,
        operadorId: auth.currentUser.uid,
        operadorNome,
        status: 'em_execucao',
        origemStart,
        locationStart: location || null,
        path: [],
        maquinaId,
        maquinaNome,
        implementoId,
        implementoNome,
        produtos
      };

      if (!navigator.onLine) {
        const tempId =
          'offline_' +
          Math.random().toString(36).substring(2, 11);

        syncService.enqueue('CREATE_EXECUCAO', payload);

        return tempId;
      }

      const docRef = await addDoc(
        collection(db, 'execucoes_servico'),
        {
          ...payload,
          dataInicio: serverTimestamp(),
          createdAt: serverTimestamp()
        }
      );

      await updateOSStatusFromExecutions(ordemId);

      return docRef.id;
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.CREATE,
        'execucoes_servico'
      );
    }
  };

  const pausarExecucao = async (execucaoId: string) => {
    try {
      if (!navigator.onLine) {
        syncService.enqueue('UPDATE_EXECUCAO', {
          id: execucaoId,
          status: 'pausada'
        });
        return;
      }

      await updateDoc(
        doc(db, 'execucoes_servico', execucaoId),
        {
          status: 'pausada',
          updatedAt: serverTimestamp()
        }
      );

      await updateOSStatusFromExecutions(ordemId!);
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `execucoes_servico/${execucaoId}`
      );
    }
  };

  const finalizarExecucao = async (
    execucaoId: string,
    location?: {
      lat: number;
      lng: number;
      accuracy?: number;
    }
  ) => {
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

      await updateDoc(
        doc(db, 'execucoes_servico', execucaoId),
        {
          status: 'finalizada',
          dataFim: serverTimestamp(),
          locationEnd: location || null,
          updatedAt: serverTimestamp()
        }
      );

      await updateOSStatusFromExecutions(ordemId!);
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `execucoes_servico/${execucaoId}`
      );
    }
  };

  const adicionarPontoPath = async (
    execucaoId: string,
    ponto: {
      lat: number;
      lng: number;
      timestamp: number;
      accuracy?: number;
    }
  ) => {
    try {
      if (!navigator.onLine) {
        syncService.enqueue('ADD_PATH_POINT', {
          execId: execucaoId,
          points: [ponto]
        });
        return;
      }

      await updateDoc(
        doc(db, 'execucoes_servico', execucaoId),
        {
          path: arrayUnion(ponto)
        }
      );
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `execucoes_servico/${execucaoId}`
      );
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

export function useMinhasExecucoesAtivas(
  farmId: string | null
) {
  const [execucoesAtivas, setExecucoesAtivas] = useState<
    ExecucaoServico[]
  >([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!farmId || !auth.currentUser) {
      setExecucoesAtivas([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'execucoes_servico'),
      where('farmId', '==', farmId),
      where('operadorId', '==', auth.currentUser.uid),
      where('status', 'in', ['em_execucao', 'pausada'])
    );

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const execucoesData = snapshot.docs.map(documento => {
          const data = documento.data();

          return {
            id: documento.id,
            ...data,
            dataInicio: data.dataInicio?.toDate(),
            createdAt: data.createdAt?.toDate() || new Date()
          } as ExecucaoServico;
        });

        setExecucoesAtivas(execucoesData);
        setLoading(false);
      },
      error => {
        handleFirestoreError(
          error,
          OperationType.LIST,
          'execucoes_servico'
        );
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [farmId]);

  return { execucoesAtivas, loading };
}

export function useTodasExecucoesServico(
  farmId: string | null
) {
  const [execucoes, setExecucoes] = useState<
    ExecucaoServico[]
  >([]);

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

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const execucoesData = snapshot.docs.map(documento => {
          const data = documento.data();

          return {
            id: documento.id,
            ...data,
            dataInicio: data.dataInicio?.toDate(),
            dataFim: data.dataFim?.toDate(),
            createdAt: data.createdAt?.toDate() || new Date()
          } as ExecucaoServico;
        });

        setExecucoes(execucoesData);
        setLoading(false);
      },
      error => {
        handleFirestoreError(
          error,
          OperationType.LIST,
          'execucoes_servico'
        );
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [farmId]);

  return { execucoes, loading };
}
