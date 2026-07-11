import type { Feature, MultiPolygon, Polygon } from "geojson";

import { UEIEspacial } from "./types";

export type FaixaOperacionalGeografica = Feature<
  Polygon | MultiPolygon
>;

export type CoberturaOperacionalUEI = {
  ueiId: string;

  farmId: string;

  talhaoId: string;

  areaTotalUEIHa: number;

  areaCobertaHa: number;

  areaRestanteHa: number;

  percentualCobertura: number;

  atingida: boolean;
};

export type ResultadoCoberturaOperacional = {
  ueiIds: string[];

  ueis: UEIEspacial[];

  coberturas: CoberturaOperacionalUEI[];

  larguraOperacionalMetros: number;

  areaTotalCobertaHa: number;

  percentualMedioCobertura: number;

  totalUEIsAtingidas: number;

  totalPontosTrajeto: number;

  confiabilidade: number;

  metodo:
    | "buffer_trajeto"
    | "ponto_unico"
    | "trajeto_invalido"
    | "largura_invalida"
    | "nenhuma_uei";

  observacoes: string[];
};