import type {
  ResultadoProcessamentoPersistido,
} from "../ciencia/processarESalvarEventoCientifico";

import type {
  ResultadoMotorAprendizagem,
} from "../motorAprendizagem/types";

import type {
  ResultadoConhecimentoPersistido,
} from "../motorConhecimento/processarESalvarConhecimento";

import type {
  ResultadoEstatisticoEventos,
} from "../motorEstatistico/processarEventosAgronomicos";

import type {
  ResultadoRecomendacoesPersistidas,
} from "../motorRecomendacao/processarESalvarRecomendacoes";

export type ResultadoEstatisticoOrquestrado = {
  resultadoId: string;

  resultado:
    ResultadoEstatisticoEventos;
};

export type ResultadoAprendizagemOrquestrado = {
  aprendizadoIds: string[];

  resultado:
    ResultadoMotorAprendizagem;
};

export type ResultadosMotoresOrquestrados = {
  cientifico?:
    ResultadoProcessamentoPersistido;

  estatistico?:
    ResultadoEstatisticoOrquestrado;

  aprendizagem?:
    ResultadoAprendizagemOrquestrado;

  conhecimento?:
    ResultadoConhecimentoPersistido;

  recomendacao?:
    ResultadoRecomendacoesPersistidas;
};