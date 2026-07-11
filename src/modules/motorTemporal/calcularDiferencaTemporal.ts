import { normalizarDataISO } from "./normalizarDataISO";

export type DiferencaTemporal = {
  milissegundos: number;

  segundos: number;

  minutos: number;

  horas: number;

  dias: number;
};

export function calcularDiferencaTemporal(
  dataInicial: string | Date | number,
  dataFinal: string | Date | number,
): DiferencaTemporal {
  const inicio = normalizarDataISO(dataInicial);
  const fim = normalizarDataISO(dataFinal);

  const milissegundos = Math.max(
    0,
    fim.timestampMs - inicio.timestampMs,
  );

  const segundos =
    milissegundos / 1000;

  const minutos =
    segundos / 60;

  const horas =
    minutos / 60;

  const dias =
    horas / 24;

  return {
    milissegundos: Number(
      milissegundos.toFixed(0),
    ),

    segundos: Number(
      segundos.toFixed(2),
    ),

    minutos: Number(
      minutos.toFixed(2),
    ),

    horas: Number(
      horas.toFixed(2),
    ),

    dias: Number(
      dias.toFixed(2),
    ),
  };
}