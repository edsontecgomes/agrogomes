import React, { useState, useEffect } from 'react';
import { collection, doc, writeBatch, serverTimestamp, addDoc } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import { syncService } from '../../services/syncService';
import { Pluviometro, ChuvaFormProps } from '../../types';
import { handleFirestoreError, OperationType } from '../../utils/errorHandling';
import { Droplets, Save, WifiOff, Crosshair, MapPin } from 'lucide-react';
import { useHighPrecisionGeolocation } from '../../hooks/useHighPrecisionGeolocation';
import { enviarNotificacao } from '../../hooks/useNotificacoes';

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Radius of the earth in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
}

export function ChuvaForm({ pluviometros, farmId }: ChuvaFormProps) {
  const [pluviometroId, setPluviometroId] = useState('');
  const [mm, setMm] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const [newPluviometroMode, setNewPluviometroMode] = useState(false);
  const [newPluviometroName, setNewPluviometroName] = useState('');
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number, accuracy?: number, altitude?: number} | null>(null);
  const [nearbyConflict, setNearbyConflict] = useState<Pluviometro | null>(null);
  const [highlightSelect, setHighlightSelect] = useState(false);
  const [userOverridden, setUserOverridden] = useState(false);

  // Automatically fetch high-precision location on component mount without manual button clicks
  const gps = useHighPrecisionGeolocation(true, 30, 2, 15000);

  const triggerHighlightAndVibrate = () => {
    if (navigator.vibrate) {
      try {
        navigator.vibrate(50);
      } catch (e) {
        // Ignore if vibration is not supported or blocked
      }
    }
    setHighlightSelect(true);
    setTimeout(() => setHighlightSelect(false), 2000);
  };

  // Automatically search and match the rain gauge (pluviômetro) as soon as high precision location is obtained
  useEffect(() => {
    if (gps.latitude && gps.longitude) {
      const loc = {
        lat: gps.latitude,
        lng: gps.longitude,
        accuracy: gps.accuracy || 0
      };
      
      setCurrentLocation(loc);

      // Only perform auto-detection if the user has not manually overridden the select dropdown
      if (!userOverridden) {
        if (pluviometros.length === 0) {
          setNewPluviometroMode(true);
          return;
        }

        let closest = pluviometros[0];
        let minDistance = getDistance(loc.lat, loc.lng, closest.location.lat, closest.location.lng);

        for (let i = 1; i < pluviometros.length; i++) {
          const p = pluviometros[i];
          const dist = getDistance(loc.lat, loc.lng, p.location.lat, p.location.lng);
          if (dist < minDistance) {
            minDistance = dist;
            closest = p;
          }
        }

        if (minDistance <= 50) {
          if (pluviometroId !== closest.id) {
            setPluviometroId(closest.id);
            setSuccessMessage(`Pluviômetro "${closest.nome}" detectado e selecionado automaticamente (${Math.round(minDistance)}m).`);
            setTimeout(() => setSuccessMessage(''), 5000);
            triggerHighlightAndVibrate();
          }
          setNewPluviometroMode(false);
        } else {
          // If closest is further than 50m, toggle new pluviometro creation mode automatically
          if (!newPluviometroMode) {
            setNewPluviometroMode(true);
            setPluviometroId('');
          }
        }
      }
    }
  }, [gps.latitude, gps.longitude, gps.accuracy, pluviometros, userOverridden, pluviometroId, newPluviometroMode]);

  const handleCreatePluviometro = async () => {
    if (!newPluviometroName.trim() || !currentLocation) return;
    
    // Check if there is already a pluviometro within 30 meters
    let closest: Pluviometro | null = null;
    let minDistance = Infinity;

    for (const p of pluviometros) {
      const dist = getDistance(currentLocation.lat, currentLocation.lng, p.location.lat, p.location.lng);
      if (dist < minDistance) {
        minDistance = dist;
        closest = p;
      }
    }

    if (closest && minDistance <= 30) {
      setNearbyConflict(closest);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const docRef = await addDoc(collection(db, 'pluviometros'), {
        nome: newPluviometroName.trim(),
        location: currentLocation,
        farmId
      });
      
      setPluviometroId(docRef.id);
      setNewPluviometroMode(false);
      setNewPluviometroName('');
      setSuccessMessage('Pluviômetro criado e selecionado com sucesso!');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError('Erro ao criar pluviômetro.');
      handleFirestoreError(err, OperationType.CREATE, 'pluviometros');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!auth.currentUser) {
      setError('Usuário não autenticado.');
      return;
    }

    if (!pluviometroId) {
      setError('Selecione um pluviômetro.');
      return;
    }

    const volume = Number(mm);
    if (isNaN(volume) || volume <= 0) {
      setError('O volume de chuva deve ser maior que zero.');
      return;
    }

    setLoading(true);

    try {
      const selectedPluviometro = pluviometros.find(p => p.id === pluviometroId);
      if (!selectedPluviometro) {
        throw new Error('Pluviômetro não encontrado.');
      }

      const rainData = {
        mm: Number(mm),
        location: selectedPluviometro.location,
        timestamp: Date.now(),
        userId: auth.currentUser.uid,
        farmId,
        pluviometroId,
        source: 'manual'
      };

      console.log('DEBUG [ChuvaForm]: Attempting to save rain...', { rainData, isOnline: navigator.onLine });

      if (!navigator.onLine) {
        console.log('DEBUG [ChuvaForm]: Offline mode, enqueuing sync...');
        syncService.enqueue('CREATE_CHUVA', rainData);
        setSuccessMessage('Registro salvo localmente. Será sincronizado automaticamente.');
        setMm('');
        setPluviometroId('');
        setTimeout(() => setSuccessMessage(''), 5000);
        return;
      }

      const batch = writeBatch(db);
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const chuvaComunitariaRef = doc(collection(db, 'chuvas_comunitarias'));
      const registroPessoalRef = doc(collection(db, 'registros_pessoais'));

      const coreData = {
        mm: Number(mm),
        location: selectedPluviometro.location,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp(),
        userId: auth.currentUser.uid,
        farmId,
        pluviometroId,
        source: 'manual'
      };

      console.log('DEBUG [ChuvaForm]: Online mode, committing batch...', coreData);
      
      batch.set(chuvaComunitariaRef, coreData);
      batch.set(registroPessoalRef, {
        ...coreData,
        month,
        year,
      });

      const commitPromise = batch.commit();

      enviarNotificacao({
        farmId,
        tipo: 'CHUVA_REGISTRADA',
        titulo: 'Chuva Registrada',
        mensagem: `${mm}mm registrados no pluviômetro ${selectedPluviometro.nome}.`,
        severidade: 'info'
      });

      await commitPromise;
      console.log('DEBUG [ChuvaForm]: Save successful!');
      setSuccessMessage('Registro salvo com sucesso.');

      setMm('');
      setPluviometroId('');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error('DEBUG [ChuvaForm]: Error saving rain:', err);
      setError('Ocorreu um erro ao salvar o registro. Tente novamente.');
      handleFirestoreError(err, OperationType.CREATE, 'chuvas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Droplets className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">Registrar Chuva</h2>
        </div>
        {!isOnline && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-md text-xs font-medium border border-amber-100">
            <WifiOff className="w-3.5 h-3.5" />
            Offline
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-slate-700">
              Pluviômetro
            </label>
            <div className="flex items-center gap-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full text-slate-600">
              {gps.accuracy !== null ? (
                <span className="flex items-center gap-1.5 text-emerald-600 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                  GPS: {gps.accuracy.toFixed(0)}m
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
                  Buscando GPS...
                </span>
              )}
            </div>
          </div>

          {nearbyConflict ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
              <p className="text-sm text-amber-800 font-medium">
                Já existe um pluviômetro muito próximo. Deseja usar ele?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPluviometroId(nearbyConflict.id);
                    setNewPluviometroMode(false);
                    setNearbyConflict(null);
                    setSuccessMessage(`Pluviômetro "${nearbyConflict.nome}" selecionado.`);
                    setTimeout(() => setSuccessMessage(''), 5000);
                    triggerHighlightAndVibrate();
                  }}
                  className="flex-1 bg-amber-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Usar {nearbyConflict.nome}
                </button>
                <button
                  type="button"
                  onClick={() => setNearbyConflict(null)}
                  className="px-3 py-2 text-slate-600 text-sm font-medium hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : newPluviometroMode ? (
            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-3">
              <p className="text-sm text-blue-800 font-medium">
                Nenhum pluviômetro a menos de 50m. Criar um novo aqui?
              </p>
              <input
                type="text"
                value={newPluviometroName}
                onChange={(e) => setNewPluviometroName(e.target.value)}
                placeholder="Nome do novo pluviômetro"
                className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCreatePluviometro}
                  disabled={loading || !newPluviometroName.trim()}
                  className="flex-1 bg-blue-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Criar e Selecionar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewPluviometroMode(false);
                    setUserOverridden(true);
                  }}
                  className="px-3 py-2 text-slate-600 text-sm font-medium hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar / Escolher da Lista
                </button>
              </div>
            </div>
          ) : (
            <select
              value={pluviometroId}
              onChange={(e) => {
                setPluviometroId(e.target.value);
                setUserOverridden(true);
              }}
              required
              className={`w-full px-4 py-2 border rounded-xl outline-none transition-all duration-500 ${
                highlightSelect 
                  ? 'bg-emerald-50 border-emerald-500 ring-4 ring-emerald-500/20 text-emerald-900 shadow-inner' 
                  : 'bg-slate-50 border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              }`}
            >
              <option value="" disabled>Selecione um pluviômetro</option>
              {pluviometros.map(p => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Volume (mm)
          </label>
          <input
            type="number"
            step="0.1"
            min="0.1"
            value={mm}
            onChange={(e) => setMm(e.target.value)}
            required
            placeholder="Ex: 15.5"
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !pluviometroId || !mm}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-medium rounded-xl transition-colors"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Salvando...' : 'Salvar Registro'}
        </button>

        {error && (
          <p className="text-sm text-center font-medium mt-2 text-red-600">
            {error}
          </p>
        )}

        {successMessage && (
          <p className={`text-sm text-center font-medium mt-2 ${successMessage.includes('localmente') ? 'text-amber-600' : 'text-emerald-600'}`}>
            {successMessage}
          </p>
        )}
      </form>
    </div>
  );
}
