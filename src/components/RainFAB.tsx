import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CloudRain, 
  X, 
  Crosshair, 
  Save, 
  Plus, 
  CheckCircle2,
  AlertCircle,
  Loader2,
  MapPin
} from 'lucide-react';
import { usePluviometros } from '../hooks/usePluviometros';
import { auth, db } from '../services/firebase';
import { syncService } from '../services/syncService';
import { collection, addDoc, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/errorHandling';
import { Pluviometro, RainFABProps } from '../types';
import { HighPrecisionFixer } from './HighPrecisionFixer';

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
/* ... standard getDistance ... */
}

/* ... rest of helpers ... */

export function showRainFab(activeModule?: string): boolean {
  if (!activeModule) return false;
  return activeModule === 'dashboard' || activeModule === 'chuvas';
}

export function RainFAB({ farmId, activeModule }: RainFABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { pluviometros } = usePluviometros(farmId);
  
  const [mm, setMm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFixer, setShowFixer] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number, accuracy?: number} | null>(null);
  const [selectedPluviometro, setSelectedPluviometro] = useState<Pluviometro | null>(null);
  const [newPluviometroName, setNewPluviometroName] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleOpen = () => {
    setIsOpen(true);
    resetForm();
    setShowFixer(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setMm('');
    setSelectedPluviometro(null);
    setNewPluviometroName('');
    setCurrentLocation(null);
    setError('');
    setShowSuccess(false);
  };

  const handleLocationFixed = (loc: { lat: number, lng: number, accuracy: number }) => {
    setCurrentLocation(loc);
    setShowFixer(false);

    // Find nearby pluviometer
    if (pluviometros.length > 0) {
      let closest = pluviometros[0];
      const getDist = (l1: any, l2: any) => {
        const R = 6371e3;
        const dLat = (l2.lat - l1.lat) * Math.PI / 180;
        const dLon = (l2.lng - l1.lng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(l1.lat * Math.PI / 180) * Math.cos(l2.lat * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      };

      let minDistance = getDist(loc, closest.location);

      for (let i = 1; i < pluviometros.length; i++) {
        const p = pluviometros[i];
        const dist = getDist(loc, p.location);
        if (dist < minDistance) {
          minDistance = dist;
          closest = p;
        }
      }

      if (minDistance <= 50) {
        setSelectedPluviometro(closest);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    setLoading(true);
    setError('');

    try {
      let pId = selectedPluviometro?.id;
      let pLocation = selectedPluviometro?.location;

      // Create new pluviometer if needed
      if (!selectedPluviometro && newPluviometroName.trim() && currentLocation) {
        const pRef = await addDoc(collection(db, 'pluviometros'), {
          nome: newPluviometroName.trim(),
          location: currentLocation,
          farmId,
          createdAt: serverTimestamp()
        });
        pId = pRef.id;
        pLocation = currentLocation;
      }

      if (!pId || !pLocation) {
        throw new Error('Pluviômetro não selecionado ou criado.');
      }

      const rainData = {
        mm: Number(mm),
        location: pLocation,
        timestamp: Date.now(),
        userId: auth.currentUser.uid,
        farmId,
        pluviometroId: pId,
        source: 'fab'
      };

      if (!navigator.onLine) {
        syncService.enqueue('CREATE_CHUVA', rainData);
        setShowSuccess(true);
        setTimeout(handleClose, 2000);
        return;
      }

      const batch = writeBatch(db);
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      // Community rain record
      const communityRef = doc(collection(db, 'chuvas_comunitarias'));
      batch.set(communityRef, {
        mm: Number(mm),
        location: pLocation,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp(),
        userId: auth.currentUser.uid,
        farmId,
        pluviometroId: pId,
        source: 'fab'
      });

      // Personal rain record
      const personalRef = doc(collection(db, 'registros_pessoais'));
      batch.set(personalRef, {
        mm: Number(mm),
        month,
        year,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp(),
        userId: auth.currentUser.uid,
        farmId,
        pluviometroId: pId,
        source: 'fab'
      });

      await batch.commit();
      setShowSuccess(true);
      setTimeout(handleClose, 2000);
    } catch (err) {
      console.error(err);
      setError('Erro ao salvar registro de chuva.');
      handleFirestoreError(err, OperationType.CREATE, 'chuvas');
    } finally {
      setLoading(false);
    }
  };

  const isVisible = showRainFab(activeModule);

  return (
    <>
      {/* FAB Button */}
      <AnimatePresence>
        {isVisible && (
          <motion.button
            key="rain-fab-btn"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpen}
            className={`fixed bottom-8 right-8 w-16 h-16 text-white rounded-full shadow-lg flex items-center justify-center z-50 group transition-all duration-300 ${
              activeModule === 'dashboard'
                ? 'bg-emerald-600 shadow-emerald-600/50 scale-110 md:scale-125'
                : 'bg-emerald-500 shadow-emerald-500/30'
            }`}
          >
            {activeModule === 'dashboard' && (
              <span className="absolute inset-0 rounded-full bg-emerald-500/40 animate-ping -z-10" />
            )}
            <CloudRain className={`group-hover:animate-bounce ${activeModule === 'dashboard' ? 'w-9 h-9' : 'w-8 h-8'}`} />
            <span className="absolute right-full mr-4 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Lançar Chuva
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
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
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                    <CloudRain className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Lançar Chuva</h3>
                </div>
                <button 
                  onClick={handleClose}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-6">
                {showSuccess ? (
                  <div className="py-8 text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900">Registro Salvo!</h4>
                    <p className="text-slate-500">Obrigado por contribuir com os dados da fazenda.</p>
                  </div>
                ) : (
                  <>
                    {/* Location Status */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">Localização</span>
                        {currentLocation ? (
                          <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Detectada
                          </span>
                        ) : (
                          <span className="text-blue-600 flex items-center gap-1 text-xs">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Obtendo sinal...
                          </span>
                        )}
                      </div>

                      {showFixer ? (
                        <HighPrecisionFixer 
                          onLocationFixed={handleLocationFixed}
                          targetAccuracy={20}
                        />
                      ) : selectedPluviometro ? (
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Pluviômetro Próximo</p>
                              <p className="text-slate-900 font-bold">{selectedPluviometro.nome}</p>
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setShowFixer(true)}
                            className="text-xs text-blue-600 hover:underline font-bold"
                          >
                            Trocar
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl space-y-3">
                            <div className="flex items-center gap-2 text-blue-700">
                              <Plus className="w-4 h-4" />
                              <span className="text-sm font-bold">Criar novo pluviômetro aqui</span>
                            </div>
                            <input
                              type="text"
                              value={newPluviometroName}
                              onChange={(e) => setNewPluviometroName(e.target.value)}
                              placeholder="Nome do local (ex: Sede, Talhão 4)"
                              className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              required={!selectedPluviometro}
                            />
                            <button 
                              type="button"
                              onClick={() => setShowFixer(true)}
                              className="w-full text-[10px] text-blue-600 font-bold uppercase tracking-widest text-center py-1 hover:underline"
                            >
                              Refazer Captura GPS
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Rain Value */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Volume de Chuva (mm)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={mm}
                          onChange={(e) => setMm(e.target.value)}
                          required
                          placeholder="0.0"
                          className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-2xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all pr-16"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">mm</span>
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl flex items-center gap-2 border border-red-100">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading || (!selectedPluviometro && !newPluviometroName) || !mm || !currentLocation}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                      Salvar Registro
                    </button>
                    
                    <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest font-bold">
                      Dados georreferenciados para análise de precisão
                    </p>
                  </>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
