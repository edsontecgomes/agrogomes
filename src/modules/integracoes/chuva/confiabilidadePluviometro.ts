import {
  calcularConfiabilidadeChuva,
  classificarConfiabilidadeChuva,
} from "../../uei/motor/confiabilidadeChuva";

export function calcularPesoPluviometroParaHectare(distanciaMetros: number) {
  return {
    distanciaMetros,
    peso: calcularConfiabilidadeChuva(distanciaMetros),
    classificacao: classificarConfiabilidadeChuva(distanciaMetros),
  };
}