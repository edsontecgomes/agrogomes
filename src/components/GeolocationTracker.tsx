import React, { useEffect, useRef } from 'react';
import { useTalhoes } from '../hooks/useTalhoes';
import { useOrdensServico, useMinhasExecucoesAtivas } from '../hooks/useServicos';
import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon';
import { point, polygon as turfPolygon } from '@turf/helpers';
import { addDoc, collection, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { handleFirestoreError } from '../utils/errorHandling';

interface GeolocationTrackerProps {
  farmId: string;
}

export function GeolocationTracker({ farmId }: GeolocationTrackerProps) {
  const { talhoes } = useTalhoes(farmId);
  const { ordens } = useOrdensServico(farmId);
  const { execucoesAtivas } = useMinhasExecucoesAtivas(farmId);
  
  const lastLocationRef = useRef<{lat: number, lng: number} | null>(null);
  const processingRef = useRef(false);

  useEffect(() => {
    // Reset processing state when active executions change
    processingRef.current = false;
  }, [execucoesAtivas]);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy, altitude } = position.coords;
        const timestamp = position.timestamp;
        
        // Log for debug
        console.log(`[GeoTracker DEBUG] Lat: ${latitude}, Lng: ${longitude}, Acc: ${accuracy}m, Time: ${new Date(timestamp).toLocaleTimeString()}`);

        if (accuracy && accuracy > 20) {
          console.warn("[GeoTracker] Accuracy too low:", accuracy);
          return;
        }

        lastLocationRef.current = { lat: latitude, lng: longitude };

        // If we are already processing a location update, skip
        if (processingRef.current) return;
        
        // If there is already an active execution, check if we left the field
        if (execucoesAtivas.length > 0) {
          const activeExec = execucoesAtivas[0];
          const currentTalhao = talhoes.find(t => t.id === activeExec.talhaoId);
          
          if (currentTalhao && currentTalhao.geometria?.geometry?.coordinates) {
            const currentPoint = point([longitude, latitude]);
            const poly = turfPolygon(currentTalhao.geometria.geometry.coordinates);
            const isInside = booleanPointInPolygon(currentPoint, poly);
            
            if (!isInside) {
              // User left the field, finish execution!
              processingRef.current = true;
              try {
                await updateDoc(doc(db, 'execucoes_servico', activeExec.id), {
                  dataFim: serverTimestamp(),
                  locationEnd: {
                    lat: latitude,
                    lng: longitude,
                    accuracy: accuracy || 0,
                    altitude: altitude || 0
                  }
                });
                console.log(`Auto-finished execution ${activeExec.id} because user left talhao ${currentTalhao.nome}`);
                // Do not reset processingRef here, wait for execucoesAtivas to update
                return;
              } catch (error) {
                console.error("Error auto-finishing execution:", error);
                processingRef.current = false;
              }
            }
          }

          processingRef.current = false;
          return;
        }

        // Find an order that is "em_execucao"
        const ordensEmExecucao = ordens.filter(o => o.status === 'em_execucao');
        if (ordensEmExecucao.length === 0) {
          processingRef.current = false;
          return;
        }

        processingRef.current = true;

        try {
          const currentPoint = point([longitude, latitude]);

          for (const talhao of talhoes) {
            if (!talhao.geometria || !talhao.geometria.geometry || !talhao.geometria.geometry.coordinates) continue;

            // GeoJSON coordinates are [[[lng, lat], ...]]
            const coords = talhao.geometria.geometry.coordinates;
            
            try {
              const poly = turfPolygon(coords);
              const isInside = booleanPointInPolygon(currentPoint, poly);

              if (isInside) {
                // We are inside a talhao, and have an order "em_execucao", and no active execution.
                // Start execution automatically!
                const ordem = ordensEmExecucao[0]; // Pick the first one
                
                await addDoc(collection(db, 'execucoes_servico'), {
                  ordemId: ordem.id,
                  userId: auth.currentUser?.uid,
                  userName: auth.currentUser?.displayName || auth.currentUser?.email || 'Usuário',
                  farmId,
                  talhaoId: talhao.id,
                  dataInicio: serverTimestamp(),
                  locationStart: {
                    lat: latitude,
                    lng: longitude,
                    accuracy: accuracy || 0,
                    altitude: altitude || 0
                  },
                  createdAt: serverTimestamp()
                });

                console.log(`Auto-started execution for order ${ordem.id} in talhao ${talhao.nome}`);
                // Do not reset processingRef here, wait for execucoesAtivas to update
                return; 
              }
            } catch (err) {
              console.error("Error checking polygon intersection:", err);
            }
          }
          
          // If we didn't start any execution, we can process again
          processingRef.current = false;
        } catch (error) {
          console.error("Error in geolocation tracker:", error);
          processingRef.current = false;
        }
      },
      (error) => {
        console.error('Error watching position:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [talhoes, ordens, execucoesAtivas, farmId]);

  return null; // This is a logic-only component
}
