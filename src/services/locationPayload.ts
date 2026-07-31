import type { Location } from "../types";

export function normalizarLocalizacaoFirestore(
  location: Location,
): Location {
  const localizacaoNormalizada: Location = {
    lat: location.lat,
    lng: location.lng,
  };

  if (
    Number.isFinite(
      location.accuracy,
    )
  ) {
    localizacaoNormalizada.accuracy =
      location.accuracy;
  }

  if (
    Number.isFinite(
      location.altitude,
    )
  ) {
    localizacaoNormalizada.altitude =
      location.altitude;
  }

  return localizacaoNormalizada;
}
