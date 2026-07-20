import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  MapPin,
  Navigation,
  PlayCircle,
  X
} from 'lucide-react';

import { useTalhaoGeofence } from '../hooks/useTalhaoGeofence';
import {
  useExecucoesServico,
  useMinhasExecucoesAtivas
} from '../hooks/useServicos';

interface GeofenceSuggesterProps {
  farmId: string;
}

export function GeofenceSuggester({
  farmId
}: GeofenceSuggesterProps) {
  const {
    suggestedOrdem,
    location,
    currentTalhao,
    dismissSuggestion
  } = useTalhaoGeofence(farmId);

  const { iniciarExecucao } = useExecucoesServico(
    suggestedOrdem?.id || null,
    farmId
  );

  const { execucoesAtivas } =
    useMinhasExecucoesAtivas(farmId);

  const handleStart = async () => {
    if (!suggestedOrdem || !currentTalhao) return;

    await iniciarExecucao(
      farmId,
      currentTalhao.id,
      location
        ? {
            lat: location.lat,
            lng: location.lng,
            accuracy: location.accuracy
          }
        : undefined
    );

    dismissSuggestion();
  };

  const isTrackingActive = execucoesAtivas.length > 0;

  return (
    <>
      <AnimatePresence mode="wait">
        {suggestedOrdem &&
          currentTalhao &&
          !isTrackingActive && (
            <div className="fixed inset-0 z-[100] pointer-events-none flex items-end justify-center p-4 sm:items-center bg-black/20 backdrop-blur-[2px]">
              <motion.div
                initial={{
                  opacity: 0,
                  y: 100,
                  scale: 0.9
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1
                }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                  y: 20
                }}
                className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 pointer-events-auto overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                      <MapPin className="w-6 h-6" />
                    </div>

                    <button
                      type="button"
                      onClick={dismissSuggestion}
                      className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Talhão detectado
                  </h3>

                  <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                    Você entrou no talhão{' '}
                    <span className="font-bold text-slate-900">
                      {currentTalhao.nome}
                    </span>
                    . Existe uma ordem de{' '}
                    <span className="font-bold text-slate-900">
                      {suggestedOrdem.tipoOperacao}
                    </span>{' '}
                    pendente. Confirmar início do trabalho?
                  </p>

                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={handleStart}
                      className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
                    >
                      <PlayCircle className="w-5 h-5" />
                      Iniciar trabalho
                    </button>

                    <button
                      type="button"
                      onClick={dismissSuggestion}
                      className="w-full py-3 px-6 text-slate-400 hover:text-slate-600 font-medium transition-colors text-sm"
                    >
                      Ignorar sugestão
                    </button>
                  </div>
                </div>

                {location && location.accuracy > 20 && (
                  <div className="bg-amber-50 px-6 py-2.5 flex items-center gap-2 border-t border-amber-100">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />

                    <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">
                      Sinal GPS instável (
                      {Math.round(location.accuracy)}m)
                    </span>
                  </div>
                )}
              </motion.div>
            </div>
          )}
      </AnimatePresence>

      <div className="fixed bottom-24 right-6 z-40 flex flex-col items-end gap-2 pointer-events-none">
        {isTrackingActive && (
          <motion.div
            initial={{
              opacity: 0,
              x: 20
            }}
            animate={{
              opacity: 1,
              x: 0
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg flex items-center gap-2 pointer-events-auto border border-blue-500 shadow-blue-200/50"
          >
            <div className="relative flex items-center justify-center">
              <div className="absolute w-4 h-4 bg-white rounded-full animate-ping opacity-20" />
              <Navigation className="w-4 h-4 animate-pulse" />
            </div>

            <span className="text-xs font-black uppercase tracking-widest">
              Rastreamento ativo
            </span>
          </motion.div>
        )}

        {location && (
          <motion.div
            initial={{
              opacity: 0,
              x: 20
            }}
            animate={{
              opacity: 1,
              x: 0
            }}
            className={`px-3 py-1.5 rounded-full shadow-md border flex items-center gap-2 pointer-events-auto backdrop-blur-md bg-white/90 ${
              location.accuracy <= 20
                ? 'border-emerald-200 text-emerald-700'
                : location.accuracy <= 50
                  ? 'border-amber-200 text-amber-700'
                  : 'border-red-200 text-red-700'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                location.accuracy <= 20
                  ? 'bg-emerald-500'
                  : location.accuracy <= 50
                    ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                    : 'bg-red-500 animate-pulse'
              }`}
            />

            <span className="text-[10px] font-black uppercase tracking-wider">
              GPS: {Math.round(location.accuracy)}m
            </span>
          </motion.div>
        )}
      </div>
    </>
  );
}