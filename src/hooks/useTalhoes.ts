import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Talhao } from '../types';
import { handleFirestoreError } from '../utils/errorHandling';

export function useTalhoes(farmId: string | undefined) {
  const [talhoes, setTalhoes] = useState<Talhao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!farmId) {
      setTalhoes([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'talhoes'),
      where('farmId', '==', farmId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        let geometria = d.geometria;
        if (typeof geometria === 'string') {
          try {
            geometria = JSON.parse(geometria);
          } catch (e) {
            console.error('Error parsing geometry JSON', e);
          }
        }

        let coordenadas = d.coordenadas;
        if (!coordenadas && geometria) {
          if (geometria.geometry && geometria.geometry.coordinates) {
            coordenadas = geometria.geometry.coordinates[0]?.map((c: any) => ({ lat: c[1], lng: c[0] })) || [];
          } else if (geometria.coordinates) {
            coordenadas = geometria.coordinates[0]?.map((c: any) => ({ lat: c[1], lng: c[0] })) || [];
          }
        }

        return {
          id: doc.id,
          ...d,
          geometria,
          coordenadas: coordenadas || [],
          areaHa: d.areaHa !== undefined ? d.areaHa : (d.area || 0),
          area: d.area !== undefined ? d.area : (d.areaHa || 0),
          createdAt: d.createdAt?.toDate() || new Date(),
        } as Talhao;
      });
      setTalhoes(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, 'get' as any, 'talhoes');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [farmId]);

  return { talhoes, loading };
}
