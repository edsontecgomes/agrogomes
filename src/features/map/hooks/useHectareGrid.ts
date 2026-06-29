import { useMemo } from "react";

import { Talhao } from "../types/map.types";
import { generateHectareGrid } from "../services/hectareGrid.service";

export function useHectareGrid(talhoes: Talhao[]) {
  return useMemo(() => {
    if (!talhoes || talhoes.length === 0) {
      return [];
    }

    return talhoes.flatMap((talhao) => generateHectareGrid(talhao));
  }, [talhoes]);
}