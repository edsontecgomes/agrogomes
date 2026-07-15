import type {
  CoordenadaSimulada,
} from "./typesSimulacao";

type GerarCoordenadaParams = {
  centro:
    CoordenadaSimulada;

  deslocamentoMetrosNorte?: number;

  deslocamentoMetrosLeste?: number;

  accuracy?: number;
};

const METROS_POR_GRAU_LATITUDE =
  111_320;

export function gerarCoordenadaSimulada({
  centro,
  deslocamentoMetrosNorte = 0,
  deslocamentoMetrosLeste = 0,
  accuracy,
}: GerarCoordenadaParams): CoordenadaSimulada {
  const latitudeRad =
    (
      centro.lat *
      Math.PI
    ) / 180;

  const metrosPorGrauLongitude =
    METROS_POR_GRAU_LATITUDE *
    Math.cos(latitudeRad);

  const deslocamentoLatitude =
    deslocamentoMetrosNorte /
    METROS_POR_GRAU_LATITUDE;

  const deslocamentoLongitude =
    metrosPorGrauLongitude !== 0
      ? deslocamentoMetrosLeste /
        metrosPorGrauLongitude
      : 0;

  return {
    lat: Number(
      (
        centro.lat +
        deslocamentoLatitude
      ).toFixed(7),
    ),

    lng: Number(
      (
        centro.lng +
        deslocamentoLongitude
      ).toFixed(7),
    ),

    accuracy:
      accuracy ??
      centro.accuracy ??
      8,
  };
}