import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  AlertTriangle, 
  Info, 
  ShieldAlert,
  Clock,
  Filter,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotificacoes } from '../../hooks/useNotificacoes';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { NotificacaoOperacional } from '../../types';

interface NotificationCenterProps {
  farmId: string;
  onClose: () => void;
}

export function NotificationCenter({ farmId, onClose }: NotificationCenterProps) {
  const { notificacoes, loading, marcarComoVisualizada, marcarTodasComoVisualizadas } = useNotificacoes(farmId);
  const [filter, setFilter] = useState<'all' | 'info' | 'warning' | 'critical'>('all');

  const filtered = notificacoes.filter(n => {
    if (filter === 'all') return true;
    return n.severidade === filter;
  });

  const getSeverityStyles = (severity: NotificacaoOperacional['severidade']) => {
    switch (severity) {
      case 'critical': return 'bg-rose-50 border-rose-100 text-rose-700';
      case 'warning': return 'bg-amber-50 border-amber-100 text-amber-700';
      default: return 'bg-blue-50 border-blue-100 text-blue-700';
    }
  };

  const getSeverityIcon = (severity: NotificacaoOperacional['severidade']) => {
    switch (severity) {
      case 'critical': return <ShieldAlert className="w-5 h-5 text-rose-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      default: return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />

      {/* Drawer */}
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-md bg-slate-50 h-full shadow-2xl flex flex-col"
      >
        <div className="p-6 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Painel de Alertas</h2>
              <p className="text-xs text-slate-500 font-medium">Operações em tempo real</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 bg-white border-b border-slate-200 flex gap-2 overflow-x-auto no-scrollbar">
           <FilterButton 
            active={filter === 'all'} 
            onClick={() => setFilter('all')} 
            label="Todos" 
            count={notificacoes.length} 
          />
           <FilterButton 
            active={filter === 'critical'} 
            onClick={() => setFilter('critical')} 
            label="Críticos" 
            severity="critical"
            count={notificacoes.filter(n => n.severidade === 'critical').length} 
          />
           <FilterButton 
            active={filter === 'warning'} 
            onClick={() => setFilter('warning')} 
            label="Alertas" 
            severity="warning"
            count={notificacoes.filter(n => n.severidade === 'warning').length} 
          />
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-20 text-center space-y-4"
              >
                <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto text-slate-300">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <p className="text-slate-500 font-medium">Tudo tranquilo por enquanto.</p>
              </motion.div>
            ) : (
              filtered.map((n) => (
                <motion.div 
                  key={n.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`relative p-4 rounded-3xl border transition-all ${getSeverityStyles(n.severidade)} ${n.visualizada ? 'opacity-60 grayscale-[0.5]' : 'shadow-sm ring-1 ring-white/50'}`}
                  onClick={() => !n.visualizada && marcarComoVisualizada(n.id)}
                >
                   <div className="flex gap-4">
                      <div className="mt-0.5 p-2 bg-white/50 rounded-xl">
                        {getSeverityIcon(n.severidade)}
                      </div>
                      <div className="flex-grow space-y-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-sm leading-tight">{n.titulo}</h4>
                          <span className="text-[10px] opacity-60 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(n.createdAt, { addSuffix: true, locale: ptBR })}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed opacity-80">{n.mensagem}</p>
                      </div>
                   </div>
                   {!n.visualizada && (
                     <div className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full" />
                   )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="p-6 bg-white border-t border-slate-200">
          <button 
            onClick={marcarTodasComoVisualizadas}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95"
          >
            <Check className="w-5 h-5" /> Marcar todos como lidos
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function FilterButton({ active, onClick, label, count, severity }: { 
  active: boolean, 
  onClick: () => void, 
  label: string, 
  count: number,
  severity?: string 
}) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
        active 
          ? 'bg-slate-900 text-white shadow-lg shadow-slate-100' 
          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
      }`}
    >
      {label}
      <span className={`px-1.5 py-0.5 rounded-md ${active ? 'bg-white/20' : 'bg-slate-200'}`}>{count}</span>
    </button>
  );
}
