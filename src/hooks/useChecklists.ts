import { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';

import { db } from '../services/firebase';
import {
  cacheChecklistTemplates,
  getCachedChecklistTemplates,
  getLocalChecklistResponses,
  mergeById,
  OFFLINE_OPERATIONAL_STORE_EVENT,
  upsertLocalChecklistResponse
} from '../services/offlineOperationalStore';
import { syncService } from '../services/syncService';
import {
  ChecklistResposta,
  ChecklistTemplate
} from '../types';

export function useChecklistOrdemResponse(
  ordemId: string | null,
  farmId: string | null
) {
  const [response, setResponse] =
    useState<ChecklistResposta | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ordemId || !farmId) {
      setResponse(null);
      setLoading(false);
      return;
    }

    const readLocalResponse = () => {
      const localResponse =
        getLocalChecklistResponses(
          farmId
        )
          .filter(
            item =>
              item.ordemId === ordemId
          )
          .sort(
            (a, b) =>
              b.createdAt.getTime() -
              a.createdAt.getTime()
          )[0] || null;

      setResponse(localResponse);
    };

    readLocalResponse();
    setLoading(true);

    window.addEventListener(
      OFFLINE_OPERATIONAL_STORE_EVENT,
      readLocalResponse
    );

    const consulta = query(
      collection(db, 'checklist_respostas'),
      where('farmId', '==', farmId),
      where('ordemId', '==', ordemId),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(
      consulta,
      snapshot => {
        if (snapshot.empty) {
          readLocalResponse();
          setLoading(false);
          return;
        }

        const documento = snapshot.docs[0];
        const data = documento.data();

        setResponse({
          id: documento.id,
          ...data,
          createdAt:
            data.createdAt?.toDate() || new Date()
        } as ChecklistResposta);

        upsertLocalChecklistResponse({
          id: documento.id,
          ...data,
          farmId,
          createdAt:
            data.createdAt?.toDate() ||
            new Date()
        } as ChecklistResposta);

        setLoading(false);
      },
      error => {
        console.error(
          'Erro ao carregar resposta do checklist:',
          error
        );
        readLocalResponse();
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      window.removeEventListener(
        OFFLINE_OPERATIONAL_STORE_EVENT,
        readLocalResponse
      );
    };
  }, [ordemId, farmId]);

  return { response, loading };
}

export function useChecklistTemplates(
  farmId: string | null
) {
  const [templates, setTemplates] = useState<
    ChecklistTemplate[]
  >([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!farmId) {
      setTemplates([]);
      setLoading(false);
      return;
    }

    const readCachedTemplates = () => {
      setTemplates(
        getCachedChecklistTemplates(
          farmId
        )
      );
    };

    readCachedTemplates();
    setLoading(true);

    window.addEventListener(
      OFFLINE_OPERATIONAL_STORE_EVENT,
      readCachedTemplates
    );

    const consulta = query(
      collection(db, 'checklist_templates'),
      where('farmId', '==', farmId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      consulta,
      snapshot => {
        const dados = snapshot.docs.map(documento => {
          const data = documento.data();

          return {
            id: documento.id,
            ...data,
            createdAt:
              data.createdAt?.toDate() || new Date()
          };
        }) as ChecklistTemplate[];

        setTemplates(dados);
        cacheChecklistTemplates(
          farmId,
          dados
        );
        setLoading(false);
      },
      error => {
        console.error(
          'Erro ao carregar modelos de checklist:',
          error
        );
        readCachedTemplates();
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      window.removeEventListener(
        OFFLINE_OPERATIONAL_STORE_EVENT,
        readCachedTemplates
      );
    };
  }, [farmId]);

  const saveTemplate = async (
    template: Partial<ChecklistTemplate>
  ) => {
    if (!farmId) return;

    if (template.id) {
      const { id, ...restante } = template;

      await updateDoc(
        doc(db, 'checklist_templates', id),
        restante
      );

      return;
    }

    await addDoc(
      collection(db, 'checklist_templates'),
      {
        ...template,
        farmId,
        createdAt: serverTimestamp(),
        ativo: true
      }
    );
  };

  return {
    templates,
    loading,
    saveTemplate
  };
}

export function useChecklistResponses(
  farmId: string | null
) {
  const [responses, setResponses] = useState<
    ChecklistResposta[]
  >([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!farmId) {
      setResponses([]);
      setLoading(false);
      return;
    }

    let remoteResponses:
      ChecklistResposta[] = [];

    const refreshResponses = () => {
      setResponses(
        mergeById(
          remoteResponses,
          getLocalChecklistResponses(
            farmId
          )
        ).sort(
          (a, b) =>
            b.createdAt.getTime() -
            a.createdAt.getTime()
        )
      );
    };

    refreshResponses();
    setLoading(true);

    window.addEventListener(
      OFFLINE_OPERATIONAL_STORE_EVENT,
      refreshResponses
    );

    const consulta = query(
      collection(db, 'checklist_respostas'),
      where('farmId', '==', farmId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      consulta,
      snapshot => {
        const dados = snapshot.docs.map(documento => {
          const data = documento.data();

          return {
            id: documento.id,
            ...data,
            createdAt:
              data.createdAt?.toDate() || new Date()
          };
        }) as ChecklistResposta[];

        remoteResponses = dados;
        refreshResponses();
        setLoading(false);
      },
      error => {
        console.error(
          'Erro ao carregar checklists respondidos:',
          error
        );
        refreshResponses();
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      window.removeEventListener(
        OFFLINE_OPERATIONAL_STORE_EVENT,
        refreshResponses
      );
    };
  }, [farmId]);

  const submitResponse = async (
    resposta: Omit<
      ChecklistResposta,
      'id' | 'createdAt' | 'farmId'
    >
  ) => {
    if (!farmId) return;

    const responseId = doc(
      collection(
        db,
        'checklist_respostas'
      )
    ).id;
    const createdAt = new Date();
    const localResponse: ChecklistResposta = {
      id: responseId,
      ...resposta,
      farmId,
      createdAt
    };

    upsertLocalChecklistResponse(
      localResponse
    );

    const {
      createdAt: _createdAt,
      ...responsePayload
    } = localResponse;

    syncService.enqueue('SUBMIT_CHECKLIST', {
      ...responsePayload,
      createdAtMs:
        createdAt.getTime()
    });

    return responseId;
  };

  return {
    responses,
    loading,
    submitResponse
  };
}
