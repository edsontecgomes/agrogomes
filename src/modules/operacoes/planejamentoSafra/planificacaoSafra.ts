export type PlanificacaoSafra = {
  id: string;
  farmId: string;
  safra: string;
  cultura: "milho" | "soja" | "algodao";
  talhaoId: string;
  cultivar?: string;
  loteSemente?: string;
  sementesPorMetro?: number;
  populacaoAlvoHa?: number;
  observacoes?: string;
};

export function planificacaoTemBaseMinima(planificacao: PlanificacaoSafra) {
  return Boolean(
    planificacao.farmId &&
      planificacao.safra &&
      planificacao.cultura &&
      planificacao.talhaoId,
  );
}