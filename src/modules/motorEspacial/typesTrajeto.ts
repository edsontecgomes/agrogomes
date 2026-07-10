import {
  CoordenadaEspacial,
  UEIEspacial,
} from "./types";

export type PontoTrajetoEspacial = CoordenadaEspacial & {
  timestamp?: string;
};

export type ResultadoResolucaoTrajeto = {
  ueiIds: string[];

  ueis: UEIEspacial[];

  totalPontosRecebidos: number;

  totalPontosValidos: number;

  totalUEIsPercorridas: number;

  metodo:
    | "intersecao_trajeto"
    | "ponto_unico"
    | "trajeto_invalido"
    | "nenhuma_uei";

  confiabilidade: number;

  observacoes: string[];
};