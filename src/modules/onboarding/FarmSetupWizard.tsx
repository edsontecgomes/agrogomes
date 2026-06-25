import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  Map as MapIcon, 
  Users, 
  CloudRain, 
  ClipboardList, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  QrCode,
  Plus,
  Compass,
  ArrowRight,
  TrendingUp,
  MapPin,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from '../../services/firebase';
import { doc, setDoc, updateDoc, collection, addDoc, serverTimestamp, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { handleFirestoreError } from '../../utils/errorHandling';
import { TalhaoWalkingDrawer } from '../talhoes/TalhaoWalkingDrawer';
import { ConvitesList } from '../usuarios/ConvitesList';
import { ChuvaForm } from '../chuva/ChuvaForm';
import { useTalhoes } from '../../hooks/useTalhoes';
import { useUsuarios } from '../../hooks/useUsuarios';
import { usePluviometros } from '../../hooks/usePluviometros';
import { Fazenda, Talhao, Usuario, OrdemServico } from '../../types';

interface FarmSetupWizardProps {
  farmId: string;
  onComplete: () => void;
  usuario?: Usuario | null;
}

export function FarmSetupWizard({ farmId, onComplete, usuario }: FarmSetupWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1 State: Farm Data
  const [farmData, setFarmData] = useState({
    nome: '',
    cidade: '',
    estado: '',
    areaTotal: ''
  });

  // Step 2: Talhões (Handled by existing components/hooks)
  const { talhoes } = useTalhoes(farmId);
  const [showDrawer, setShowDrawer] = useState(false);

  // Step 3: Users
  const { usuarios } = useUsuarios(farmId);

  // Step 4: Rain
  const { pluviometros } = usePluviometros(farmId);
  const [showRainTest, setShowRainTest] = useState(false);

  // Step 5: OS
  const [osData, setOsData] = useState({
    titulo: '',
    tipoOperacao: 'Plantio',
    talhaoId: '',
    operadorId: '',
    larguraOperacional: '18'
  });

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSaveFarmData = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log('DEBUG [FarmSetupWizard]: Saving farm data...', { farmId, farmData });
    try {
      const farmRef = doc(db, 'fazendas', farmId);
      const farmSnap = await getDocs(query(collection(db, 'fazendas'), where('id', '==', farmId)));
      const existingData = farmSnap.docs[0]?.data();
      console.log('DEBUG [FarmSetupWizard]: Existing farm data found:', existingData);

      const payload = {
        id: farmId,
        producerId: existingData?.producerId || auth.currentUser?.uid,
        ...farmData,
        areaTotal: Number(farmData.areaTotal),
        configurada: false,
        talhoesConfigured: false,
        ativa: true,
        createdAt: existingData?.createdAt || serverTimestamp()
      };
      
      console.log('DEBUG [FarmSetupWizard]: Sending payload to fazendas:', payload);

      await setDoc(farmRef, payload, { merge: true });
      console.log('DEBUG [FarmSetupWizard]: Save successful! Moving to next step.');
      nextStep();
    } catch (error) {
      console.error('DEBUG [FarmSetupWizard]: Error saving farm data:', error);
      handleFirestoreError(error, 'create' as any, 'fazendas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTalhao = async (geojson: any, area: number) => {
    try {
      await addDoc(collection(db, 'talhoes'), {
        nome: `Talhão ${talhoes.length + 1}`,
        farmId,
        geometria: JSON.stringify(geojson),
        area,
        createdAt: serverTimestamp()
      });
      setShowDrawer(false);
    } catch (error) {
      handleFirestoreError(error, 'create' as any, 'talhoes');
    }
  };

  const handleCreateOS = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log('DEBUG [FarmSetupWizard]: Creating OS...', { farmId, osData });
    try {
      const payload = {
        ...osData,
        farmId,
        status: 'pendente',
        larguraOperacional: Number(osData.larguraOperacional),
        createdBy: auth.currentUser?.uid,
        createdAt: serverTimestamp()
      };
      console.log('DEBUG [FarmSetupWizard]: OS Payload:', payload);
      await addDoc(collection(db, 'ordens_servico'), payload);
      console.log('DEBUG [FarmSetupWizard]: OS created! Moving to next step.');
      nextStep();
    } catch (error) {
      console.error('DEBUG [FarmSetupWizard]: Error creating OS:', error);
      handleFirestoreError(error, 'create' as any, 'ordens_servico');
    } finally {
      setLoading(false);
    }
  };

  const finishSetup = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'fazendas', farmId), { 
        configurada: true,
        talhoesConfigured: talhoes.length > 0,
        setupCompleted: true
      });
      
      // Audit log if system admin
      if (usuario?.role === 'system_admin') {
        await addDoc(collection(db, 'logs_admin'), {
          userId: auth.currentUser?.uid,
          action: 'finalize_onboarding',
          farmId,
          timestamp: serverTimestamp(),
          details: 'Onboarding finalized by support team'
        });
      }

      onComplete();
    } catch (error) {
      handleFirestoreError(error, 'update' as any, 'fazendas');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIcon = (s: number, icon: any) => {
    const Icon = icon;
    const isPast = step > s;
    const isCurrent = step === s;
    
    return (
      <div className={`flex flex-col items-center gap-2 relative z-10`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
          isPast ? 'bg-emerald-600 text-white' : 
          isCurrent ? 'bg-emerald-100 text-emerald-600 ring-4 ring-emerald-50' : 
          'bg-slate-100 text-slate-400'
        }`}>
          {(isPast || (step === 4 && s === 4)) ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Progress Header */}
      <div className="mb-12">
        <div className="flex justify-between items-center max-w-md mx-auto relative px-4">
          <div className="absolute left-8 right-8 top-5 h-0.5 bg-slate-100 -z-0" />
          <div 
            className="absolute left-8 h-0.5 bg-emerald-600 transition-all duration-500 ease-out -z-0" 
            style={{ width: `${(step - 1) * 33.33}%`, maxWidth: 'calc(100% - 64px)' }}
          />
          {renderStepIcon(1, Sprout)}
          {renderStepIcon(2, MapIcon)}
          {renderStepIcon(3, Users)}
          {renderStepIcon(4, CloudRain)}
        </div>
        <div className="text-center mt-8">
          <h1 className="text-2xl font-black text-slate-900">
            {step === 1 && "Dados da Fazenda"}
            {step === 2 && "Cadastro de Talhões"}
            {step === 3 && "Equipe e Operadores"}
            {step === 4 && "Monitoramento de Chuva"}
          </h1>
          <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
            {step === 1 && "Vamos começar configurando as informações básicas do seu negócio."}
            {step === 2 && "Desenhe as áreas produtivas da sua fazenda no mapa (opcional)."}
            {step === 3 && "Convide gerentes e operadores para trabalharem com você."}
            {step === 4 && "Sua fazenda está configurada com sucesso. Você poderá cadastrar talhões e configurar operações depois."}
          </p>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8 min-h-[400px] flex flex-col">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSaveFarmData}
              className="space-y-6 max-w-md mx-auto w-full"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Nome da Fazenda</label>
                  <input
                    required
                    type="text"
                    value={farmData.nome}
                    onChange={e => setFarmData(p => ({ ...p, nome: e.target.value }))}
                    className="w-full h-12 px-4 rounded-2xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    placeholder="Ex: Fazenda Santa Maria"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Cidade</label>
                    <input
                      required
                      type="text"
                      value={farmData.cidade}
                      onChange={e => setFarmData(p => ({ ...p, cidade: e.target.value }))}
                      className="w-full h-12 px-4 rounded-2xl border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Estado (UF)</label>
                    <input
                      required
                      maxLength={2}
                      type="text"
                      value={farmData.estado}
                      onChange={e => setFarmData(p => ({ ...p, estado: e.target.value.toUpperCase() }))}
                      className="w-full h-12 px-4 rounded-2xl border-slate-200"
                      placeholder="MT"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Área Total Aproximada (ha)</label>
                  <input
                    required
                    type="number"
                    value={farmData.areaTotal}
                    onChange={e => setFarmData(p => ({ ...p, areaTotal: e.target.value }))}
                    className="w-full h-12 px-4 rounded-2xl border-slate-200"
                    placeholder="1200"
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all mt-8"
              >
                Próximo Passo <ChevronRight className="w-5 h-5" />
              </button>
            </motion.form>
          )}

          {step === 2 && (
            <motion.div 
               key="step2"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="space-y-8"
            >
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                     <h3 className="text-lg font-bold text-slate-900">Talhões Cadastrados ({talhoes.length})</h3>
                     <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                        {talhoes.length === 0 ? (
                           <div className="p-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                             <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                             <p className="text-sm text-slate-500">Nenhum talhão criado.</p>
                           </div>
                        ) : (
                           talhoes.map(t => (
                             <div key={t.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                <div>
                                   <p className="font-bold text-slate-900">{t.nome}</p>
                                   <p className="text-xs text-slate-500">{t.area.toFixed(1)} ha</p>
                                </div>
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                             </div>
                           ))
                        )}
                     </div>
                  </div>

                  <div className="space-y-4">
                     <h3 className="text-lg font-bold text-slate-900">Adicionar Talhão</h3>
                     <p className="text-sm text-slate-500">Recomendamos mapear a área agora para ter métricas de produtividade mais precisas.</p>
                     
                     {!showDrawer ? (
                        <button 
                          onClick={() => setShowDrawer(true)}
                          className="w-full p-6 bg-slate-900 hover:bg-slate-800 text-white rounded-[32px] text-left relative overflow-hidden transition-all group"
                        >
                           <Compass className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 rotate-12 group-hover:rotate-0 transition-transform" />
                           <p className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-1">Mapeamento em Tempo Real</p>
                           <h4 className="text-lg font-bold">Desenhar por Caminhada</h4>
                           <ArrowRight className="w-5 h-5 mt-4" />
                        </button>
                     ) : (
                        <TalhaoWalkingDrawer 
                           onComplete={handleCreateTalhao}
                           onCancel={() => setShowDrawer(false)}
                        />
                     )}
                  </div>
               </div>

               <div className="flex justify-between items-center pt-8 border-t border-slate-100">
                  <button onClick={prevStep} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800">
                     <ChevronLeft className="w-5 h-5" /> Voltar
                  </button>
                  <div className="flex flex-col items-end gap-2">
                    <button 
                      onClick={nextStep}
                      className="px-8 h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center gap-2 transition-all active:scale-95"
                    >
                       Próximo Passo <ChevronRight className="w-5 h-5" />
                    </button>
                    {talhoes.length === 0 && (
                      <button 
                        type="button"
                        onClick={nextStep}
                        className="text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors"
                      >
                        Configurar Depois
                      </button>
                    )}
                  </div>
               </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
               key="step3"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="space-y-8"
            >
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                     <div>
                        <h3 className="text-lg font-bold text-slate-900">Vincular Equipe</h3>
                        <p className="text-sm text-slate-500 mt-1">Gere um convite e peça para seu operador escanear com o celular.</p>
                     </div>
                     <ConvitesList farmId={farmId} />
                  </div>

                  <div className="space-y-4">
                     <h3 className="text-lg font-bold text-slate-900">Usuários Vinculados ({usuarios.length})</h3>
                     <div className="space-y-3">
                        {usuarios.map(u => (
                           <div key={u.id} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-slate-400">
                                 {u.nome[0].toUpperCase()}
                              </div>
                              <div>
                                 <p className="text-sm font-bold text-slate-900">{u.nome}</p>
                                 <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{u.role}</p>
                              </div>
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="flex justify-between items-center pt-8 border-t border-slate-100">
                  <button onClick={prevStep} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800">
                     <ChevronLeft className="w-5 h-5" /> Voltar
                  </button>
                  <button 
                    onClick={nextStep}
                    className="px-8 h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center gap-2"
                  >
                     Próximo Passo <ChevronRight className="w-5 h-5" />
                  </button>
               </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
               key="step4"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="space-y-8"
            >
               <div className="max-w-2xl mx-auto space-y-8">
                  <div className="bg-blue-600 rounded-[40px] p-8 text-white relative overflow-hidden">
                     <CloudRain className="absolute right-4 top-4 w-20 h-20 opacity-20" />
                     <h3 className="text-xl font-black mb-4">Inteligência Hídrica</h3>
                     <p className="text-blue-100 leading-relaxed mb-6">
                        O monitoramento pluviométrico acontece de forma comunitária e automática. Ao registrar uma chuva, o sistema:
                     </p>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                           <MapPin className="w-5 h-5 mb-2 text-blue-300" />
                           <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Passo 1</p>
                           <p className="text-sm font-bold">Detecta sua localização</p>
                        </div>
                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                           <TrendingUp className="w-5 h-5 mb-2 text-blue-300" />
                           <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Passo 2</p>
                           <p className="text-sm font-bold">Vincula ao pluviômetro local</p>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <div>
                           <h4 className="font-bold text-slate-900">Pronto para o campo?</h4>
                           <p className="text-sm text-slate-500">Faça um registro de teste para ver como funciona.</p>
                        </div>
                        <button 
                          onClick={() => setShowRainTest(true)}
                          className="px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl transition-all active:scale-95"
                        >
                           Testar Agora
                        </button>
                     </div>

                     {showRainTest && (
                        <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-200">
                           <ChuvaForm 
                              onSuccess={() => setShowRainTest(false)}
                              onCancel={() => setShowRainTest(false)}
                              farmId={farmId}
                              pluviometros={pluviometros}
                           />
                        </div>
                     )}
                  </div>
               </div>

               <div className="flex justify-between items-center pt-8 border-t border-slate-100">
                  <button onClick={prevStep} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800">
                     <ChevronLeft className="w-5 h-5" /> Voltar
                  </button>
                  <button 
                    onClick={finishSetup}
                    disabled={loading}
                    className="px-8 h-14 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-slate-200"
                  >
                     Concluir Configuração <Play className="w-4 h-4 fill-white" />
                  </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
