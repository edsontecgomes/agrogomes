import area from "@turf/area";
import centroid from "@turf/centroid";
import nearestPointOnLine from "@turf/nearest-point-on-line";
import union from "@turf/union";
import type {
  Feature,
  MultiPolygon,
  Polygon,
} from "geojson";

import {
  converterPoligonoParaCoordenadas,
  criarPoligonoTurf,
} from "../polygon";
import type {
  CoordenadaGeografica,
} from "../centroide";
import type {
  CelulaGridGeografico,
} from "./gerarGridGeograficoBasico";

export const AREA_ALVO_UEI_BORDADURA_HA =
  0.3;

type CelulaOrdenada = {
  celula: CelulaGridGeografico;
  poligono: Feature<Polygon>;
  areaM2: number;
  posicaoPerimetroKm: number;
};

function criarLinhaPerimetro(
  coordenadas: CoordenadaGeografica[],
) {
  const primeiro =
    coordenadas[0];

  return {
    type: "Feature" as const,
    properties: {},
    geometry: {
      type: "LineString" as const,
      coordinates: [
        ...coordenadas.map(
          ({ lat, lng }) => [
            lng,
            lat,
          ],
        ),
        [
          primeiro.lng,
          primeiro.lat,
        ],
      ],
    },
  };
}

function separarPoligonos(
  feature: Feature<
    Polygon | MultiPolygon
  >,
): Feature<Polygon>[] {
  if (
    feature.geometry.type ===
    "Polygon"
  ) {
    return [
      feature as Feature<Polygon>,
    ];
  }

  return feature.geometry.coordinates.map(
    (coordinates) => ({
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates,
      },
    }),
  );
}

function ordenarPeloPerimetro(
  celulas: CelulaGridGeografico[],
  coordenadasTalhao:
    CoordenadaGeografica[],
): CelulaOrdenada[] {
  const linhaPerimetro =
    criarLinhaPerimetro(
      coordenadasTalhao,
    );

  return celulas
    .map((celula) => {
      const poligono =
        criarPoligonoTurf(
          celula.geometria,
        );
      const centro =
        centroid(poligono);
      const pontoMaisProximo =
        nearestPointOnLine(
          linhaPerimetro,
          centro,
          {
            units: "kilometers",
          },
        );

      return {
        celula,
        poligono,
        areaM2: area(poligono),
        posicaoPerimetroKm:
          pontoMaisProximo
            .properties.location ??
          0,
      };
    })
    .sort(
      (a, b) =>
        a.posicaoPerimetroKm -
        b.posicaoPerimetroKm,
    );
}

function dividirEmGruposEquilibrados(
  celulas: CelulaOrdenada[],
  areaAlvoM2: number,
): CelulaOrdenada[][] {
  const areaTotalM2 =
    celulas.reduce(
      (total, item) =>
        total + item.areaM2,
      0,
    );

  const quantidadeCalculada =
    Math.max(
      1,
      Math.round(
        areaTotalM2 /
          areaAlvoM2,
      ),
    );

  // Uma faixa fechada reunida em uma única geometria
  // contém um furo. O contrato atual da UEI persiste
  // somente um anel, portanto mantemos ao menos dois
  // segmentos quando existem vários recortes.
  const quantidadeGrupos =
    celulas.length > 1
      ? Math.min(
          celulas.length,
          Math.max(
            2,
            quantidadeCalculada,
          ),
        )
      : 1;

  const grupos:
    CelulaOrdenada[][] = [];
  let indice = 0;
  let areaRestanteM2 =
    areaTotalM2;

  while (
    grupos.length <
    quantidadeGrupos
  ) {
    const gruposRestantes =
      quantidadeGrupos -
      grupos.length;
    const alvoAtualM2 =
      areaRestanteM2 /
      gruposRestantes;
    const grupo:
      CelulaOrdenada[] = [];
    let areaGrupoM2 = 0;

    while (
      indice < celulas.length
    ) {
      const itensRestantes =
        celulas.length -
        indice;

      if (
        itensRestantes <=
        gruposRestantes - 1
      ) {
        break;
      }

      const proxima =
        celulas[indice];
      const distanciaAtual =
        Math.abs(
          areaGrupoM2 -
            alvoAtualM2,
        );
      const distanciaComProxima =
        Math.abs(
          areaGrupoM2 +
            proxima.areaM2 -
            alvoAtualM2,
        );

      if (
        grupo.length > 0 &&
        distanciaComProxima >
          distanciaAtual
      ) {
        break;
      }

      grupo.push(proxima);
      areaGrupoM2 +=
        proxima.areaM2;
      indice += 1;
    }

    if (
      grupo.length === 0 &&
      indice < celulas.length
    ) {
      const proxima =
        celulas[indice];
      grupo.push(proxima);
      areaGrupoM2 +=
        proxima.areaM2;
      indice += 1;
    }

    grupos.push(grupo);
    areaRestanteM2 -=
      areaGrupoM2;
  }

  while (
    indice < celulas.length
  ) {
    grupos[
      grupos.length - 1
    ].push(celulas[indice]);
    indice += 1;
  }

  return grupos;
}

