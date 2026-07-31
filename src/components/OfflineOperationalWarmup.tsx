import {
  useCallback,
  useEffect,
} from "react";

import {
  useChecklistTemplates,
} from "../hooks/useChecklists";
import {
  useEquipamentos,
} from "../hooks/useEquipamentos";
import {
  useProdutosEstoque,
} from "../hooks/useProdutosEstoque";
import {
  useOrdensServico,
} from "../hooks/useServicos";
import {
  useTalhoes,
} from "../hooks/useTalhoes";
import {
  buscarUEIsDaFazenda,
} from "../modules/motorEspacial/buscarUEIsDaFazenda";

interface OfflineOperationalWarmupProps {
  farmId: string | null;
}

export function OfflineOperationalWarmup({
  farmId,
}: OfflineOperationalWarmupProps) {
  useTalhoes(farmId);
  useEquipamentos(farmId);
  useProdutosEstoque(farmId);
  useOrdensServico(farmId);
  useChecklistTemplates(farmId);

  const refreshUEIs = useCallback(() => {
    if (
      !farmId ||
      !navigator.onLine
    ) {
      return;
    }

    void buscarUEIsDaFazenda(
      farmId,
    ).catch((error) => {
      console.error(
        "Não foi possível preparar as UEIs para uso offline.",
        error,
      );
    });
  }, [farmId]);

  useEffect(() => {
    refreshUEIs();

    window.addEventListener(
      "online",
      refreshUEIs,
    );

    return () => {
      window.removeEventListener(
        "online",
        refreshUEIs,
      );
    };
  }, [refreshUEIs]);

  return null;
}
