import { useState, useEffect } from 'react';
import { syncService } from '../services/syncService';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function SyncStatus() {
  const [status, setStatus] = useState({ online: navigator.onLine, pending: syncService.getPendingCount() });

  useEffect(() => {
    const unsubscribe = syncService.subscribe((newStatus) => {
      setStatus(newStatus);
    });
    return unsubscribe;
  }, []);

  if (status.online && status.pending === 0) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
        <CheckCircle2 className="w-3 h-3" />
        Sincronizado
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
          status.online ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'
        }`}
      >
        {status.online ? (
          <>
            <RefreshCw className="w-3 h-3 animate-spin" />
            Sincronizando {status.pending} {status.pending === 1 ? 'item' : 'itens'}
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3" />
            Modo Offline • {status.pending} Pendentes
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
