import React, { useEffect, useState } from "react";
import { User } from "firebase/auth";
import {
  CloudRain,
  ClipboardList,
  Users,
  Map as MapIcon,
  Info,
  LayoutDashboard,
  ShieldAlert,
  Boxes,
  Fuel,
  Wrench,
  Leaf,
} from "lucide-react";

import { logout } from "../services/firebase";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { PWAInstallPrompt } from "../components/PWAInstallPrompt";
import { FarmProvider, useFarm } from "../contexts/FarmContext";
import { useUsuarioProfile } from "../hooks/useUsuarios";
import { FarmSetupWizard } from "../modules/onboarding/FarmSetupWizard";
import { ModuleHub } from "../components/navigation/ModuleHub";
import { MainLayout } from "../components/layout/MainLayout";
import { Usuario } from "../types";

type ActiveModule =
  | "dashboard"
  | "agronomia"
  | "chuvas"
  | "servicos"
  | "talhoes"
  | "estoque"
  | "combustivel"
  | "equipamentos"
  | "pecas"
  | "usuarios"
  | "onboarding"
  | "integrity";

type MainAppProps = {
  user: User;
};

function ModuleNavButton({
  active,
  onClick,
  icon,
  label,
  danger = false,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
        active
          ? danger
            ? "bg-rose-50 text-rose-700"
            : "bg-emerald-50 text-emerald-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

export function MainApp({ user }: MainAppProps) {
  const { usuario, loading } = useUsuarioProfile(user.uid);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!usuario) {
    return null;
  }

  return (
    <FarmProvider usuario={usuario}>
      <MainAppContent user={user} usuario={usuario} />
    </FarmProvider>
  );
}

function MainAppContent({ user, usuario }: { user: User; usuario: Usuario }) {
  const { currentFarmId, activeFarm, loading: loadingFarms } = useFarm();
  const [activeModule, setActiveModule] = useState<ActiveModule>("dashboard");
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
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  const isAdmin = usuario.role === "admin" || usuario.role === "system_admin";
  const isSystemAdmin = usuario.role === "system_admin";
  const showOnboardingOnHome = accessCount <= 15;
  const isFarmConfigured = activeFarm?.configurada;

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
          type="button"
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
      <FarmSetupWizard
        farmId={currentFarmId}
        onComplete={() => {}}
        usuario={usuario}
      />
    );
  }

  if (showFarmWizard && newFarmIdForWizard) {
    return (
      <FarmSetupWizard
        farmId={newFarmIdForWizard}
        onComplete={() => setShowFarmWizard(false)}
        usuario={usuario}
      />
    );
  }

  const navigationItems: Array<{
    id: ActiveModule;
    label: string;
    icon: React.ReactNode;
    adminOnly?: boolean;
    danger?: boolean;
    hideWhenOnboardingHome?: boolean;
  }> = [
    {
      id: "dashboard",
      label: "Painel",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: "agronomia",
      label: "Agronomia IA",
      icon: <Leaf className="w-4 h-4" />,
    },
    {
      id: "chuvas",
      label: "Chuvas",
      icon: <CloudRain className="w-4 h-4" />,
    },
    {
      id: "servicos",
      label: "Serviços",
      icon: <ClipboardList className="w-4 h-4" />,
    },
    {
      id: "talhoes",
      label: "Talhões",
      icon: <MapIcon className="w-4 h-4" />,
    },
    {
      id: "estoque",
      label: "Estoque",
      icon: <Boxes className="w-4 h-4" />,
    },
    {
      id: "combustivel",
      label: "Combustível",
      icon: <Fuel className="w-4 h-4" />,
    },
    {
      id: "equipamentos",
      label: "Equipamentos",
      icon: <Wrench className="w-4 h-4" />,
    },
    {
      id: "pecas",
      label: "Peças",
      icon: <Wrench className="w-4 h-4" />,
    },
    {
      id: "usuarios",
      label: "Usuários",
      icon: <Users className="w-4 h-4" />,
      adminOnly: true,
    },
    {
      id: "onboarding",
      label: "Como funciona",
      icon: <Info className="w-4 h-4" />,
      hideWhenOnboardingHome: true,
    },
    {
      id: "integrity",
      label: "Integridade",
      icon: <ShieldAlert className="w-4 h-4" />,
      adminOnly: true,
      danger: true,
    },
  ];

  const visibleNavigationItems = navigationItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.hideWhenOnboardingHome && showOnboardingOnHome) return false;
    return true;
  });

  return (
    <ErrorBoundary>
      <MainLayout
        user={user}
        usuario={usuario}
        currentFarmId={currentFarmId}
        isSystemAdmin={isSystemAdmin}
        onLogout={logout}
      >
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 py-2 flex gap-2 overflow-x-auto">
            {visibleNavigationItems.map((item) => (
              <ModuleNavButton
                key={item.id}
                active={activeModule === item.id}
                onClick={() => setActiveModule(item.id)}
                icon={item.icon}
                label={item.label}
                danger={item.danger}
              />
            ))}
          </div>
        </div>

        <ModuleHub
          activeModule={activeModule}
          farmId={currentFarmId || ""}
          usuario={usuario}
          isAdmin={isAdmin}
          showOnboardingOnHome={showOnboardingOnHome}
          onOpenModule={(moduleId) => setActiveModule(moduleId as ActiveModule)}
        />

        <PWAInstallPrompt />
      </MainLayout>
    </ErrorBoundary>
  );
}