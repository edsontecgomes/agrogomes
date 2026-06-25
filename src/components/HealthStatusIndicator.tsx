import React from 'react';
import { useHealthMonitor } from '../hooks/useHealthMonitor';
import { 
  Wifi, 
  WifiOff, 
  MapPin, 
  MapPinOff, 
  RefreshCw, 
  Database,
  Activity,
  Battery,
  BatteryLow,
  BatteryWarning,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HealthStatusIndicatorProps {
  farmId: string | null;
}

export function HealthStatusIndicator({ farmId }: HealthStatusIndicatorProps) {
  const { health } = useHealthMonitor(farmId);
  const [showDetails, setShowDetails] = React.useState(false);

  const getGpsColor = () => {
    if (health.gps === 'ok') return 'text-emerald-500';
    if (health.gps === 'weak') return 'text-amber-500';
    return 'text-rose-500';
  };

  const getInternetColor = () => {
    return health.internet === 'online' ? 'text-emerald-500' : 'text-rose-500';
  };

  const getSyncColor = () => {
    if (health.sync === 'syncing') return 'text-sky-500 animate-spin';
    if (health.sync === 'pending') return 'text-amber-500';
    return 'text-slate-400';
  };

  const getBatteryIcon = () => {
    if (health.battery === 'critical') return <BatteryWarning className="w-4 h-4 text-rose-500" />;
    if (health.battery === 'low') return <BatteryLow className="w-4 h-4 text-amber-500" />;
    return <Battery className="w-4 h-4 text-emerald-500" />;
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full border border-slate-200 transition-colors"
      >
        <div className="flex -space-x-1">
          <Wifi className={`w-3.5 h-3.5 ${getInternetColor()}`} />
          <MapPin className={`w-3.5 h-3.5 ${getGpsColor()}`} />
        </div>
        
        {health.queueSize > 0 && (
          <div className="flex items-center gap-1">
            <RefreshCw className={`w-3 h-3 ${getSyncColor()}`} />
            <span className="text-[10px] font-bold text-slate-600">{health.queueSize}</span>
          </div>
        )}

        {health.tracking === 'active' && (
          <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
        )}
        
        {health.tracking === 'error' && (
          <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
        )}
      </button>

      <AnimatePresence>
        {showDetails && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowDetails(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 overflow-hidden"
            >
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Saúde Operacional</h3>
              
              <div className="space-y-4">
                {/* Conexão */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${health.internet === 'online' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {health.internet === 'online' ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                    </div>
                    <span className="text-sm font-medium text-slate-600">Internet</span>
                  </div>
                  <span className={`text-xs font-bold ${health.internet === 'online' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {health.internet === 'online' ? 'Online' : 'Offline'}
                  </span>
                </div>

                {/* GPS */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${health.gps === 'ok' ? 'bg-emerald-50 text-emerald-600' : health.gps === 'weak' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                      {health.gps !== 'offline' ? <MapPin className="w-4 h-4" /> : <MapPinOff className="w-4 h-4" />}
                    </div>
                    <span className="text-sm font-medium text-slate-600">GPS</span>
                  </div>
                  <span className={`text-xs font-bold ${getGpsColor()}`}>
                    {health.gps === 'ok' ? 'Excelente' : health.gps === 'weak' ? 'Instável' : 'Sem Sinal'}
                  </span>
                </div>

                {/* Sincronização */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-slate-50 text-slate-400">
                      <Database className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">Fila Pendente</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    {health.queueSize} itens
                  </span>
                </div>

                {/* Tracking */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${health.tracking === 'active' ? 'bg-emerald-50 text-emerald-600' : health.tracking === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'}`}>
                      <Activity className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">Execução</span>
                  </div>
                  <span className={`text-xs font-bold ${health.tracking === 'active' ? 'text-emerald-600' : health.tracking === 'error' ? 'text-rose-600' : 'text-slate-400'}`}>
                    {health.tracking === 'active' ? 'Ativa' : health.tracking === 'error' ? 'Falha' : 'Inativa'}
                  </span>
                </div>

                {/* Bateria */}
                {health.battery && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-slate-50">
                        {getBatteryIcon()}
                      </div>
                      <span className="text-sm font-medium text-slate-600">Bateria</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900 uppercase">
                      {health.battery}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
