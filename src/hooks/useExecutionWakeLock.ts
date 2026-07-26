import { useCallback, useEffect, useRef, useState } from 'react';

type WakeLockStatus =
  | 'inactive'
  | 'requesting'
  | 'active'
  | 'released'
  | 'unsupported'
  | 'error';

export function useExecutionWakeLock(enabled: boolean) {
  const sentinelRef = useRef<WakeLockSentinel | null>(null);
  const enabledRef = useRef(enabled);
  const [status, setStatus] = useState<WakeLockStatus>('inactive');

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const requestWakeLock = useCallback(async () => {
    if (!enabledRef.current || document.visibilityState !== 'visible') {
      return;
    }

    const wakeLock = navigator.wakeLock;

    if (!wakeLock) {
      setStatus('unsupported');
      return;
    }

    if (sentinelRef.current && !sentinelRef.current.released) {
      setStatus('active');
      return;
    }

    setStatus('requesting');

    try {
      const sentinel = await wakeLock.request('screen');

      sentinelRef.current = sentinel;
      setStatus('active');

      sentinel.addEventListener(
        'release',
        () => {
          sentinelRef.current = null;

          if (enabledRef.current) {
            setStatus('released');
          }
        },
        { once: true }
      );
    } catch (error) {
      console.warn('Não foi possível manter a tela ativa:', error);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      const sentinel = sentinelRef.current;
      sentinelRef.current = null;
      setStatus('inactive');

      if (sentinel && !sentinel.released) {
        void sentinel.release();
      }

      return;
    }

    void requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void requestWakeLock();
      }
    };

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      );

      const sentinel = sentinelRef.current;
      sentinelRef.current = null;

      if (sentinel && !sentinel.released) {
        void sentinel.release();
      }
    };
  }, [enabled, requestWakeLock]);

  return {
    status,
    isActive: status === 'active',
    isSupported: status !== 'unsupported',
    requestWakeLock
  };
}
