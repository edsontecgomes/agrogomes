import { FormEvent, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CloudRain,
  Compass,
  Map as MapIcon,
  MapPin,
  Play,
  Sprout,
  TrendingUp,
  Users
} from 'lucide-react';
import {
  AnimatePresence,
  motion
} from 'motion/react';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc
} from 'firebase/firestore';

import { usePluviometros } from '../../hooks/usePluviometros';
import { useTalhoes } from '../../hooks/useTalhoes';
import { useUsuarios } from '../../hooks/useUsuarios';
import {
  auth,
  db
} from '../../services/firebase';
import { Usuario } from '../../types';
import {
  handleFirestoreError,
  OperationType
} from '../../utils/errorHandling';

import { ChuvaForm } from '../chuva/ChuvaForm';
import { TalhaoWalkingDrawer } from '../talhoes/TalhaoWalkingDrawer';
import { ConvitesList } from '../usuarios/ConvitesList';

interface FarmSetupWizardProps {
  farmId: string;
  onComplete: () => void;
  usuario?: Usuario | null;
}

interface FarmFormData {
  nome: string;
  cidade: string;
  estado: string;
  areaTotal: string;
}

export function FarmSetupWizard({
  farmId,
  onComplete,
  usuario
}: FarmSetupWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [farmData, setFarmData] =
    useState<FarmFormData>({
      nome: '',
      cidade: '',
      estado: '',
      areaTotal: ''
    });

  const { talhoes } = useTalhoes(farmId);
  const { usuarios } = useUsuarios(farmId);
  const { pluviometros } = usePluviometros(farmId);

  const [showDrawer, setShowDrawer] =
    useState(false);

  const [showRainTest, setShowRainTest] =
    useState(false);

  const nextStep = () => {
    setStep(current => Math.min(current + 1, 4));
  };

  const prevStep = () => {
    setStep(current => Math.max(current - 1, 1));
  };

  const handleSaveFarmData = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    if (!auth.currentUser) {
      handleFirestoreError(
        new Error('Usuário não autenticado.'),
        OperationType.CREATE,
        'fazendas'
      );
      return;
    }

    setLoading(true);

    try {
      const farmRef = doc(
        db,
        'fazendas',
        farmId
      );

      const farmSnapshot = await getDoc(farmRef);

      const existingData = farmSnapshot.exists()
        ? farmSnapshot.data()
        : undefined;

      const payload = {
        id: farmId,
        producerId:
          existingData?.producerId ||
          auth.currentUser.uid,
        nome: farmData.nome.trim(),
        cidade: farmData.cidade.trim(),
        estado: farmData.estado.trim().toUpperCase(),
        areaTotal: Number(farmData.areaTotal),
        configurada: false,
        talhoesConfigured: false,
        ativa: true,
        createdAt:
          existingData?.createdAt ||
          serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(
        farmRef,
        payload,
        {
          merge: true
        }
      );

      nextStep();
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.CREATE,
        'fazendas'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTalhao = async (
    geojson: unknown,
    area: number
  ) => {
    if (!auth.currentUser) {
      handleFirestoreError(
        new Error('Usuário não autenticado.'),
        OperationType.CREATE,
        'talhoes'
      );
      return;
    }

    try {
      await addDoc(
        collection(db, 'talhoes'),
        {
          nome: `Talhão ${talhoes.length + 1}`,
          farmId,
          producerId: auth.currentUser.uid,
          geometria: JSON.stringify(geojson),
          area,
          createdBy: auth.currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      );

      setShowDrawer(false);
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.CREATE,
        'talhoes'
      );
    }
  };

  const finishSetup = async () => {
    setLoading(true);

    try {
      await updateDoc(
        doc(db, 'fazendas', farmId),
        {
          configurada: true,
          talhoesConfigured: talhoes.length > 0,
          setupCompleted: true,
          updatedAt: serverTimestamp()
        }
      );

      if (usuario?.role === 'system_admin') {
        await addDoc(
          collection(db, 'logs_admin'),
          {
            userId: auth.currentUser?.uid,
            action: 'finalize_onboarding',
            farmId,
            timestamp: serverTimestamp(),
            details:
              'Onboarding finalized by support team'
          }
        );
      }

      onComplete();
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        'fazendas'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStepIcon = (
    stepNumber: number,
    Icon: typeof Sprout
  ) => {
    const isPast = step > stepNumber;
    const isCurrent = step === stepNumber;
    const isLastCompleted =
      step === 4 && stepNumber === 4;

    const iconClass = isPast
      ? 'bg-emerald-600 text-white'
      : isCurrent
        ? 'bg-emerald-100 text-emerald-600 ring-4 ring-emerald-50'
        : 'bg-slate-100 text-slate-400';

    return (
      <div className="flex flex-col items-center gap-2 relative z-10">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${iconClass}`}
        >
          {isPast || isLastCompleted ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : (
            <Icon className="w-5 h-5" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-12">
        <div className="flex justify-between items-center max-w-md mx-auto relative px-4">
          <div className="absolute left-8 right-8 top-5 h-0.5 bg-slate-100 -z-0" />

          <div
            className="absolute left-8 h-0.5 bg-emerald-600 transition-all duration-500 ease-out -z-0"
            style={{
              width: `${(step - 1) * 33.33}%`,
              maxWidth: 'calc(100% - 64px)'
            }}
          />

          {renderStepIcon(1, Sprout)}
          {renderStepIcon(2, MapIcon)}
          {renderStepIcon(3, Users)}
          {renderStepIcon(4, CloudRain)}
        </div>

        <div className="text-center mt-8">
          <h1 className="text-2xl font-black text-slate-900">
            {step === 1 && 'Dados da fazenda'}
            {step === 2 && 'Cadastro de talhões'}
            {step === 3 && 'Equipe e operadores'}
            {step === 4 &&
              'Monitoramento de chuva'}
          </h1>

          <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
            {step === 1 &&
              'Vamos configurar as informações básicas da fazenda.'}

            {step === 2 &&
              'Desenhe as áreas produtivas da fazenda no mapa.'}

            {step === 3 &&
              'Convide gerentes e operadores para trabalhar com você.'}

            {step === 4 &&
              'A fazenda está configurada. Faça um registro de chuva para validar a coleta.'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8 min-h-[400px] flex flex-col">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form
              key="step1"
              initial={{
                opacity: 0,
                x: 20
              }}
              animate={{
                opacity: 1,
                x: 0
              }}
              exit={{
                opacity: 0,
                x: -20
              }}
              onSubmit={handleSaveFarmData}
              className="space-y-6 max-w-md mx-auto w-full"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Nome da fazenda
                  </label>

                  <input
                    required
                    type="text"
                    value={farmData.nome}
                    onChange={event =>
                      setFarmData(current => ({
                        ...current,
                        nome: event.target.value
                      }))
                    }
                    className="w-full h-12 px-4 rounded-2xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    placeholder="Ex.: Fazenda Santa Maria"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                      Cidade
                    </label>

                    <input
                      required
                      type="text"
                      value={farmData.cidade}
                      onChange={event =>
                        setFarmData(current => ({
                          ...current,
                          cidade: event.target.value
                        }))
                      }
                      className="w-full h-12 px-4 rounded-2xl border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                      Estado (UF)
                    </label>

                    <input
                      required
                      maxLength={2}
                      type="text"
                      value={farmData.estado}
                      onChange={event =>
                        setFarmData(current => ({
                          ...current,
                          estado:
                            event.target.value.toUpperCase()
                        }))
                      }
                      className="w-full h-12 px-4 rounded-2xl border-slate-200"
                      placeholder="MT"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Área total aproximada (ha)
                  </label>

                  <input
                    required
                    min="0"
                    step="0.01"
                    type="number"
                    value={farmData.areaTotal}
                    onChange={event =>
                      setFarmData(current => ({
                        ...current,
                        areaTotal: event.target.value
                      }))
                    }
                    className="w-full h-12 px-4 rounded-2xl border-slate-200"
                    placeholder="1200"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all mt-8 disabled:opacity-50"
              >
                Próximo passo
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.form>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{
                opacity: 0,
                x: 20
              }}
              animate={{
                opacity: 1,
                x: 0
              }}
              exit={{
                opacity: 0,
                x: -20
              }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900">
                    Talhões cadastrados ({talhoes.length})
                  </h3>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                    {talhoes.length === 0 ? (
                      <div className="p-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />

                        <p className="text-sm text-slate-500">
                          Nenhum talhão criado.
                        </p>
                      </div>
                    ) : (
                      talhoes.map(talhao => (
                        <div
                          key={talhao.id}
                          className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm"
                        >
                          <div>
                            <p className="font-bold text-slate-900">
                              {talhao.nome}
                            </p>

                            <p className="text-xs text-slate-500">
                              {(talhao.area ?? 0).toFixed(1)} ha
                            </p>
                          </div>

                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900">
                    Adicionar talhão
                  </h3>

                  <p className="text-sm text-slate-500">
                    Recomendamos mapear a área para
                    obter métricas de produtividade
                    mais precisas.
                  </p>

                  {!showDrawer ? (
                    <button
                      type="button"
                      onClick={() =>
                        setShowDrawer(true)
                      }
                      className="w-full p-6 bg-slate-900 hover:bg-slate-800 text-white rounded-[32px] text-left relative overflow-hidden transition-all group"
                    >
                      <Compass className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 rotate-12 group-hover:rotate-0 transition-transform" />

                      <p className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-1">
                        Mapeamento em tempo real
                      </p>

                      <h4 className="text-lg font-bold">
                        Desenhar por caminhada
                      </h4>

                      <ArrowRight className="w-5 h-5 mt-4" />
                    </button>
                  ) : (
                    <TalhaoWalkingDrawer
                      onComplete={handleCreateTalhao}
                      onCancel={() =>
                        setShowDrawer(false)
                      }
                    />
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-8 border-t border-slate-100">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Voltar
                </button>

                <div className="flex flex-col items-end gap-2">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-8 h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center gap-2 transition-all active:scale-95"
                  >
                    Próximo passo
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {talhoes.length === 0 && (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors"
                    >
                      Configurar depois
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{
                opacity: 0,
                x: 20
              }}
              animate={{
                opacity: 1,
                x: 0
              }}
              exit={{
                opacity: 0,
                x: -20
              }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Vincular equipe
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      Gere um convite e peça para o
                      operador escanear com o celular.
                    </p>
                  </div>

                  <ConvitesList farmId={farmId} />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900">
                    Usuários vinculados (
                    {usuarios.length})
                  </h3>

                  <div className="space-y-3">
                    {usuarios.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl"
                      >
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-slate-400">
                          {(item.nome || 'U')
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {item.nome || 'Usuário'}
                          </p>

                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                            {item.role}
                          </p>
                        </div>

                        <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-8 border-t border-slate-100">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Voltar
                </button>

                <button
                  type="button"
                  onClick={nextStep}
                  className="px-8 h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center gap-2"
                >
                  Próximo passo
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{
                opacity: 0,
                x: 20
              }}
              animate={{
                opacity: 1,
                x: 0
              }}
              exit={{
                opacity: 0,
                x: -20
              }}
              className="space-y-8"
            >
              <div className="max-w-2xl mx-auto space-y-8">
                <div className="bg-blue-600 rounded-[40px] p-8 text-white relative overflow-hidden">
                  <CloudRain className="absolute right-4 top-4 w-20 h-20 opacity-20" />

                  <h3 className="text-xl font-black mb-4">
                    Inteligência hídrica
                  </h3>

                  <p className="text-blue-100 leading-relaxed mb-6">
                    Ao registrar uma chuva, o sistema
                    identifica a localização e vincula
                    o registro ao pluviômetro e à
                    fazenda corretos.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                      <MapPin className="w-5 h-5 mb-2 text-blue-300" />

                      <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">
                        Passo 1
                      </p>

                      <p className="text-sm font-bold">
                        Detecta sua localização
                      </p>
                    </div>

                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                      <TrendingUp className="w-5 h-5 mb-2 text-blue-300" />

                      <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">
                        Passo 2
                      </p>

                      <p className="text-sm font-bold">
                        Vincula ao pluviômetro local
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900">
                        Pronto para o campo?
                      </h4>

                      <p className="text-sm text-slate-500">
                        Faça um registro de teste para
                        validar o funcionamento.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setShowRainTest(true)
                      }
                      className="px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl transition-all active:scale-95"
                    >
                      Testar agora
                    </button>
                  </div>

                  {showRainTest && (
                    <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-200">
                      <ChuvaForm
                        onSuccess={() =>
                          setShowRainTest(false)
                        }
                        onCancel={() =>
                          setShowRainTest(false)
                        }
                        farmId={farmId}
                        pluviometros={pluviometros}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-8 border-t border-slate-100">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Voltar
                </button>

                <button
                  type="button"
                  onClick={finishSetup}
                  disabled={loading}
                  className="px-8 h-14 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-slate-200 disabled:opacity-50"
                >
                  Concluir configuração
                  <Play className="w-4 h-4 fill-white" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}