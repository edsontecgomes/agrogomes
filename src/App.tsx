import React, { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  auth,
  loginWithGoogle,
  loginWithEmail,
  criarContaComEmail,
  recuperarSenha,
  logout,
  db,
  isMobileOrPWA,
} from "./services/firebase";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ChuvaDashboard } from "./modules/chuva/ChuvaDashboard";
import { ServicosDashboard } from "./modules/servicos/ServicosDashboard";
import { ConvitesList } from "./modules/usuarios/ConvitesList";
import { QRScanner } from "./modules/usuarios/QRScanner";
import { TalhoesDashboard } from "./modules/talhoes/TalhoesDashboard";
import { GeolocationTracker } from "./components/GeolocationTracker";
import { AgronomicOnboarding } from "./components/AgronomicOnboarding";
import { RainFAB } from "./components/RainFAB";
import { GeofenceSuggester } from "./components/GeofenceSuggester";
import { LocationTracker } from "./components/LocationTracker";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { SyncStatus } from "./components/SyncStatus";
import { useUsuarioProfile } from "./hooks/useUsuarios";
import { useMinhasExecucoesAtivas } from "./hooks/useServicos";
import { OperadorDashboard } from "./modules/operador/OperadorDashboard";
import { FarmSetupWizard } from "./modules/onboarding/FarmSetupWizard";
import { NotificationToast } from "./modules/operador/NotificationToast";
import { HealthStatusIndicator } from "./components/HealthStatusIndicator";
import { FarmIntegrityDebug } from "./modules/admin/FarmIntegrityDebug";
import { EstoqueDashboard } from "./modules/estoque/EstoqueDashboard";
import { CombustivelDashboard } from "./modules/combustivel/CombustivelDashboard";
import { EquipamentosDashboard } from "./modules/equipamentos/EquipamentosDashboard";
import { PecasManutencaoDashboard } from "./modules/pecas_manutencao/PecasManutencaoDashboard";
import { FarmProvider, useFarm } from "./contexts/FarmContext";
import { FarmSelector } from "./components/FarmSelector";
import {
  Sprout,
  LogOut,
  CloudRain,
  ClipboardList,
  Users,
  QrCode,
  Plus,
  Map as MapIcon,
  Info,
  Activity,
  LayoutDashboard,
  Bell,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Boxes,
  Fuel,
  Wrench,
} from "lucide-react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { handleFirestoreError } from "./utils/errorHandling";
import { useFazenda } from "./hooks/useFazenda";
import { Usuario } from "./types";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("AUTH STATE CHANGED:", currentUser?.email || null);
      setUser(currentUser);
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  const getFriendlyError = (error: any) => {
    const code = error?.code || "";

    if (code === "auth/user-not-found") return "Usuário não encontrado.";
    if (code === "auth/wrong-password") return "Senha incorreta.";
    if (code === "auth/invalid-email") return "E-mail inválido.";
    if (code === "auth/email-already-in-use") return "Este e-mail já está cadastrado.";
    if (code === "auth/weak-password") return "A senha deve ter pelo menos 6 caracteres.";
    if (code === "auth/operation-not-allowed") return "Login por e-mail/senha não está habilitado no Firebase.";
    if (code === "auth/network-request-failed") return "Falha de conexão. Verifique sua internet.";

    return error?.message || "Erro ao fazer login.";
  };

  const validarCampos = () => {
    if (!email.trim()) {
      setLoginError("Informe o e-mail.");
      return false;
    }

    if (!senha.trim()) {
      setLoginError("Informe a senha.");
      return false;
    }

    if (senha.length < 6) {
      setLoginError("A senha deve ter pelo menos 6 caracteres.");
      return false;
    }

    return true;
  };

  const handleEmailLogin = async () => {
    if (!validarCampos()) return;

    try {
      setLoginLoading(true);
      setLoginError(null);
      await loginWithEmail(email, senha);
    } catch (error: any) {
      setLoginError(getFriendlyError(error));
    } finally {
      setLoginLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!validarCampos()) return;

    try {
      setLoginLoading(true);
      setLoginError(null);
      await criarContaComEmail(email, senha);
    } catch (error: any) {
      setLoginError(getFriendlyError(error));
    } finally {
      setLoginLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      setLoginError("Informe seu e-mail para recuperar a senha.");
      return;
    }

    try {
      setLoginLoading(true);
      setLoginError(null);
      await recuperarSenha(email);
      setLoginError("Enviamos um link de recuperação para seu e-mail.");
    } catch (error: any) {
      setLoginError(getFriendlyError(error));
    } finally {
      setLoginLoading(false);
    }
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    const mobile = isMobileOrPWA();

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sprout className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">AgroGomes</h1>

          <p className="text-slate-500 mb-6">
            Gestão agrícola inteligente e análise de produtividade.
          </p>

          <div className="text-left space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@gmail.com"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Senha
              </label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="mínimo 6 caracteres"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {loginError && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-left text-sm text-amber-800">
              {loginError}
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={loginLoading}
              onClick={handleEmailLogin}
              className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium rounded-xl transition-colors"
            >
              {loginLoading ? "Aguarde..." : "Entrar"}
            </button>

            <button
              type="button"
              disabled={loginLoading}
              onClick={handleCreateAccount}
              className="py-3 px-4 bg-slate-100 hover:bg-slate-200 disabled:opacity-60 text-slate-800 font-medium rounded-xl transition-colors"
            >
              Criar conta
            </button>
          </div>

          <button
            type="button"
            disabled={loginLoading}
            onClick={handlePasswordReset}
            className="mt-4 text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            Esqueci minha senha
          </button>

          {!mobile && (
            <>
              <div className="my-6 flex items-center gap-3">
                <div className="h-px bg-slate-200 flex-1" />
                <span className="text-xs text-slate-400">ou continue com</span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              <button
                type="button"
                onClick={async () => {
                  try {
                    setLoginError(null);
                    await loginWithGoogle();
                  } catch (error: any) {
                    setLoginError(getFriendlyError(error));
                  }
                }}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-colors"
              >
                Entrar com Google
              </button>
            </>
          )}

          {mobile && (
            <p className="mt-6 text-xs text-slate-400">
              No celular, use e-mail e senha para maior estabilidade.
            </p>
          )}
        </div>
      </div>
    );
  }

  return <MainApp user={user} />;
}
function MainApp({ user }: { user: User }) {
  const { usuario, loading } = useUsuarioProfile(user.uid);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!usuario) {
    return <NoProfileScreen user={user} />;
  }

  return (
    <FarmProvider usuario={usuario}>
      <MainAppContent user={user} usuario={usuario} />
    </FarmProvider>
  );
}

