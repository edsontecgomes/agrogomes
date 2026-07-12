export type AmostraEstatistica = {
  id?: string;

  entidadeId?: string;

  fator: string;

  valor: number;

  unidade?: string;

  data?: string;

  grupo?: string;

  propriedades?: Record<string, unknown>;
};

export type ResumoEstatistico = {
  quantidade: number;

  soma: number;

  minimo: number;

  maximo: number;

  amplitude: number;

  media: number;

  mediana: number;

  primeiroQuartil: number;

  terceiroQuartil: number;

  variancia: number;

  desvioPadrao: number;

  coeficienteVariacao: number;
};

export type CorrelacaoEstatistica = {
  fatorX: string;

  fatorY: string;

  quantidadePares: number;

  coeficientePearson: number;

  intensidade:
    | "inexistente"
    | "muito_fraca"
    | "fraca"
    | "moderada"
    | "forte"
    | "muito_forte";

  direcao:
    | "positiva"
    | "negativa"
    | "neutra";

  confiabilidade: number;
};

export type RegressaoLinear = {
  fatorX: string;

  fatorY: string;

  quantidadePares: number;

  inclinacao: number;

  intercepto: number;

  rQuadrado: number;

  confiabilidade: number;
};

export type ComparacaoGruposEstatistica = {
  grupoA: string;

  grupoB: string;

  resumoA: ResumoEstatistico;

  resumoB: ResumoEstatistico;

  diferencaMedia: number;

  diferencaPercentual: number;

  tamanhoEfeito: number;

  significativaNaPratica: boolean;

  confiabilidade: number;
};

export type ResultadoMotorEstatistico = {
  fatorPrincipal: string;

  amostrasValidas: AmostraEstatistica[];

  amostrasDescartadas: number;

  resumo: ResumoEstatistico;

  correlacoes: CorrelacaoEstatistica[];

  regressoes: RegressaoLinear[];

  comparacoes: ComparacaoGruposEstatistica[];

  outlierIds: string[];

  confiabilidadeGeral: number;

  processadoEm: Date;
};