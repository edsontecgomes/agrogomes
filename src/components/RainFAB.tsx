import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CloudRain, Loader2 } from 'lucide-react';

import { usePluviometros } from '../hooks/usePluviometros';
import { ChuvaForm } from '../modules/chuva/ChuvaForm';
import { RainFABProps } from '../types';

export function showRainFab(activeModule?: string): boolean {
  if (!activeModule) return false;
  return activeModule === 'dashboard' || activeModule === 'chuvas';
}

export function RainFAB({ farmId, activeModule }: RainFABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { pluviometros, loading } = usePluviometros(farmId);
  const isVisible = showRainFab(activeModule);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.button
            key="rain-fab-btn"
            type="button"
            aria-label="Lançar chuva"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className={`fixed bottom-8 right-8 z-50 flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 group ${
              activeModule === 'dashboard'
                ? 'scale-110 bg-emerald-600 shadow-emerald-600/50 md:scale-125'
                : 'bg-emerald-500 shadow-emerald-500/30'
            }`}
          >
            {activeModule === 'dashboard' && (
              <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-emerald-500/40" />
            )}
            <CloudRain
              className={`group-hover:animate-bounce ${
                activeModule === 'dashboard'
                  ? 'h-9 w-9'
                  : 'h-8 w-8'
              }`}
            />
            <span className="absolute right-full mr-4 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
              Lançar Chuva
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.button
              type="button"
              aria-label="Fechar lançamento de chuva"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              role="dialog"
              aria-modal="true"
              aria-label="Lançar chuva"
              className="relative max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl shadow-2xl"
            >
              {loading ? (
                <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-3xl bg-white p-8 text-slate-500">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                  <p className="text-sm font-medium">
                    Carregando pluviômetros...
                  </p>
                </div>
              ) : (
                <ChuvaForm
                  farmId={farmId}
                  pluviometros={pluviometros}
                  onCancel={handleClose}
                  onSuccess={handleClose}
                />
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
