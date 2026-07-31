import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Circle,
  CircleMarker,
  MapContainer,
  Polygon,
  Popup,
  TileLayer,
  ZoomControl,
} from "react-leaflet";
import type {
  LatLngExpression,
} from "leaflet";
import "leaflet/dist/leaflet.css";

import type {
  ChuvaComunitaria,
  Pluviometro,
  Talhao,
} from "../../types";

interface OfflineLeafletMapProps {
  talhoes?: Talhao[];
  pluviometros?: Pluviometro[];
  chuvas?: ChuvaComunitaria[];
  onTalhaoClick?: (
    talhao: Talhao,
  ) => void;
}

const DEFAULT_CENTER:
  LatLngExpression = [
    -14.235,
    -51.925,
  ];

function parseCoordinatePair(
  value: unknown,
): LatLngExpression | null {
  if (
    !Array.isArray(value) ||
    value.length < 2
  ) {
    return null;
  }

  const lng = Number(value[0]);
  const lat = Number(value[1]);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng)
  ) {
    return null;
  }

  return [lat, lng];
}

function getTalhaoRings(
  talhao: Talhao,
): LatLngExpression[][] {
  const geoJsonCoordinates =
    talhao.geometria?.geometry
      ?.coordinates ||
    talhao.geometria?.coordinates;

  if (
    Array.isArray(
      geoJsonCoordinates,
    )
  ) {
    const first =
      geoJsonCoordinates[0];
    const rings =
      Array.isArray(first?.[0])
        ? geoJsonCoordinates
        : [geoJsonCoordinates];

    const parsedRings = rings
      .map((ring: unknown[]) =>
        ring
          .map(parseCoordinatePair)
          .filter(
            (
              coordinate,
            ): coordinate is LatLngExpression =>
              coordinate !== null,
          ),
      )
      .filter(
        (ring: LatLngExpression[]) =>
          ring.length >= 3,
      );

    if (parsedRings.length > 0) {
      return parsedRings;
    }
  }

  const fallbackRing =
    (talhao.coordenadas || [])
      .map((coordinate) => {
        const lat =
          Number(coordinate.lat);
        const lng =
          Number(coordinate.lng);

        if (
          !Number.isFinite(lat) ||
          !Number.isFinite(lng)
        ) {
          return null;
        }

        return [
          lat,
          lng,
        ] as LatLngExpression;
      })
      .filter(
        (
          coordinate,
        ): coordinate is LatLngExpression =>
          coordinate !== null,
      );

  return fallbackRing.length >= 3
    ? [fallbackRing]
    : [];
}

export function OfflineLeafletMap({
  talhoes = [],
  pluviometros = [],
  chuvas = [],
  onTalhaoClick,
}: OfflineLeafletMapProps) {
  const [
    userLocation,
    setUserLocation,
  ] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
  } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    const watchId =
      navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            lat:
              position.coords.latitude,
            lng:
              position.coords.longitude,
            accuracy:
              position.coords.accuracy,
          });
        },
        () => {},
        {
          enableHighAccuracy: true,
          maximumAge: 5_000,
          timeout: 20_000,
        },
      );

    return () => {
      navigator.geolocation.clearWatch(
        watchId,
      );
    };
  }, []);

  const talhaoLayers = useMemo(
    () =>
      talhoes.map((talhao) => ({
        talhao,
        rings:
          getTalhaoRings(talhao),
      })),
    [talhoes],
  );

  const center = useMemo<
    LatLngExpression
  >(() => {
    const firstTalhaoPoint =
      talhaoLayers[0]?.rings[0]?.[0];

    if (firstTalhaoPoint) {
      return firstTalhaoPoint;
    }

    const pluviometro =
      pluviometros[0];

    if (pluviometro) {
      return [
        pluviometro.location.lat,
        pluviometro.location.lng,
      ];
    }

    return DEFAULT_CENTER;
  }, [
    pluviometros,
    talhaoLayers,
  ]);

  return (
    <MapContainer
      center={center}
      zoom={
        center === DEFAULT_CENTER
          ? 4
          : 15
      }
      zoomControl={false}
      className="w-full h-full min-h-[320px] bg-slate-200"
    >
      <TileLayer
        attribution="© OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {talhaoLayers.map(
        ({ talhao, rings }) =>
          rings.length > 0 && (
            <Polygon
              key={talhao.id}
              positions={rings}
              pathOptions={{
                color: "#059669",
                fillColor: "#10b981",
                fillOpacity: 0.18,
                weight: 2,
              }}
            >
              <Popup>
                <div className="min-w-40 text-slate-800">
                  <strong>
                    {talhao.nome}
                  </strong>

                  <p className="mt-1 text-xs">
                    Área:{" "}
                    {Number(
                      talhao.areaHa ??
                        talhao.area ??
                        0,
                    ).toFixed(2)}{" "}
                    ha
                  </p>

                  {onTalhaoClick && (
                    <button
                      type="button"
                      onClick={() =>
                        onTalhaoClick(
                          talhao,
                        )
                      }
                      className="mt-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white"
                    >
                      Ver talhão
                    </button>
                  )}
                </div>
              </Popup>
            </Polygon>
          ),
      )}

      {pluviometros.map(
        (pluviometro) => (
          <CircleMarker
            key={pluviometro.id}
            center={[
              pluviometro.location.lat,
              pluviometro.location.lng,
            ]}
            radius={8}
            pathOptions={{
              color: "#ffffff",
              fillColor: "#2563eb",
              fillOpacity: 0.95,
              weight: 2,
            }}
          >
            <Popup>
              <strong>
                {pluviometro.nome}
              </strong>

              <p className="text-xs">
                Pluviômetro salvo no aparelho
              </p>
            </Popup>
          </CircleMarker>
        ),
      )}

      {chuvas.map((chuva) => (
        <CircleMarker
          key={chuva.id}
          center={[
            chuva.location.lat,
            chuva.location.lng,
          ]}
          radius={5}
          pathOptions={{
            color: "#ffffff",
            fillColor: "#38bdf8",
            fillOpacity: 0.9,
            weight: 1,
          }}
        >
          <Popup>
            <strong>
              {chuva.mm} mm
            </strong>

            <p className="text-xs">
              Registro de chuva
            </p>
          </Popup>
        </CircleMarker>
      ))}

      {userLocation && (
        <>
          <Circle
            center={[
              userLocation.lat,
              userLocation.lng,
            ]}
            radius={
              userLocation.accuracy
            }
            pathOptions={{
              color: "#3b82f6",
              fillColor: "#60a5fa",
              fillOpacity: 0.12,
              weight: 1,
            }}
          />

          <CircleMarker
            center={[
              userLocation.lat,
              userLocation.lng,
            ]}
            radius={7}
            pathOptions={{
              color: "#ffffff",
              fillColor: "#2563eb",
              fillOpacity: 1,
              weight: 3,
            }}
          >
            <Popup>
              <strong>
                Sua localização
              </strong>

              <p className="text-xs">
                Precisão aproximada:{" "}
                {Math.round(
                  userLocation.accuracy,
                )}{" "}
                m
              </p>
            </Popup>
          </CircleMarker>
        </>
      )}

      <ZoomControl position="bottomright" />
    </MapContainer>
  );
}
