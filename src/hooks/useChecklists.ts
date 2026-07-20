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

    setLoading(true);

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
          setResponse(null);
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

        setLoading(false);
      },
      error => {
        console.error(
          'Erro ao carregar resposta do checklist:',
          error
        );
        setResponse(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
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

    setLoading(true);

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
        setLoading(false);
      },
      error => {
        console.error(
          'Erro ao carregar modelos de checklist:',
          error
        );
        setTemplates([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
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

    setLoading(true);

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

        setResponses(dados);
        setLoading(false);
      },
      error => {
        console.error(
          'Erro ao carregar checklists respondidos:',
          error
        );
        setResponses([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [farmId]);

  const submitResponse = async (
    resposta: Omit<
      ChecklistResposta,
      'id' | 'createdAt'
    >
  ) => {
    if (!farmId) return;

    syncService.enqueue('SUBMIT_CHECKLIST', {
      ...resposta,
      farmId
    });
  };

  return {
    responses,
    loading,
    submitResponse
  };
}