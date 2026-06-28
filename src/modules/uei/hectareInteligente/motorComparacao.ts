import { ItemRankingSemelhanca, obterTopHectaresSemelhantes } from "./rankingSemelhanca";

export type ResultadoMotorComparacao = {
  hectareReferencia: string;
  semelhantes: ItemRankingSemelhanca[];
};

export function executarMotorComparacao(
  hectareReferencia: string,
  ranking: ItemRankingSemelhanca[],
  limite = 10,
): ResultadoMotorComparacao {
  return {
    hectareReferencia,
    semelhantes: obterTopHectaresSemelhantes(ranking, limite),
  };
}