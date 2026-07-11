export type IdCientifico = string;

export type NivelConfiabilidade =
  | "muito_baixo"
  | "baixo"
  | "medio"
  | "alto"
  | "muito_alto";

export type TipoEntidade =
  | "produtor"
  | "fazenda"
  | "talhao"
  | "hectare"
  | "uei"
  | "gda"
  | "safra"
  | "manejo"
  | "chuva"
  | "solo"
  | "genetica"
  | "operacao"
  | "produto"
  | "equipamento"
  | "produtividade"
  | "evento";

export type TipoEvento =
  | "coleta"
  | "aplicacao"
  | "colheita"
  | "clima"
  | "analise"
  | "chuva"
  | "plantio"
  | "adubacao"
  | "pulverizacao"
  | "manejo"
  | "execucao_ordem"
  | "uso_produto"
  | "observacao"
  | "solo"
  | "telemetria";

export type TipoRelacaoCientifica =
  | "pertence_a"
  | "ocorreu_em"
  | "afetou"
  | "originou"
  | "utilizou"
  | "executado_por"
  | "associado_a"
  | "evidencia_de"
  | "precede"
  | "sucede"
  | "correlacionado_com";

export type FonteDadoCientifico =
  | "evento_agronomico"
  | "timeline"
  | "sensor"
  | "operador"
  | "sistema"
  | "importacao"
  | "motor_cientifico";