import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, getDoc, setDoc, orderBy } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { Usuario, Convite } from '../types';
import { handleFirestoreError } from '../utils/errorHandling';

export function useUsuarioProfile(userId: string | null) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setUsuario(null);
      setLoading(false);
      return;
    }

    const userRef = doc(db, 'usuarios', userId);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUsuario({ 
          id: docSnap.id, 
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as Usuario);
      } else {
        setUsuario(null);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, 'get' as any, 'usuarios');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { usuario, loading };
}

export function useUsuario(farmId: string | null) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!farmId || !auth.currentUser) {
      setUsuario(null);
      setLoading(false);
      return;
    }

    const userId = auth.currentUser.uid;
    const userRef = doc(db, 'usuarios', userId);

    const unsubscribe = onSnapshot(userRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUsuario({ 
          id: docSnap.id, 
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as Usuario);
      } else {
        setUsuario(null);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, 'get' as any, 'usuarios');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [farmId]);

  return { usuario, loading };
}

export function useUsuarios(farmId: string | null) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!farmId || !auth.currentUser) {
      setUsuarios([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'usuarios'),
      where('farmId', '==', farmId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as Usuario;
      });
      setUsuarios(usersData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, 'list' as any, 'usuarios');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [farmId]);

  return { usuarios, loading };
}

export function useConvites(farmId: string | null) {
  const [convites, setConvites] = useState<Convite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!farmId || !auth.currentUser) {
      setConvites([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'convites'),
      where('farmId', '==', farmId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convitesData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          expiresAt: data.expiresAt?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date()
        } as Convite;
      });
      setConvites(convitesData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, 'list' as any, 'convites');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [farmId]);

  return { convites, loading };
}