function NoProfileScreen({ user }: { user: User }) {
  const [isScanning, setIsScanning] = useState(false);

  const handleCreateFarm = async () => {
    try {
      const farmId = `farm_${Date.now()}`;
      const userRef = doc(db, "usuarios", user.uid);
      await setDoc(
        userRef,
        {
          id: user.uid,
          email: user.email || "",
          nome: user.displayName || "Usuário",
          role: "admin",
          createdAt: serverTimestamp(),
        },
        { merge: true },
      );

      const farmRef = doc(db, "fazendas", farmId);
      await setDoc(farmRef, {
        id: farmId,
        producerId: user.uid,
        nome: "Minha Fazenda",
        configurada: false,
        ativa: true,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, "create" as any, "usuarios");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {isScanning ? (
        <QRScanner
          onSuccess={(farmId) => setIsScanning(false)}
          onCancel={() => setIsScanning(false)}
        />
      ) : (
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sprout className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">AgroGomes</h1>
          <p className="text-slate-500 mb-8">
            Você ainda não faz parte de nenhuma fazenda.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => setIsScanning(true)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors"
            >
              <QrCode className="w-5 h-5" /> Entrar com QR Code
            </button>
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">
                ou
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>
            <button
              onClick={handleCreateFarm}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5" /> Criar Nova Fazenda
            </button>
          </div>
          <button
            onClick={logout}
            className="mt-8 text-sm text-slate-500 hover:text-slate-700 underline"
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
}

function MainAppContent({ user, usuario }: { user: User; usuario: Usuario }) {
  const { currentFarmId, activeFarm, loading: loadingFarms } = useFarm();
  const { execucoesAtivas } = useMinhasExecucoesAtivas(currentFarmId);
  const [activeModule, setActiveModule] = useState<
    | "chuvas"
    | "servicos"
    | "usuarios"
    | "talhoes"
    | "onboarding"
    | "dashboard"
    | "integrity"
    | "estoque"
    | "combustivel"
    | "equipamentos"
    | "pecas"
  >(usuario.role === "operador" ? "dashboard" : "chuvas");
  const [accessCount, setAccessCount] = useState(0);
  const [showFarmWizard, setShowFarmWizard] = useState(false);
  const [newFarmIdForWizard, setNewFarmIdForWizard] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const handleOpenWizard = () => {
      setNewFarmIdForWizard(`farm_${Date.now()}`);
      setShowFarmWizard(true);
    };
    const handleSetActiveModule = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setActiveModule(customEvent.detail);
      }
    };
    window.addEventListener("open-farm-onboarding", handleOpenWizard);
    window.addEventListener("set-active-module", handleSetActiveModule);
    return () => {
      window.removeEventListener("open-farm-onboarding", handleOpenWizard);
      window.removeEventListener("set-active-module", handleSetActiveModule);
    };
  }, []);

  useEffect(() => {
    const count = Number(
      localStorage.getItem(`access_count_${user.uid}`) || "0",
    );
    const newCount = count + 1;
    localStorage.setItem(`access_count_${user.uid}`, newCount.toString());
    setAccessCount(newCount);
  }, [user.uid]);

  if (loadingFarms) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const isAdmin = usuario.role === "admin" || usuario.role === "system_admin";
  const isSystemAdmin = usuario.role === "system_admin";
  const showOnboardingOnHome = accessCount <= 15;
  const isFarmConfigured = activeFarm?.configurada;

  // Fallback: Se não houver fazenda selecionada e não for admin configurando a primeira
  if (!currentFarmId && !showFarmWizard && usuario.role !== "system_admin") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Nenhuma Fazenda Ativa
        </h2>
        <p className="text-slate-500 max-w-xs mb-8">
          Não conseguimos localizar sua fazenda. Por favor, entre em contato com
          seu administrador.
        </p>
        <button
          onClick={logout}
          className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl transition-all active:scale-95"
        >
          Sair da Conta
        </button>
      </div>
    );
  }

  if (isAdmin && !isFarmConfigured && currentFarmId) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-lg">
              <Sprout className="w-6 h-6" />
              AgroGomes
            </div>

            <FarmSelector />

            <div className="text-slate-500 text-sm font-medium">
              Configuração {activeFarm?.nome}
            </div>
          </div>
          <button
            onClick={logout}
            className="text-slate-400 hover:text-slate-600"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </header>
        <main>
          <FarmSetupWizard
            farmId={currentFarmId}
            onComplete={() => {}}
            usuario={usuario}
          />
        </main>
      </div>
    );
  }

  if (showFarmWizard && newFarmIdForWizard) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-50 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 justify-between sticky top-0">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-lg">
            <Sprout className="w-6 h-6" />
            AgroGomes <span className="mx-2 text-slate-300">/</span>{" "}
            <span className="text-slate-500 text-sm font-medium">
              Cadastrar Fazenda
            </span>
          </div>
          <button
            onClick={() => setShowFarmWizard(false)}
            className="text-sm font-bold text-slate-500 hover:text-slate-900 border px-4 py-2 rounded-xl"
          >
            Cancelar
          </button>
        </header>
        <FarmSetupWizard
          farmId={newFarmIdForWizard}
          onComplete={() => setShowFarmWizard(false)}
          usuario={usuario}
        />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <GeolocationTracker farmId={currentFarmId || usuario.farmId || ''} />
      <NotificationToast farmId={currentFarmId || usuario.farmId || ''} />
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-lg">
                <Sprout className="w-6 h-6" />
                AgroGomes
              </div>

              <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block" />

              <div className="flex items-center gap-3">
                <FarmSelector />
                {isSystemAdmin && (
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-wider rounded-full border border-amber-200">
                    <ShieldCheck className="w-3 h-3" />
                    System Admin
                  </span>
                )}
              </div>

              <div className="h-6 w-px bg-slate-200 mx-2 hidden lg:block" />

              <nav className="hidden md:flex items-center gap-1">
                <button
                  onClick={() => setActiveModule("dashboard")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeModule === "dashboard"
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Painel
                </button>
                <button
                  onClick={() => setActiveModule("chuvas")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeModule === "chuvas"
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <CloudRain className="w-4 h-4" />
                  Chuvas
                </button>
                <button
                  onClick={() => setActiveModule("servicos")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeModule === "servicos"
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  Serviços
                </button>

                <button
                  onClick={() => setActiveModule("talhoes")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeModule === "talhoes"
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <MapIcon className="w-4 h-4" />
                  Talhões
                </button>
                <button
                  onClick={() => setActiveModule("estoque")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeModule === "estoque"
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Boxes className="w-4 h-4" />
                  Estoque
                </button>
                <button
                  onClick={() => setActiveModule("combustivel")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeModule === "combustivel"
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Fuel className="w-4 h-4" />
                  Combustível
                </button>
                <button
                  onClick={() => setActiveModule("equipamentos")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeModule === "equipamentos"
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Wrench className="w-4 h-4" />
                  Equipamentos
                </button>
                <button
                  onClick={() => setActiveModule("pecas")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeModule === "pecas"
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Wrench className="w-4 h-4" />
                  Peças
                </button>
                {isAdmin && (
                  <button
                    onClick={() => setActiveModule("usuarios")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeModule === "usuarios"
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Usuários
                  </button>
                )}
                {!showOnboardingOnHome && (
                  <button
                    onClick={() => setActiveModule("onboarding")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeModule === "onboarding"
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Info className="w-4 h-4" />
                    Como funciona
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={() => setActiveModule("integrity")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeModule === "integrity"
                        ? "bg-rose-50 text-rose-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Integridade
                  </button>
                )}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3">
                <HealthStatusIndicator farmId={currentFarmId} />
                <SyncStatus />
              </div>
              <div className="flex items-center gap-2">
                <img
                  src={
                    user.photoURL ||
                    `https://ui-avatars.com/api/?name=${user.email}`
                  }
                  alt="Avatar"
                  className="w-8 h-8 rounded-full border border-slate-200"
                  referrerPolicy="no-referrer"
                />
                <div className="hidden sm:block">
                  <span className="text-sm font-medium text-slate-700 block leading-tight">
                    {user.displayName || user.email}
                  </span>
                  <span className="text-xs text-slate-500 capitalize">
                    {usuario.role}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Navigation */}
        <div className="md:hidden bg-white border-b border-slate-200 flex p-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveModule("dashboard")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeModule === "dashboard"
                ? "bg-emerald-50 text-emerald-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Painel
          </button>
          <button
            onClick={() => setActiveModule("chuvas")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeModule === "chuvas"
                ? "bg-emerald-50 text-emerald-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <CloudRain className="w-4 h-4" />
            Chuvas
          </button>
          <button
            onClick={() => setActiveModule("servicos")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeModule === "servicos"
                ? "bg-emerald-50 text-emerald-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Serviços
          </button>

          <button
            onClick={() => setActiveModule("talhoes")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeModule === "talhoes"
                ? "bg-emerald-50 text-emerald-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <MapIcon className="w-4 h-4" />
            Talhões
          </button>
          <button
            onClick={() => setActiveModule("estoque")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeModule === "estoque"
                ? "bg-emerald-50 text-emerald-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Boxes className="w-4 h-4" />
            Estoque
          </button>
          <button
            onClick={() => setActiveModule("combustivel")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeModule === "combustivel"
                ? "bg-emerald-50 text-emerald-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Fuel className="w-4 h-4" />
            Combustível
          </button>
          <button
            onClick={() => setActiveModule("equipamentos")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeModule === "equipamentos"
                ? "bg-emerald-50 text-emerald-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Wrench className="w-4 h-4" />
            Equipamentos
          </button>
          <button
            onClick={() => setActiveModule("pecas")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeModule === "pecas"
                ? "bg-emerald-50 text-emerald-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Wrench className="w-4 h-4" />
            Peças
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveModule("usuarios")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeModule === "usuarios"
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Users className="w-4 h-4" />
              Usuários
            </button>
          )}
          {!showOnboardingOnHome && (
            <button
              onClick={() => setActiveModule("onboarding")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeModule === "onboarding"
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Info className="w-4 h-4" />
              Como funciona
            </button>
          )}
        </div>

        <main className="py-8">
          {activeModule === "dashboard" && (
            <OperadorDashboard farmId={currentFarmId || ""} usuario={usuario} />
          )}
          {activeModule === "chuvas" && (
            <>
              {showOnboardingOnHome && <AgronomicOnboarding />}
              <ChuvaDashboard farmId={currentFarmId || ""} />
            </>
          )}
          {activeModule === "servicos" && (
            <ServicosDashboard farmId={currentFarmId || ""} />
          )}
          {activeModule === "talhoes" && (
            <TalhoesDashboard farmId={currentFarmId || ""} />
          )}
          {activeModule === "estoque" && (
            <EstoqueDashboard farmId={currentFarmId || ""} />
          )}
          {activeModule === "combustivel" && (
            <CombustivelDashboard farmId={currentFarmId || ""} />
          )}
          {activeModule === "equipamentos" && (
            <EquipamentosDashboard farmId={currentFarmId || ""} />
          )}
          {activeModule === "pecas" && (
            <PecasManutencaoDashboard farmId={currentFarmId || ""} />
          )}
          {activeModule === "usuarios" && isAdmin && (
            <div className="max-w-7xl mx-auto px-6">
              <ConvitesList farmId={currentFarmId || ""} />
            </div>
          )}
          {activeModule === "onboarding" && <AgronomicOnboarding />}
          {activeModule === "integrity" && isAdmin && <FarmIntegrityDebug />}
        </main>

        <RainFAB farmId={currentFarmId} activeModule={activeModule} />
        <GeofenceSuggester farmId={currentFarmId || ''} />
        <LocationTracker activeExecutions={execucoesAtivas} />
        <PWAInstallPrompt />
      </div>
    </ErrorBoundary>
  );
}
