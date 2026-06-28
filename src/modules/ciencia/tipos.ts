export type IdCientifico = string;

export type NivelConfiabilidade =
  | "muito_baixo"
  | "baixo"
  | "medio"
  | "alto"
  | "muito_alto";

export type TipoEntidade =
  | "hectare"
  | "safra"
  | "manejo"
  | "chuva"
  | "solo"
  | "genetica"
  | "operacao"
  | "produtividade";

export type TipoEvento =
  | "coleta"
  | "aplicacao"
  | "colheita"
  | "clima"
  | "analise";