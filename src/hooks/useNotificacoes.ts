import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { NotificacaoOperacional } from '../types';
import { handleFirestoreError, OperationType } from '../utils/errorHandling';

export function useNotificacoes(farmId: string | null) {
  const [notificacoes, setNotificacoes] = useState<NotificacaoOperacional[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!farmId || !auth.currentUser) {
      setNotificacoes([]);
      setLoading(false);
      return;
    }

    // Only get notifications for this farm and optionally for this specific user
    // (In a real app, you might only want some notifications for 'admin' and some for the operator)
    const q = query(
      collection(db, 'notificacoes_operacionais'),
      where('farmId', '==', farmId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date()
      })) as NotificacaoOperacional[];

      setNotificacoes(docs);
      setUnreadCount(docs.filter(n => !n.visualizada).length);
      setLoading(false);
    }, (error) => {
      console.error('Notification snapshot error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [farmId]);

  const marcarComoVisualizada = useCallback(async (id: string) => {
    try {
      await updateDoc(doc(db, 'notificacoes_operacionais', id), {
        visualizada: true
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `notificacoes_operacionais/${id}`);
    }
  }, []);

  const marcarTodasComoVisualizadas = useCallback(async () => {
    const unread = notificacoes.filter(n => !n.visualizada);
    for (const n of unread) {
      marcarComoVisualizada(n.id);
    }
  }, [notificacoes, marcarComoVisualizada]);

  return { notificacoes, loading, unreadCount, marcarComoVisualizada, marcarTodasComoVisualizadas };
}

export async function enviarNotificacao(data: Omit<NotificacaoOperacional, 'id' | 'createdAt' | 'visualizada'>) {
  try {
    // Basic debounce/anti-spam: check if a similar notification was sent recently
    // (Implementation omitted for brevity, but could use local cache or simple cooldown)
    
    await addDoc(collection(db, 'notificacoes_operacionais'), {
      ...data,
      visualizada: false,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}
