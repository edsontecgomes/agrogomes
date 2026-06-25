import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { syncService } from '../services/syncService';
import { ChecklistTemplate, ChecklistResposta } from '../types';

export function useChecklistOrdemResponse(ordemId: string | null) {
  const [response, setResponse] = useState<ChecklistResposta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ordemId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'checklist_respostas'),
      where('ordemId', '==', ordemId),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        setResponse({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        } as ChecklistResposta);
      } else {
        setResponse(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [ordemId]);

  return { response, loading };
}

export function useChecklistTemplates(farmId: string | null) {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!farmId) return;

    const q = query(
      collection(db, 'checklist_templates'),
      where('farmId', '==', farmId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as ChecklistTemplate[];
      setTemplates(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [farmId]);

  const saveTemplate = async (template: Partial<ChecklistTemplate>) => {
    if (!farmId) return;

    if (template.id) {
      const { id, ...rest } = template;
      await updateDoc(doc(db, 'checklist_templates', id), rest);
    } else {
      await addDoc(collection(db, 'checklist_templates'), {
        ...template,
        farmId,
        createdAt: serverTimestamp(),
        ativo: true
      });
    }
  };

  return { templates, loading, saveTemplate };
}

export function useChecklistResponses(farmId: string | null) {
  const [responses, setResponses] = useState<ChecklistResposta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!farmId) return;

    // Note: We might need a composite index for farmId + createdAt if we query by farm
    // For now, let's just listen to all and filter if needed, 
    // but usually responses are linked to ordens/execucoes.
    const q = query(
      collection(db, 'checklist_respostas'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as ChecklistResposta[];
      setResponses(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [farmId]);

  const submitResponse = async (resposta: Omit<ChecklistResposta, 'id' | 'createdAt'>) => {
    syncService.enqueue('SUBMIT_CHECKLIST', resposta);
  };

  return { responses, loading, submitResponse };
}
