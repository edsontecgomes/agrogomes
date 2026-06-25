import { useState, useEffect, useCallback, useRef } from 'react';

export type AccuracyStatus = 'red' | 'yellow' | 'green';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  timestamp: number | null;
  status: AccuracyStatus;
  isStable: boolean;
  pointsCollected: number;
}

export function useHighPrecisionGeolocation(
  enabled: boolean = true,
  targetAccuracy: number = 20,
  minPoints: number = 5,
  stabilizationTimeout: number = 20000
) {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    timestamp: null,
    status: 'red',
    isStable: false,
    pointsCollected: 0,
  });

  const [timeoutReached, setTimeoutReached] = useState(false);
  const pointsRef = useRef<{ lat: number; lng: number }[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const getStatus = (accuracy: number): AccuracyStatus => {
    if (accuracy <= 20) return 'green';
    if (accuracy <= 50) return 'yellow';
    return 'red';
  };

  const clearPoints = useCallback(() => {
    pointsRef.current = [];
    startTimeRef.current = Date.now();
    setTimeoutReached(false);
    setState(s => ({ ...s, isStable: false, pointsCollected: 0 }));
  }, []);

  useEffect(() => {
    if (!enabled || !navigator.geolocation) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    startTimeRef.current = Date.now();
    setTimeoutReached(false);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const timestamp = position.timestamp;
        const status = getStatus(accuracy);

        console.log(`[GPS DEBUG] Lat: ${latitude}, Lng: ${longitude}, Acc: ${accuracy}m, Time: ${new Date(timestamp).toLocaleTimeString()}`);

        // Filtering: User requested to ignore accuracy > 20m for "valid" position,
        // but we still want to show the status to the user.
        
        setState(prev => {
          const newState = {
            ...prev,
            latitude,
            longitude,
            accuracy,
            timestamp,
            status,
          };

          // Only collect points if accuracy is acceptable
          if (accuracy <= targetAccuracy) {
            pointsRef.current.push({ lat: latitude, lng: longitude });
            const collectedCount = pointsRef.current.length;
            
            if (collectedCount >= minPoints) {
              // Calculate average
              const avgLat = pointsRef.current.reduce((acc, p) => acc + p.lat, 0) / collectedCount;
              const avgLng = pointsRef.current.reduce((acc, p) => acc + p.lng, 0) / collectedCount;
              
              return {
                ...newState,
                latitude: avgLat,
                longitude: avgLng,
                isStable: true,
                pointsCollected: collectedCount,
              };
            }
            
            return {
              ...newState,
              pointsCollected: collectedCount,
              isStable: false,
            };
          }

          return newState;
        });

        // Check for timeout
        if (startTimeRef.current && Date.now() - startTimeRef.current > stabilizationTimeout) {
          setTimeoutReached(true);
        }
      },
      (error) => {
        console.error('[GPS ERROR]', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );

    watchIdRef.current = watchId;

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [enabled, targetAccuracy, minPoints, stabilizationTimeout]);

  return {
    ...state,
    timeoutReached,
    retry: clearPoints,
  };
}
