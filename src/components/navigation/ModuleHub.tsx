import React, { Suspense, lazy } from "react";
import { Usuario } from "../../types";

const AgronomiaHub = lazy(() =>
  import("../../modules/agronomia/AgronomiaHub").then((m) => ({ default: m.AgronomiaHub }))
);

const ChuvaDashboard = lazy(() =>
  import("../../modules/chuva/ChuvaDashboard").then((m) => ({ default: m.ChuvaDashboard }))
);

const ServicosDashboard = lazy(() =>
  import("../../modules/servicos/ServicosDashboard").then((m) => ({ default: m.ServicosDashboard }))
);

const TalhoesDashboard = lazy(() =>
  import("../../modules/talhoes/TalhoesDashboard").then((m) => ({ default: m.TalhoesDashboard }))
);

const OperadorDashboard = lazy(() =>
  import("../../modules/operador/OperadorDashboard").then((m) => ({ default: m.OperadorDashboard }))
);

const EstoqueDashboard = lazy(() =>
  import("../../modules/estoque/EstoqueDashboard").then((m) => ({ default: m.EstoqueDashboard }))
);

const CombustivelDashboard = lazy(() =>
  import("../../modules/combustivel/CombustivelDashboard").then((m) => ({ default: m.CombustivelDashboard }))
);

const EquipamentosDashboard = lazy(() =>
  import("../../modules/equipamentos/EquipamentosDashboard").then((m) => ({ default: m.EquipamentosDashboard }))
);

const PecasManutencaoDashboard = lazy(() =>
  import("../../modules/pecas_manutencao/PecasManutencaoDashboard").then((m) => ({
    default: m.PecasManutencaoDashboard,
  }))
);

const ConvitesList = lazy(() =>
  import("../../modules/usuarios/ConvitesList").then((m) => ({ default: m.ConvitesList }))
);

const FarmIntegrityDebug = lazy(() =>
  import("../../modules/admin/FarmIntegrityDebug").then((m) => ({ default: m.FarmIntegrityDebug }))
);

const AgronomicOnboarding = lazy(() =>
  import("../AgronomicOnboarding").then((m) => ({ default: m.AgronomicOnboarding }))
);

type ModuleHubProps = {
  activeModule: string;
  farmId: string;
  usuario: Usuario;
  isAdmin: boolean;
  showOnboardingOnHome: boolean;
  onOpenModule: (moduleId: string) => void;
};

function LoadingModule() {
  return (
    <main className="py-8 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500">Carregando módulo...</p>
      </div>
    </main>
  );
}

export function ModuleHub({
  activeModule,
  farmId,
  usuario,
  isAdmin,
  showOnboardingOnHome,
  onOpenModule,
}: ModuleHubProps) {
  return (
    <Suspense fallback={<LoadingModule />}>
      {activeModule === "dashboard" && (
        <main className="py-8">
          <OperadorDashboard farmId={farmId} usuario={usuario} />
        </main>
      )}

      {activeModule === "agronomia" && (
        <main className="py-8">
          <AgronomiaHub onOpenModule={onOpenModule} />
        </main>
      )}

      {activeModule === "chuvas" && (
        <main className="py-8">
          {showOnboardingOnHome && <AgronomicOnboarding />}
          <ChuvaDashboard farmId={farmId} />
        </main>
      )}

      {activeModule === "servicos" && (
        <main className="py-8">
          <ServicosDashboard farmId={farmId} />
        </main>
      )}

      {activeModule === "talhoes" && (
        <main className="py-8">
          <TalhoesDashboard farmId={farmId} />
        </main>
      )}

      {activeModule === "estoque" && (
        <main className="py-8">
          <EstoqueDashboard farmId={farmId} />
        </main>
      )}

      {activeModule === "combustivel" && (
        <main className="py-8">
          <CombustivelDashboard farmId={farmId} />
        </main>
      )}

      {activeModule === "equipamentos" && (
        <main className="py-8">
          <EquipamentosDashboard farmId={farmId} />
        </main>
      )}

      {activeModule === "pecas" && (
        <main className="py-8">
          <PecasManutencaoDashboard farmId={farmId} />
        </main>
      )}

      {activeModule === "usuarios" && isAdmin && (
        <main className="py-8">
          <div className="max-w-7xl mx-auto px-6">
            <ConvitesList farmId={farmId} />
          </div>
        </main>
      )}

      {activeModule === "onboarding" && (
        <main className="py-8">
          <AgronomicOnboarding />
        </main>
      )}

      {activeModule === "integrity" && isAdmin && (
        <main className="py-8">
          <FarmIntegrityDebug />
        </main>
      )}
    </Suspense>
  );
}