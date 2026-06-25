import { useState, useEffect, useCallback, useRef } from 'react';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';
import { Talhao, OrdemServico, ExecucaoServico } from '../types';
import { useOrdensServico, useMinhasExecucoesAtivas } from './useServicos';
import { useTalhoes } from './useTalhoes';

export function useTalhaoGeofence(farmId: string | null) {
  const { talhoes } = useTalhoes(farmId || undefined);
  const { ordens } = useOrdensServico(farmId);
  const { execucoesAtivas } = useMinhasExecucoesAtivas(farmId);
  
  const [currentTalhao, setCurrentTalhao] = useState<Talhao | null>(null);
  const [suggestedOrdem, setSuggestedOrdem] = useState<OrdemServico | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number, accuracy: number} | null>(null);
  
  const lastCheckRef = useRef<number>(0);
  const CHECK_INTERVAL = 10000; // 10 seconds checking interval

  const detectTalhao = useCallback((lat: number, lng: number) => {
    const pt = point([lng, lat]);
    
    let found: Talhao | null = null;
    for (const t of talhoes) {
      if (t.geometria && t.geometria.geometry) {
        try {
          if (booleanPointInPolygon(pt, t.geometria as any)) {
            found = t;
            break;
          }
        } catch (e) {
          console.warn('Error checking geofence for talhao', t.id, e);
        }
      }
    }

    // Only update if talhao changed
    if (found?.id !== currentTalhao?.id) {
      setCurrentTalhao(found);
      
      if (found) {
        // Look for compatible OS (pending, partial, or execution)
        const compatible = ordens.find(o => 
          o.talhaoId === found?.id && 
          ['pendente', 'parcial', 'em_execucao'].includes(o.status)
        );

        // Check if user already has an active execution for this OS
        const alreadyRunning = execucoesAtivas.some(e => e.ordemId === compatible?.id);

        if (compatible && !alreadyRunning) {
          setSuggestedOrdem(compatible);
        } else {
          setSuggestedOrdem(null);
        }
      } else {
        setSuggestedOrdem(null);
      }
    }
  }, [talhoes, ordens, currentTalhao, execucoesAtivas]);

  useEffect(() => {
    if (!navigator.geolocation || !farmId || talhoes.length === 0) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLocation({ lat: latitude, lng: longitude, accuracy });

        const now = Date.now();
        if (now - lastCheckRef.current < CHECK_INTERVAL) return;
        lastCheckRef.current = now;

        // Accuracy filter: accuracy <= 20m
        if (accuracy > 20) return;

        detectTalhao(latitude, longitude);
      },
      (err) => console.error('Geofence GPS Error:', err),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [farmId, talhoes, detectTalhao]);

  const dismissSuggestion = () => setSuggestedOrdem(null);

  return {
    currentTalhao,
    suggestedOrdem,
    location,
    dismissSuggestion
  };
}
