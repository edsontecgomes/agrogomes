export type FatorProdutivo =
  | "chuva_volume"
  | "chuva_distribuicao"
  | "ordem_servico"
  | "produto_utilizado"
  | "implemento"
  | "compactacao"
  | "populacao_plantas"
  | "solo"
  | "telemetria";

export function fatorMoveMotor(fator: string) {
  return !["operador"].includes(fator);
}