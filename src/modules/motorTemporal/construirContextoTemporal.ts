import { calcularDiasAposPlantio } from "./calcularDiasAposPlantio";
import { calcularSemanaAno } from "./calcularSemanaAno";
import { identificarAnoAgricola } from "./identificarAnoAgricola";
import { normalizarDataISO } from "./normalizarDataISO";
import {
  ContextoTemporal,
  OrigemTemporal,
  PrecisaoTemporal,
} from "./types";

type ConstruirContextoTemporalParams = {
  dataEvento?: string;

  dataPlantio?: string;

  safraId?: string;

  cultura?: string;

  origem?: OrigemTemporal;

  precisao?: PrecisaoTemporal;

  diasDesdeEventoAnterior?: number;
};

export function construirContextoTemporal({
  dataEvento,
  dataPlantio,
  safraId,
  cultura,
  origem = "evento",
  precisao = "exata",
  diasDesdeEventoAnterior,
}: ConstruirContextoTemporalParams): ContextoTemporal {
  const normalizacao =
    normalizarDataISO(dataEvento);

  const data = new Date(
    normalizacao.dataISO,
  );

  return {
    dataEventoISO:
      normalizacao.dataISO,

    timestampMs:
      normalizacao.timestampMs,

    ano:
      data.getUTCFullYear(),

    mes:
      data.getUTCMonth() + 1,

    dia:
      data.getUTCDate(),

    hora:
      data.getUTCHours(),

    minuto:
      data.getUTCMinutes(),

    diaSemana:
      data.getUTCDay(),

    semanaAno:
      calcularSemanaAno(data),

    anoAgricola:
      identificarAnoAgricola(data),

    safraId,

    cultura,

    diasAposPlantio:
      calcularDiasAposPlantio(
        dataPlantio,
        normalizacao.dataISO,
      ),

    diasDesdeEventoAnterior,

    precisao,

    origem,

    dataValida:
      normalizacao.valida,

    observacoes: [
      ...normalizacao.observacoes,
    ],
  };
}