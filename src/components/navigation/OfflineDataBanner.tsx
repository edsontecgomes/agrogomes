import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CheckCircle2,
  CloudOff,
  Database,
} from "lucide-react";

import {
  hasOperationalModulesReady,
} from "../../app/pwa/warmupOperationalModules";
import {
  getOfflineReferenceSummary,
  OFFLINE_REFERENCE_STORE_EVENT,
  type OfflineReferenceSummary,
} from "../../services/offlineReferenceStore";
import {
  getCachedChecklistTemplates,
  getCachedOrdensServico,
  OFFLINE_OPERATIONAL_STORE_EVENT,
} from "../../services/offlineOperationalStore";
import {
  useNetworkStatus,
} from "../../hooks/useNetworkStatus";

interface OfflineDataBannerProps {
  farmId: string | null;
}

function emptySummary(
  farmId: string,
): OfflineReferenceSummary {
  return {
    farmId,
    talhoes: 0,
    equipamentos: 0,
    produtos: 0,
    ueis: 0,
    prontoParaOperacao: false,
  };
}

export function OfflineDataBanner({
  farmId,
}: OfflineDataBannerProps) {
  const { isOffline } =
    useNetworkStatus();
  const [
    summary,
    setSummary,
  ] = useState<
    OfflineReferenceSummary
  >(
    farmId
      ? getOfflineReferenceSummary(
          farmId,
        )
      : emptySummary(""),
  );
  const [
    operationalCounts,
    setOperationalCounts,
  ] = useState({
    ordens: farmId
      ? getCachedOrdensServico(
          farmId,
        ).length
      : 0,
    checklists: farmId
      ? getCachedChecklistTemplates(
          farmId,
        ).length
      : 0,
  });

  useEffect(() => {
    const refresh = () => {
      setSummary(
        farmId
          ? getOfflineReferenceSummary(
              farmId,
            )
          : emptySummary(""),
      );
      setOperationalCounts({
        ordens: farmId
          ? getCachedOrdensServico(
              farmId,
            ).length
          : 0,
        checklists: farmId
          ? getCachedChecklistTemplates(
              farmId,
            ).length
          : 0,
      });
    };

    refresh();

    window.addEventListener(
      OFFLINE_REFERENCE_STORE_EVENT,
      refresh,
    );
    window.addEventListener(
      OFFLINE_OPERATIONAL_STORE_EVENT,
      refresh,
    );

    return () => {
      window.removeEventListener(
        OFFLINE_REFERENCE_STORE_EVENT,
        refresh,
      );
      window.removeEventListener(
        OFFLINE_OPERATIONAL_STORE_EVENT,
        refresh,
      );
    };
  }, [farmId]);

  const modulesReady = useMemo(
    () =>
      hasOperationalModulesReady(),
    [isOffline],
  );

  if (!isOffline) {
    return null;
  }

  const ready =
    modulesReady &&
    summary.prontoParaOperacao;

  return (
    <div
      className={`border-b px-4 py-2 ${
        ready
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-amber-200 bg-amber-50 text-amber-900"
      }`}
      role="status"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 text-xs font-semibold">
        <div className="flex items-center gap-2">
          {ready ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <CloudOff className="h-4 w-4 shrink-0" />
          )}

          <span>
            {ready
              ? "Modo offline preparado para a operação de campo."
              : "Modo offline ativo. Alguns dados ainda podem depender de uma abertura online."}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide opacity-80">
          <Database className="h-3.5 w-3.5" />

          <span>
            {summary.talhoes} talhões ·{" "}
            {summary.ueis} UEIs ·{" "}
            {operationalCounts.ordens} OS ·{" "}
            {operationalCounts.checklists} checklists ·{" "}
            {summary.equipamentos} equipamentos ·{" "}
            {summary.produtos} insumos
          </span>
        </div>
      </div>
    </div>
  );
}