function unirGrupo(
  grupo: CelulaOrdenada[],
): Feature<
  Polygon | MultiPolygon
> {
  if (grupo.length === 1) {
    return grupo[0].poligono;
  }

  const geometriaUnida =
    union({
      type: "FeatureCollection",
      features: grupo.map(
        ({ poligono }) =>
          poligono,
      ),
    });

  if (!geometriaUnida) {
    throw new Error(
      "Não foi possível consolidar as células da bordadura.",
    );
  }

  return geometriaUnida;
}

export type AgruparCelulasBordaduraParams = {
  talhaoId: string;
  coordenadasTalhao:
    CoordenadaGeografica[];
  celulas: CelulaGridGeografico[];
  areaAlvoHa?: number;
};

/**
 * Consolida os pequenos recortes da faixa de bordadura
 * em segmentos contíguos próximos da área desejada.
 *
 * A operação não aumenta a largura da faixa e não altera
 * sua área total: apenas muda a forma de agrupamento das
 * UEIs usadas para coleta e análise.
 */
export function agruparCelulasBordadura({
  talhaoId,
  coordenadasTalhao,
  celulas,
  areaAlvoHa =
    AREA_ALVO_UEI_BORDADURA_HA,
}: AgruparCelulasBordaduraParams): CelulaGridGeografico[] {
  if (celulas.length === 0) {
    return [];
  }

  if (
    !Number.isFinite(areaAlvoHa) ||
    areaAlvoHa <= 0
  ) {
    throw new Error(
      "A área-alvo da UEI de bordadura deve ser maior que zero.",
    );
  }

  const ordenadas =
    ordenarPeloPerimetro(
      celulas,
      coordenadasTalhao,
    );
  const grupos =
    dividirEmGruposEquilibrados(
      ordenadas,
      areaAlvoHa * 10_000,
    );

  const poligonos =
    grupos.flatMap((grupo) =>
      separarPoligonos(
        unirGrupo(grupo),
      ),
    );

  return poligonos.map(
    (poligono, indice) => {
      const areaM2 =
        area(poligono);
      const centro =
        centroid(poligono);
      const [lng, lat] =
        centro.geometry
          .coordinates;

      return {
        id: [
          talhaoId,
          "BORDA",
          String(
            indice + 1,
          ).padStart(5, "0"),
        ].join("-"),
        numero: indice + 1,
        areaHa: Number(
          (
            areaM2 / 10_000
          ).toFixed(4),
        ),
        centroide: {
          lat,
          lng,
        },
        geometria:
          converterPoligonoParaCoordenadas(
            poligono,
          ),
        origem:
          "grid_geografico",
        zonaTalhao:
          "faixa_avaliacao_bordadura",
      };
    },
  );
}
