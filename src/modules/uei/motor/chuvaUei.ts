import { calcularConfiabilidadeChuva } from "./confiabilidadeChuva";

export type RegistroChuvaUei = {
  ueiId: string;
  pluviometroId: string;
  volumeMm: number;
  distanciaPluviometroMetros: number;
  confiabilidade: number;
  data: string;
};

export function criarRegistroChuvaUei(params: Omit<RegistroChuvaUei, "confiabilidade">) {
  return {
    ...params,
    confiabilidade: calcularConfiabilidadeChuva(params.distanciaPluviometroMetros),
  };
}