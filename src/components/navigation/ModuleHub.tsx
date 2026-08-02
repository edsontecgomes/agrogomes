import React, { Suspense, lazy } from "react";

import { Usuario } from "../../types";

const AgronomiaHub = lazy(() =>
  import("../../modules/agronomia/AgronomiaHub").then((modulo) => ({
    default: modulo.AgronomiaHub,
  })),
);

const ChuvaDashboard = lazy(() =>
  import("../../modules/chuva/ChuvaDashboard").then((modulo) => ({
    default: modulo.ChuvaDashboard,
  })),
);

const ServicosDashboard = lazy(() =>
  import("../../modules/servicos/ServicosDashboard").then((modulo) => ({
    default: modulo.ServicosDashboard,
  })),
);

const SoloColetaDashboard = lazy(() =>
  import("../../modules/solo/SoloColetaDashboard").then((modulo) => ({
    default: modulo.SoloColetaDashboard,
  })),
);

const TalhoesDashboard = lazy(() =>
  import("../../modules/talhoes/TalhoesDashboard").then((modulo) => ({
    default: modulo.TalhoesDashboard,
  })),
);

const EstoqueDashboard = lazy(() =>
  import("../../modules/estoque/EstoqueDashboard").then((modulo) => ({
    default: modulo.EstoqueDashboard,
  })),
);

const CombustivelDashboard = lazy(() =>
  import("../../modules/combustivel/CombustivelDashboard").then((modulo) => ({
    default: modulo.CombustivelDashboard,
  })),
);

const EquipamentosDashboard = lazy(() =>
  import("../../modules/equipamentos/EquipamentosDashboard").then(
    (modulo) => ({
      default: modulo.EquipamentosDashboard,
    }),
  ),
);

const PecasManutencaoDashboard = lazy(() =>
  import("../../modules/pecas_manutencao/PecasManutencaoDashboard").then(
    (modulo) => ({
      default: modulo.PecasManutencaoDashboard,
    }),
  ),
);

const ConvitesList = lazy(() =>
  import("../../modules/usuarios/ConvitesList").then((modulo) => ({
    default: modulo.ConvitesList,
  })),
);

const FarmIntegrityDebug = lazy(() =>
  import("../../modules/admin/FarmIntegrityDebug").then((modulo) => ({
    default: modulo.FarmIntegrityDebug,
  })),
);

const PainelAuditoriaAgronomica = lazy(() =>
  import(
    "../../modules/orquestradorAgronomico/auditoria/PainelAuditoriaAgronomica"
  ).then((modulo) => ({
    default: modulo.PainelAuditoriaAgronomica,
  })),
);

const AgronomicOnboarding = lazy(() =>
  import("../AgronomicOnboarding").then((modulo) => ({
    default: modulo.AgronomicOnboarding,
  })),
);

const MapaGlobalSystemAdmin = lazy(() =>
  import("../../modules/admin/MapaGlobalSystemAdmin").then((modulo) => ({
    default: modulo.MapaGlobalSystemAdmin,
  })),
);

type ModuleHubProps = {
  activeModule: string;
  farmId: string;
  usuario: Usuario;
  isAdmin: boolean;
  isSystemAdmin: boolean;
  showOnboardingOnHome: boolean;
  onOpenModule?: (moduleId: string) => void;
};

function LoadingModule() {
  return (
    <main className="py-8 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3" />

        <p className="text-sm text-slate-500">
          Carregando módulo...
        </p>
      </div>
    </main>
  );
}

function AcessoRestrito() {
  return (
    <main className="py-12">
      <div className="max-w-xl mx-auto px-6">
        <div className="bg-white border border-amber-200 rounded-2xl p-6 text-center shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Acesso restrito
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Este módulo está disponível apenas para administradores.
          </p>
        </div>
      </div>
    </main>
  );
}

export function ModuleHub({
  activeModule,
  farmId,
  usuario,
  isAdmin,
  isSystemAdmin,
  onOpenModule = () => {},
}: ModuleHubProps) {
  void usuario;

  if (isSystemAdmin) {
    return (
      <Suspense fallback={<LoadingModule />}>
        {activeModule === "mapa_global" ? (
          <MapaGlobalSystemAdmin />
        ) : (
          <AcessoRestrito />
        )}
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<LoadingModule />}>
      {activeModule === "dashboard" && (
        <main className="py-8">
          <AgronomicOnboarding />
        </main>
      )}

      {activeModule === "agronomia" && (
        <main className="py-8">
          <AgronomiaHub onOpenModule={onOpenModule} />
        </main>
      )}

      {activeModule === "chuvas" && (
        <main className="py-8">
          <ChuvaDashboard farmId={farmId} />
        </main>
      )}

      {activeModule === "solo" && (
        <main className="py-8">
          <SoloColetaDashboard farmId={farmId} />
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

      {activeModule === "usuarios" && !isAdmin && <AcessoRestrito />}

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

      {activeModule === "integrity" && !isAdmin && <AcessoRestrito />}

      {activeModule === "auditoria" && isAdmin && (
        <PainelAuditoriaAgronomica farmId={farmId} />
      )}

      {activeModule === "auditoria" && !isAdmin && <AcessoRestrito />}
    </Suspense>
  );
}
