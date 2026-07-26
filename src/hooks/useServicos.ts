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
  getDoc,
  arrayUnion
} from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import {
  appendLocalPathPoints,
  cacheExecucoesServico,
  cacheOrdensServico,
  findCachedOrdemServico,
  getCachedOrdemServico,
  getCachedOrdensServico,
  getLocalExecucoes,
  mergeById,
  OFFLINE_OPERATIONAL_STORE_EVENT,
  updateCachedOrdemServico
} from '../services/offlineOperationalStore';
import {
  finalizarExecucaoOperacional,
  iniciarExecucaoOperacional,
  pausarExecucaoOperacional
} from '../services/operacaoOfflineService';
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

    const readCachedOrders = () => {
      setOrdens(
        getCachedOrdensServico(farmId)
      );
    };

    readCachedOrders();

    window.addEventListener(
      OFFLINE_OPERATIONAL_STORE_EVENT,
      readCachedOrders
    );

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
        cacheOrdensServico(
          farmId,
          ordensData
        );
        setLoading(false);
      },
      error => {
        handleFirestoreError(
          error,
          OperationType.LIST,
          'ordens_servico'
        );
        readCachedOrders();
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      window.removeEventListener(
        OFFLINE_OPERATIONAL_STORE_EVENT,
        readCachedOrders
      );
    };
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
    if (!farmId) return;

    updateCachedOrdemServico(
      farmId,
      ordemId,
      { status }
    );

    if (!navigator.onLine) {
      syncService.enqueue(
        'UPDATE_ORDEM_SERVICO',
        {
          id: ordemId,
          farmId,
          status,
          updatedAtMs: Date.now()
        }
      );
      return;
    }

    try {
      await updateDoc(doc(db, 'ordens_servico', ordemId), {
        status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      syncService.enqueue(
        'UPDATE_ORDEM_SERVICO',
        {
          id: ordemId,
          farmId,
          status,
          updatedAtMs: Date.now()
        }
      );

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

    const readCachedOrder = () => {
      setOrdem(
        findCachedOrdemServico(
          ordemId
        )
      );
    };

    readCachedOrder();

    window.addEventListener(
      OFFLINE_OPERATIONAL_STORE_EVENT,
      readCachedOrder
    );

    const unsubscribe = onSnapshot(
      doc(db, 'ordens_servico', ordemId),
      docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();

          const remoteOrder = {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            janelaInicio: data.janelaInicio?.toDate(),
            janelaFim: data.janelaFim?.toDate()
          } as OrdemServico;

          setOrdem(remoteOrder);

          if (remoteOrder.farmId) {
            cacheOrdensServico(
              remoteOrder.farmId,
              mergeById(
                getCachedOrdensServico(
                  remoteOrder.farmId
                ),
                [remoteOrder]
              )
            );
          }
        } else {
          readCachedOrder();
        }

        setLoading(false);
      },
      error => {
        handleFirestoreError(
          error,
          OperationType.GET,
          `ordens_servico/${ordemId}`
        );
        readCachedOrder();
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      window.removeEventListener(
        OFFLINE_OPERATIONAL_STORE_EVENT,
        readCachedOrder
      );
    };
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

    let remoteExecutions:
      ExecucaoServico[] = [];

    const refreshExecutions = () => {
      setExecucoes(
        mergeById(
          remoteExecutions,
          getLocalExecucoes({
            farmId,
            ordemId
          })
        ).sort(
          (a, b) =>
            b.createdAt.getTime() -
            a.createdAt.getTime()
        )
      );
    };

    refreshExecutions();

    window.addEventListener(
      OFFLINE_OPERATIONAL_STORE_EVENT,
      refreshExecutions
    );

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

        remoteExecutions =
          execucoesData;
        cacheExecucoesServico(
          execucoesData
        );
        refreshExecutions();
        setLoading(false);
      },
      error => {
        handleFirestoreError(
          error,
          OperationType.LIST,
          'execucoes_servico'
        );
        refreshExecutions();
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      window.removeEventListener(
        OFFLINE_OPERATIONAL_STORE_EVENT,
        refreshExecutions
      );
    };
  }, [ordemId, farmId]);

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
    if (
      !ordemId ||
      !auth.currentUser
    ) {
      return;
    }

    try {
      let order =
        getCachedOrdemServico(
          farmIdExecucao,
          ordemId
        );

      if (!order) {
        try {
          const orderSnap = await getDoc(
            doc(
              db,
              'ordens_servico',
              ordemId
            )
          );

          if (orderSnap.exists()) {
            const data =
              orderSnap.data();

            order = {
              id: orderSnap.id,
              ...data,
              createdAt:
                data.createdAt?.toDate() ||
                new Date(),
              janelaInicio:
                data.janelaInicio?.toDate(),
              janelaFim:
                data.janelaFim?.toDate()
            } as OrdemServico;
          }
        } catch {
          console.warn(
            'Ordem não disponível na rede; usando os dados operacionais locais.'
          );
        }
      }

      const executableOrder =
        order || {
          id: ordemId,
          farmId: farmIdExecucao,
          titulo: 'Operação offline',
          tipoOperacao:
            'Outros' as const,
          talhaoId,
          status:
            'pendente' as const,
          createdBy:
            auth.currentUser.uid,
          createdAt: new Date()
        };

      return await iniciarExecucaoOperacional({
        ordem: executableOrder,
        farmId: farmIdExecucao,
        operadorId:
          auth.currentUser.uid,
        operadorNome:
          auth.currentUser.displayName ||
          'Operador',
        location,
        origemStart
      });
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.CREATE,
        'execucoes_servico'
      );
    }
  };

  const pausarExecucao = async (execucaoId: string) => {
    if (!ordemId || !farmId) return;

    try {
      await pausarExecucaoOperacional({
        execucaoId,
        ordemId,
        farmId
      });
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
    if (!ordemId || !farmId) return;

    try {
      await finalizarExecucaoOperacional({
        execucaoId,
        ordemId,
        farmId,
        location
      });
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
        appendLocalPathPoints(
          execucaoId,
          [ponto]
        );
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

    const operatorId =
      auth.currentUser.uid;
    let remoteExecutions:
      ExecucaoServico[] = [];

    const refreshActiveExecutions =
      () => {
        setExecucoesAtivas(
          mergeById(
            remoteExecutions,
            getLocalExecucoes({
              farmId,
              operadorId: operatorId,
              statuses: [
                'em_execucao',
                'pausada'
              ]
            })
          )
        );
      };

    refreshActiveExecutions();

    window.addEventListener(
      OFFLINE_OPERATIONAL_STORE_EVENT,
      refreshActiveExecutions
    );

    const q = query(
      collection(db, 'execucoes_servico'),
      where('farmId', '==', farmId),
      where('operadorId', '==', operatorId),
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

        remoteExecutions =
          execucoesData;
        cacheExecucoesServico(
          execucoesData
        );
        refreshActiveExecutions();
        setLoading(false);
      },
      error => {
        handleFirestoreError(
          error,
          OperationType.LIST,
          'execucoes_servico'
        );
        refreshActiveExecutions();
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      window.removeEventListener(
        OFFLINE_OPERATIONAL_STORE_EVENT,
        refreshActiveExecutions
      );
    };
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

    let remoteExecutions:
      ExecucaoServico[] = [];

    const refreshAllExecutions = () => {
      setExecucoes(
        mergeById(
          remoteExecutions,
          getLocalExecucoes({
            farmId
          })
        ).sort(
          (a, b) =>
            b.createdAt.getTime() -
            a.createdAt.getTime()
        )
      );
    };

    refreshAllExecutions();

    window.addEventListener(
      OFFLINE_OPERATIONAL_STORE_EVENT,
      refreshAllExecutions
    );

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

        remoteExecutions =
          execucoesData;
        cacheExecucoesServico(
          execucoesData
        );
        refreshAllExecutions();
        setLoading(false);
      },
      error => {
        handleFirestoreError(
          error,
          OperationType.LIST,
          'execucoes_servico'
        );
        refreshAllExecutions();
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      window.removeEventListener(
        OFFLINE_OPERATIONAL_STORE_EVENT,
        refreshAllExecutions
      );
    };
  }, [farmId]);

  return { execucoes, loading };
}
