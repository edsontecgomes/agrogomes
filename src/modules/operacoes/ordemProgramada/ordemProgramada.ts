export type StatusOrdemProgramada =
  | "programada"
  | "em_execucao"
  | "parcial"
  | "finalizada"
  | "cancelada";

export type OrdemProgramada = {
  id: string;
  farmId: string;
  talhaoId: string;
  safra: string;
  tipoOperacao: "plantio" | "pulverizacao" | "adubacao" | "colheita" | "outro";
  status: StatusOrdemProgramada;
  cultivar?: string;
  loteSemente?: string;
  sementesPorMetro?: number;
  produtosPlanejados?: string[];
  implementoPlanejado?: string;
  larguraOperacionalMetros?: number;
};

export function ordemProgramadaPodeExecutar(ordem: OrdemProgramada) {
  return ordem.status === "programada" || ordem.status === "parcial";
}