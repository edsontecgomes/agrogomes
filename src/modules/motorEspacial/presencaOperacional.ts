import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point, polygon } from "@turf/helpers";

import type { Talhao } from "../../types";
import { GPS_PRECISAO_MAXIMA_METROS } from "../../utils/geoUtils";
import type { UEIEspacial } from "./types";

export type EstadoPresencaOperacional = {
  status: "fora" | "dentro" | "gps_impreciso";
  precisaoMetros: number;
  talhaoId?: string;
  talhaoNome?: string;
  ueiId?: string;
  ueiCodigo?: string;
};

function contem(
  coordenada: { lat: number; lng: number },
  anel: Array<{ lat: number; lng: number }> | undefined,
) {
  if (!anel || anel.length < 3) return false;
  const fechado = [...anel];
  const primeiro = fechado[0];
  const ultimo = fechado[fechado.length - 1];
  if (primeiro.lat !== ultimo.lat || primeiro.lng !== ultimo.lng) {
    fechado.push(primeiro);
  }
  try {
    return booleanPointInPolygon(
      point([coordenada.lng, coordenada.lat]),
      polygon([fechado.map((ponto) => [ponto.lng, ponto.lat])]),
    );
  } catch {
    return false;
  }
}

export function resolverPresencaOperacional(
  coordenada: { lat: number; lng: number; accuracy?: number },
  talhoes: Talhao[],
  ueis: UEIEspacial[],
  precisaoMaxima = GPS_PRECISAO_MAXIMA_METROS,
): EstadoPresencaOperacional {
  const precisao = Number.isFinite(coordenada.accuracy)
    ? Math.max(0, coordenada.accuracy ?? 0)
    : Number.POSITIVE_INFINITY;
  if (precisao > precisaoMaxima) {
    return { status: "gps_impreciso", precisaoMetros: precisao };
  }

  const talhao = talhoes.find((item) =>
    contem(
      coordenada,
      item.limiteAtivacaoOperacional ??
        item.limiteOperacional ??
        item.coordenadas,
    ),
  );
  if (!talhao) {
    return { status: "fora", precisaoMetros: precisao };
  }

  const uei = ueis.find(
    (item) =>
      item.talhaoId === talhao.id && contem(coordenada, item.geometria),
  );
  return {
    status: "dentro",
    precisaoMetros: precisao,
    talhaoId: talhao.id,
    talhaoNome: talhao.nome,
    ueiId: uei?.id,
    ueiCodigo: uei?.codigo ?? uei?.nome,
  };
}
