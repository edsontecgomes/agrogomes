import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Info, AlertTriangle, ShieldAlert, X } from 'lucide-react';
import { useNotificacoes } from '../../hooks/useNotificacoes';
import { NotificacaoOperacional } from '../../types';

interface NotificationToastProps {
  farmId: string;
}

export function NotificationToast({ farmId }: NotificationToastProps) {
  const { notificacoes } = useNotificacoes(farmId);
  const [activeToast, setActiveToast] = useState<NotificacaoOperacional | null>(null);

  useEffect(() => {
    if (notificacoes.length > 0) {
      const latest = notificacoes[0];
      // Only show if it's new (less than 5 seconds old) and unread
      const isNew = (Date.now() - latest.createdAt.getTime()) < 5000;
      
      if (isNew && !latest.visualizada) {
        setActiveToast(latest);
        const timer = setTimeout(() => setActiveToast(null), 6000);
        return () => clearTimeout(timer);
      }
    }
  }, [notificacoes]);

  if (!activeToast) return null;

  const getSeverityIcon = (severity: NotificacaoOperacional['severidade']) => {
    switch (severity) {
      case 'critical': return <ShieldAlert className="w-5 h-5 text-rose-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      default: return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getSeverityBg = (severity: NotificacaoOperacional['severidade']) => {
    switch (severity) {
      case 'critical': return 'bg-rose-50 border-rose-100';
      case 'warning': return 'bg-amber-50 border-amber-100';
      default: return 'bg-white border-slate-100';
    }
  };

  return (
    <AnimatePresence>
      {activeToast && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          className="fixed top-4 left-4 right-4 z-[200] max-w-sm mx-auto pointer-events-none"
        >
          <div className={`pointer-events-auto p-4 rounded-3xl border shadow-xl flex gap-3 items-center ${getSeverityBg(activeToast.severidade)}`}>
            <div className="p-2 bg-white rounded-xl shadow-sm">
              {getSeverityIcon(activeToast.severidade)}
            </div>
            <div className="flex-grow min-w-0">
              <h4 className="text-sm font-bold text-slate-900 truncate">{activeToast.titulo}</h4>
              <p className="text-xs text-slate-500 truncate">{activeToast.mensagem}</p>
            </div>
            <button 
              onClick={() => setActiveToast(null)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
