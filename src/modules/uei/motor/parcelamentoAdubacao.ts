import { ParcelaAdubacao } from "./adubacao";

export function contarParcelasAdubacao(parcelas: ParcelaAdubacao[]) {
  return parcelas.length;
}

export function classificarParcelamentoAdubacao(parcelas: ParcelaAdubacao[]) {
  if (parcelas.length <= 1) return "unica";
  if (parcelas.length === 2) return "duas_parcelas";
  if (parcelas.length === 3) return "tres_parcelas";

  return "multiplas_parcelas";
}