import { calcularIntersecaoCoberturaUEI } from "./calcularIntersecaoCoberturaUEI";
import {
  CoberturaOperacionalUEI,
  FaixaOperacionalGeografica,
} from "./typesCobertura";
import { UEIEspacial } from "./types";

export function calcularCoberturaUEI(
  faixaOperacional: FaixaOperacionalGeografica,
  uei: UEIEspacial,
): CoberturaOperacionalUEI {
  const { areaCobertaM2 } =
    calcularIntersecaoCoberturaUEI(
      faixaOperacional,
      uei,
    );

  const areaTotalM2 =
    Math.max(0, uei.areaHa * 10_000);

  const areaCobertaLimitadaM2 =
    Math.min(
      areaCobertaM2,
      areaTotalM2,
    );

  const percentualCobertura =
    areaTotalM2 > 0
      ? (areaCobertaLimitadaM2 /
          areaTotalM2) *
        100
      : 0;

  const areaCobertaHa =
    areaCobertaLimitadaM2 / 10_000;

  const areaRestanteHa = Math.max(
    0,
    uei.areaHa - areaCobertaHa,
  );

  return {
    ueiId: uei.id,
    farmId: uei.farmId,
    talhaoId: uei.talhaoId,

    areaTotalUEIHa: Number(
      uei.areaHa.toFixed(4),
    ),

    areaCobertaHa: Number(
      areaCobertaHa.toFixed(4),
    ),

    areaRestanteHa: Number(
      areaRestanteHa.toFixed(4),
    ),

    percentualCobertura: Number(
      percentualCobertura.toFixed(2),
    ),

    atingida: areaCobertaM2 > 0,
  };
}