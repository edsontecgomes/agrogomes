import type {
  EntradaOrquestradorAgronomico,
  ResultadoOrquestradorAgronomico,
} from "./types";

export type TipoEventoSimulado =
  | "plantio"
  | "chuva"
  | "adubacao"
  | "pulverizacao"
  | "colheita"
  | "observacao";

export type CoordenadaSimulada = {
  lat: number;

  lng: number;

  accuracy?: number;
};

export type ConfiguracaoCenarioPiloto = {
  producerId: string;

  farmId: string;

  talhaoId: string;

  responsavelId: string;

  safraId: string;

  cultura: string;

  cultivar: string;

  dataPlantio: string;

  coordenadaCentral: CoordenadaSimulada;

  populacaoPlantasHa?: number;

  sementesPorMetro?: number;

  larguraOperacionalMetros?: number;

  produtividadeEsperadaScHa?: number;

  processarEstatistica?: boolean;

  processarAprendizado?: boolean;

  processarConhecimento?: boolean;

  processarRecomendacao?: boolean;
};

export type EventoSimuladoPiloto = {
  idLocal: string;

  ordem: number;

  tipo: TipoEventoSimulado;

  descricao: string;

  entrada:
    EntradaOrquestradorAgronomico;
};

export type ResultadoEventoSimulado = {
  idLocal: string;

  ordem: number;

  tipo: TipoEventoSimulado;

  descricao: string;

  sucesso: boolean;

  processamento:
    ResultadoOrquestradorAgronomico;
};

export type ResultadoCenarioPiloto = {
  cenarioId: string;

  configuracao:
    ConfiguracaoCenarioPiloto;

  totalEventos: number;

  totalSucessos: number;

  totalComAlertas: number;

  totalFalhas: number;

  resultados:
    ResultadoEventoSimulado[];

  iniciadoEm: string;

  finalizadoEm: string;

  duracaoTotalMs: number;
};