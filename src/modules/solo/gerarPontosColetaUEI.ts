import {
  bbox,
  booleanPointInPolygon,
  buffer,
  centerOfMass,
  point,
  pointOnFeature,
  polygon,
} from "@turf/turf";

import type { UEIEspacial } from "../motorEspacial/types";
import type { PontoColetaSolo } from "./types";

const ALVOS = [
  [0.5, 0.5],
  [0.25, 0.75],
  [0.75, 0.75],
  [0.25, 0.25],
  [0.75, 0.25],
] as const;

export function gerarPontosColetaUEI(
  uei: UEIEspacial,
  margemSegurancaMetros = 5,
  raioOperacionalMetros = 4,
): PontoColetaSolo[] {
  if (uei.geometria.length < 3) return [];
  const anel = uei.geometria.map(({ lat, lng }) => [lng, lat]);
  if (
    anel[0][0] !== anel[anel.length - 1][0] ||
    anel[0][1] !== anel[anel.length - 1][1]
  ) {
    anel.push(anel[0]);
  }
  const original = polygon([anel]);
  const reduzido = buffer(original, -margemSegurancaMetros, {
    units: "meters",
  });
  const areaSegura = reduzido ?? original;
  const limites = bbox(areaSegura);
  const centroCalculado = centerOfMass(areaSegura);
  const referencia = booleanPointInPolygon(centroCalculado, areaSegura)
    ? centroCalculado
    : pointOnFeature(areaSegura);
  const [cx, cy] = referencia.geometry.coordinates;
  const codigoBase = uei.codigo ?? uei.nome ?? uei.id;

  return ALVOS.map(([fx, fy], indice) => {
    const alvo = [
      limites[0] + (limites[2] - limites[0]) * fx,
      limites[1] + (limites[3] - limites[1]) * fy,
    ];
    let escolhido = point(alvo);
    if (!booleanPointInPolygon(escolhido, areaSegura)) {
      for (let passo = 1; passo <= 30; passo += 1) {
        const t = passo / 30;
        const candidato = point([
          alvo[0] + (cx - alvo[0]) * t,
          alvo[1] + (cy - alvo[1]) * t,
        ]);
        if (booleanPointInPolygon(candidato, areaSegura)) {
          escolhido = candidato;
          break;
        }
      }
    }
    const ordem = (indice + 1) as 1 | 2 | 3 | 4 | 5;
    const codigo = `${codigoBase}-P${String(ordem).padStart(2, "0")}`;
    return {
      id: `${uei.id}__P${String(ordem).padStart(2, "0")}`,
      codigo,
      producerId: uei.producerId,
      farmId: uei.farmId,
      talhaoId: uei.talhaoId,
      ueiId: uei.id,
      ueiCodigo: codigoBase,
      ordem,
      principal: ordem === 1,
      coordenadaPlanejada: {
        lng: escolhido.geometry.coordinates[0],
        lat: escolhido.geometry.coordinates[1],
      },
      raioOperacionalMetros,
    };
  });
}
