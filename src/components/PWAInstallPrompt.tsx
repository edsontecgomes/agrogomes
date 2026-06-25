import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Share, Smartphone, Sparkles, Check } from 'lucide-react';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // 1. Detect if already running in standalone mode (installed app)
    const checkStandalone = () => {
      const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
      // @ts-ignore
      const isIOSStandalone = window.navigator.standalone === true;
      return isStandaloneMedia || isIOSStandalone;
    };

    setIsStandalone(checkStandalone());

    // 2. Identify if iOS Safari user
    const checkIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIphoneOrIpad = /iphone|ipad|ipod/.test(userAgent);
      return isIphoneOrIpad;
    };

    setIsIOS(checkIOS());

    // 3. Listen for PWA installation prompt request
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Give a 3 seconds delay so it enters in a natural, elegant moment
      setTimeout(() => {
        if (!checkStandalone()) {
          setShowPrompt(true);
        }
      }, 3000);
    };

    // 4. Listen for successful install completion
    const handleAppInstalled = () => {
      console.log('AgroGomes successfully installed!');
      setInstalled(true);
      setShowPrompt(false);
      setTimeout(() => setInstalled(false), 5000); // Hide success alert after 5s
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Dynamic layout/display-mode change handler
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
    };
    mediaQuery.addEventListener('change', handleMediaChange);

    // Fallback display condition for iOS Safari (show guidance prompt first time)
    const hasSeenPrompt = localStorage.getItem('agrogomes-pwa-dismissed');
    if (checkIOS() && !checkStandalone() && !hasSeenPrompt) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show PWA browser native install dialog
    deferredPrompt.prompt();

    // Check what choice the user made
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User installation choice outcome: ${outcome}`);

    // Discard deferred event
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember dismissed state for 14 days to not annoy visitors
    localStorage.setItem('agrogomes-pwa-dismissed', 'true');
  };

  // If already installed or in standalone mode, DO NOT display installation prompt
  if (isStandalone && !installed) return null;

  return (
    <>
      <AnimatePresence>
        {installed && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 bg-emerald-600 text-white p-4 rounded-2xl shadow-xl border border-emerald-500 flex items-center gap-3 z-50"
            id="pwa-success-alert"
          >
            <div className="bg-white/20 p-2 rounded-xl">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-black text-sm">Instalado com Sucesso!</h4>
              <p className="text-emerald-100 text-xs mt-0.5">O AgroGomes agora está pronto na sua tela inicial.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPrompt && !installed && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-[420px] bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl z-50 overflow-hidden"
            id="pwa-install-modal"
          >
            {/* Background design accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -z-10" />

            <div className="flex gap-4 items-start">
              {/* App Icon Circle */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-500 p-2 text-white shadow-lg shadow-emerald-600/20 flex items-center justify-center shrink-0">
                <Smartphone className="w-7 h-7" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 uppercase tracking-widest mb-1">
                      <Sparkles className="w-3 h-3" /> PWA DISPONÍVEL
                    </span>
                    <h3 className="text-base font-black text-slate-900 leading-tight">Instalar AgroGomes</h3>
                  </div>
                  <button 
                    onClick={handleDismiss}
                    className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                  Acesse o AgroGomes diretamente da sua Tela de Início. Economize dados, carregue instantaneamente e use offline!
                </p>

                {/* Platform Action Division */}
                {isIOS ? (
                  <div className="mt-4 bg-slate-50 border border-slate-100 rounded-2xl p-3 text-slate-700 text-xs">
                    <p className="font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                      <Share className="w-3.5 h-3.5 text-emerald-600" /> Como instalar no iOS (Safari):
                    </p>
                    <ol className="list-decimal pl-4 space-y-1 text-slate-500 font-medium">
                      <li>Toque no botão <strong className="text-slate-700 font-black">Compartilhar</strong> (ícone na barra inferior).</li>
                      <li>Role para baixo e toque em <strong className="text-slate-700 font-black">Adicionar à Tela de Início</strong>.</li>
                    </ol>
                  </div>
                ) : (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={handleDismiss}
                      className="flex-1 py-2 text-center text-slate-500 text-xs font-bold hover:bg-slate-50 rounded-xl transition-colors border border-slate-200"
                    >
                      Agora Não
                    </button>
                    {deferredPrompt ? (
                      <button
                        onClick={handleInstallClick}
                        className="flex-1 py-2 bg-emerald-600 text-white text-xs font-black hover:bg-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Instalar
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex-1 py-2 bg-slate-100 text-slate-400 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed"
                      >
                        Pronto para Instalação
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
