import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, Timestamp, limit, getDocs, or, orderBy, startAt, endAt } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Fazenda, Usuario } from '../types';

interface FarmContextType {
  currentFarmId: string | null;
  setCurrentFarmId: (id: string) => void;
  fazendas: Fazenda[];
  loading: boolean;
  activeFarm: Fazenda | null;
  usuario: Usuario | null;
  searchAllFarms: (term: string) => Promise<Fazenda[]>;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export function FarmProvider({ usuario, children }: { usuario: Usuario | null, children: React.ReactNode }) {
  const [currentFarmId, setFarmIdInternal] = useState<string | null>(localStorage.getItem('currentFarmId'));
  const [fazendas, setFazendas] = useState<Fazenda[]>([]);
  const [loading, setLoading] = useState(true);

  const searchAllFarms = async (term: string): Promise<Fazenda[]> => {
    if (!term || usuario?.role !== 'system_admin') return [];
    
    const q = query(
      collection(db, 'fazendas'),
      where('nome', '>=', term),
      where('nome', '<=', term + '\uf8ff'),
      limit(10)
    );
    
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ 
      id: d.id, 
      ...d.data(),
      createdAt: (d.data().createdAt as Timestamp)?.toDate() || new Date()
    } as Fazenda));
  };

  useEffect(() => {
// ... existing useEffect content ...
    if (!usuario) {
      setFazendas([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    let q;
    if (usuario.role === 'system_admin') {
      // System Admin starts by seeing recently active or a few farms, 
      // but we'll provide search functionality.
      q = query(collection(db, 'fazendas'), limit(20));
    } else if (usuario.role === 'admin' || usuario.role === 'produtor') {
      // Producer sees all their farms
      q = query(collection(db, 'fazendas'), where('producerId', '==', usuario.id));
    } else {
      // Other roles see the farm they are assigned to
      const assignedFarmId = usuario.farmId;
      if (assignedFarmId) {
        q = query(collection(db, 'fazendas'), where('id', '==', assignedFarmId));
      } else {
        setFazendas([]);
        setLoading(false);
        return;
      }
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ 
        id: d.id, 
        ...d.data(),
        createdAt: (d.data().createdAt as Timestamp)?.toDate() || new Date()
      } as Fazenda));
      
      setFazendas(docs);
      
      // Selection logic
      if (docs.length > 0) {
        const savedId = localStorage.getItem('currentFarmId');
        const exists = docs.find(f => f.id === savedId);
        
        if (!savedId || !exists) {
          const defaultId = usuario.primaryFarmId && docs.find(f => f.id === usuario.primaryFarmId)
            ? usuario.primaryFarmId 
            : docs[0].id;
            
          setFarmIdInternal(defaultId);
          localStorage.setItem('currentFarmId', defaultId);
        } else {
          setFarmIdInternal(savedId);
        }
      } else {
        setFarmIdInternal(null);
      }
      
      setLoading(false);
    }, (error) => {
      console.error('Farm context error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [usuario?.id, usuario?.role, usuario?.farmId]);

  const setCurrentFarmId = (id: string) => {
    setFarmIdInternal(id);
    localStorage.setItem('currentFarmId', id);
    if (usuario?.id) {
       updateDoc(doc(db, 'usuarios', usuario.id), { primaryFarmId: id }).catch(console.error);
    }
  };

  const activeFarm = fazendas.find(f => f.id === currentFarmId) || null;

  return (
    <FarmContext.Provider value={{ currentFarmId, setCurrentFarmId, fazendas, loading, activeFarm, usuario, searchAllFarms }}>
      {children}
    </FarmContext.Provider>
  );
}

export function useFarm() {
  const context = useContext(FarmContext);
  if (context === undefined) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
}
