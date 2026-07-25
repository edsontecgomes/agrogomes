import area from "@turf/area";
import bbox from "@turf/bbox";
import buffer from "@turf/buffer";
import centroid from "@turf/centroid";
import difference from "@turf/difference";
import intersect from "@turf/intersect";
import squareGrid from "@turf/square-grid";
import tesselate from "@turf/tesselate";
import type {
  Feature,
  MultiPolygon,
  Polygon,
} from "geojson";

import type {
  UeiZonaTalhao,
} from "../../uei/types";
import type {
  CoordenadaGeografica,
} from "../centroide";
import {
  converterPoligonoParaCoordenadas,
  criarPoligonoTurf,
} from "../polygon";
import type {
  CelulaGridGeografico,
} from "./gerarGridGeograficoBasico";
import {
  agruparCelulasBordadura,
  AREA_ALVO_UEI_BORDADURA_HA,
} from "./agruparCelulasBordadura";

type PoligonoOuMultiPoligono =
  Feature<Polygon | MultiPolygon>;

export type GerarGridGeograficoZonadoParams = {
  talhaoId: string;
  coordenadasTalhao: CoordenadaGeografica[];
  limiteNucleoProdutivo: CoordenadaGeografica[];
  areaAlvoHa?: number;
  areaAlvoBordaduraHa?: number;
  areaMinimaNucleoHa?: number;
  areaMinimaBordaduraHa?: number;
};

type ZonaGrid = {
  geometria: PoligonoOuMultiPoligono;
  zonaTalhao: UeiZonaTalhao;
  prefixoId: "BORDA" | "NUCLEO";
  areaMinimaM2: number;
};

function criarFeaturePoligono(
  geometry: Polygon,
): Feature<Polygon> {
  return {
    type: "Feature",
    properties: {},
    geometry,
  };
}

function separarMultiPoligono(
  feature:
    PoligonoOuMultiPoligono,
): Feature<Polygon>[] {
  if (
    feature.geometry.type ===
    "Polygon"
  ) {
    return [
      criarFeaturePoligono(
        feature.geometry,
      ),
    ];
  }

  return feature.geometry.coordinates.map(
    (coordinates) =>
      criarFeaturePoligono({
        type: "Polygon",
        coordinates,
      }),
  );
}

/**
 * O modelo atual de UEI persiste um único anel externo.
 * Quando um recorte contém furos, ele é triangulado para
 * impedir que a geometria salva invada a zona vizinha.
 */
function removerFuros(
  feature: Feature<Polygon>,
): Feature<Polygon>[] {
  if (
    feature.geometry.coordinates.length <=
    1
  ) {
    return [feature];
  }

  return tesselate(
    feature,
  ).features;
}

function decomporRecorte(
  recorte:
    | PoligonoOuMultiPoligono
    | null,
): Feature<Polygon>[] {
  if (!recorte) {
    return [];
  }

  return separarMultiPoligono(
    recorte,
  ).flatMap(removerFuros);
}

function validarParametros(
  params:
    GerarGridGeograficoZonadoParams,
) {
  if (
    !params.talhaoId.trim()
  ) {
    throw new Error(
      "Não foi possível gerar o grid zonado: talhaoId não informado.",
    );
  }

  if (
    params.coordenadasTalhao.length <
      3 ||
    params.limiteNucleoProdutivo
      .length < 3
  ) {
    throw new Error(
      "Não foi possível gerar o grid zonado: limites do talhão inválidos.",
    );
  }
}

export function gerarGridGeograficoZonado({
  talhaoId,
  coordenadasTalhao,
  limiteNucleoProdutivo,
  areaAlvoHa = 1,
  areaAlvoBordaduraHa =
    AREA_ALVO_UEI_BORDADURA_HA,
  areaMinimaNucleoHa = 0.01,
  areaMinimaBordaduraHa = 0.001,
}: GerarGridGeograficoZonadoParams): CelulaGridGeografico[] {
  validarParametros({
    talhaoId,
    coordenadasTalhao,
    limiteNucleoProdutivo,
    areaAlvoHa,
    areaAlvoBordaduraHa,
    areaMinimaNucleoHa,
    areaMinimaBordaduraHa,
  });

  const poligonoTalhao =
    criarPoligonoTurf(
      coordenadasTalhao,
    );

  const poligonoNucleo =
    criarPoligonoTurf(
      limiteNucleoProdutivo,
    );

  const faixaBordadura =
    difference({
      type: "FeatureCollection",
      features: [
        poligonoTalhao,
        poligonoNucleo,
      ],
    });

  if (!faixaBordadura) {
    throw new Error(
      "Não foi possível separar a bordadura agronômica do núcleo produtivo.",
    );
  }

  const ladoKm =
    Math.sqrt(
      areaAlvoHa * 10_000,
    ) / 1000;

  const areaComMargem =
    buffer(
      poligonoTalhao,
      ladoKm,
      {
        units: "kilometers",
      },
    );

  const grade = squareGrid(
    bbox(
      areaComMargem ??
        poligonoTalhao,
    ),
    ladoKm,
    {
      units: "kilometers",
    },
  );

  const zonas: ZonaGrid[] = [
    {
      geometria:
        faixaBordadura,
      zonaTalhao:
        "faixa_avaliacao_bordadura",
      prefixoId: "BORDA",
      areaMinimaM2:
        areaMinimaBordaduraHa *
        10_000,
    },
    {
      geometria:
        poligonoNucleo,
      zonaTalhao:
        "nucleo_produtivo",
      prefixoId: "NUCLEO",
      areaMinimaM2:
        areaMinimaNucleoHa *
        10_000,
    },
  ];

  const celulas:
    CelulaGridGeografico[] = [];
  const quantidadePorZona = {
    BORDA: 0,
    NUCLEO: 0,
  };

  zonas.forEach((zona) => {
    grade.features.forEach(
      (celulaGrade) => {
        const recorte = intersect({
          type: "FeatureCollection",
          features: [
            zona.geometria,
            celulaGrade,
          ],
        });

        decomporRecorte(
          recorte,
        ).forEach((poligono) => {
          const areaCelulaM2 =
            area(poligono);

          if (
            areaCelulaM2 <
            zona.areaMinimaM2
          ) {
            return;
          }

          const centro =
            centroid(poligono);
          const [lng, lat] =
            centro.geometry
              .coordinates;

          quantidadePorZona[
            zona.prefixoId
          ] += 1;

          const numeroZona =
            quantidadePorZona[
              zona.prefixoId
            ];

          celulas.push({
            id: [
              talhaoId,
              zona.prefixoId,
              String(
                numeroZona,
              ).padStart(5, "0"),
            ].join("-"),
            numero:
              celulas.length + 1,
            areaHa: Number(
              (
                areaCelulaM2 /
                10_000
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
              zona.zonaTalhao,
          });
        });
      },
    );
  });

  const celulasBordadura =
    agruparCelulasBordadura({
      talhaoId,
      coordenadasTalhao,
      areaAlvoHa:
        areaAlvoBordaduraHa,
      celulas: celulas.filter(
        (celula) =>
          celula.zonaTalhao ===
          "faixa_avaliacao_bordadura",
      ),
    });

  const celulasNucleo =
    celulas.filter(
      (celula) =>
        celula.zonaTalhao ===
        "nucleo_produtivo",
    );

  return [
    ...celulasBordadura,
    ...celulasNucleo,
  ].map((celula, indice) => ({
    ...celula,
    numero: indice + 1,
  }));
}
