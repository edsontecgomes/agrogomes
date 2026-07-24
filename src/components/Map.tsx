import React, {
  useEffect,
  useRef,
  useState,
} from "react";
import { Layers3 } from "lucide-react";

import { useFarm } from "../contexts/FarmContext";
import { loadGoogleMaps } from "../services/googleMaps";
import {
  ChuvaComunitaria,
  Pluviometro,
} from "../types";
import { buscarUEIsDaFazenda } from "../modules/motorEspacial/buscarUEIsDaFazenda";
import {
  ControleCamadaUEIGoogleMaps,
  criarCamadaUEIGoogleMaps,
} from "../modules/motorEspacial/camadaUEIGoogleMaps";
import { UEIEspacial } from "../modules/motorEspacial/types";

interface MapProps {
  pluviometros: Pluviometro[];
  chuvasComunitarias: ChuvaComunitaria[];
}

function criarConteudoPluviometro(
  pluviometro: Pluviometro,
  totalRain: number,
): HTMLDivElement {
  const conteudo =
    document.createElement("div");

  conteudo.style.padding = "8px";
  conteudo.style.fontFamily = "sans-serif";
  conteudo.style.color = "#1e293b";

  const titulo =
    document.createElement("strong");

  titulo.textContent =
    `Pluviômetro: ${pluviometro.nome}`;

  titulo.style.display = "block";
  titulo.style.fontSize = "14px";
  titulo.style.marginBottom = "4px";

  const total =
    document.createElement("span");

  total.textContent =
    `Total acumulado: ${totalRain.toFixed(
      1,
    )} mm`;

  total.style.fontSize = "12px";
  total.style.color = "#2563eb";

  conteudo.append(titulo, total);

  return conteudo;
}

function criarConteudoChuva(
  chuva: ChuvaComunitaria,
): HTMLDivElement {
  const conteudo =
    document.createElement("div");

  conteudo.style.padding = "8px";
  conteudo.style.fontFamily = "sans-serif";
  conteudo.style.color = "#1e293b";

  const titulo =
    document.createElement("strong");

  titulo.textContent = "Registro de chuva";
  titulo.style.display = "block";
  titulo.style.color = "#2563eb";
  titulo.style.marginBottom = "4px";

  const volume =
    document.createElement("div");

  volume.textContent =
    `${chuva.mm.toFixed(1)} mm`;

  volume.style.fontWeight = "700";
  volume.style.fontSize = "13px";

  const data =
    document.createElement("div");

  data.textContent = new Date(
    chuva.timestamp,
  ).toLocaleDateString("pt-BR");

  data.style.color = "#64748b";
  data.style.fontSize = "11px";
  data.style.marginTop = "4px";

  conteudo.append(
    titulo,
    volume,
    data,
  );

  return conteudo;
}

export function Map({
  pluviometros,
  chuvasComunitarias,
}: MapProps) {
  const { currentFarmId } = useFarm();

  const mapContainerRef =
    useRef<HTMLDivElement>(null);

  const camadaUEIRef =
    useRef<ControleCamadaUEIGoogleMaps | null>(
      null,
    );

  const markersRef =
    useRef<any[]>([]);

  const infoWindowsRef =
    useRef<any[]>([]);

  const [ueis, setUeis] =
    useState<UEIEspacial[]>([]);

  const [loadingUeis, setLoadingUeis] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const farmId =
    currentFarmId ??
    pluviometros[0]?.farmId ??
    chuvasComunitarias[0]?.farmId ??
    "";

  useEffect(() => {
    let active = true;

    if (!farmId) {
      setUeis([]);
      setLoadingUeis(false);

      return () => {
        active = false;
      };
    }

    setLoadingUeis(true);

    buscarUEIsDaFazenda(farmId)
      .then((resultado) => {
        if (active) {
          setUeis(resultado);
          setLoadingUeis(false);
        }
      })
      .catch((erro) => {
        console.error(
          "Erro ao carregar UEIs no mapa de chuvas:",
          erro,
        );

        if (active) {
          setUeis([]);
          setLoadingUeis(false);
        }
      });

    return () => {
      active = false;
    };
  }, [farmId]);

  useEffect(() => {
    let active = true;

    const limparMapa = () => {
      camadaUEIRef.current?.limpar();
      camadaUEIRef.current = null;

      markersRef.current.forEach(
        (marker) => {
          marker.setMap(null);
        },
      );

      markersRef.current = [];

      infoWindowsRef.current.forEach(
        (infoWindow) => {
          infoWindow.close();
        },
      );

      infoWindowsRef.current = [];
    };

    loadGoogleMaps()
      .then((google) => {
        if (
          !active ||
          !mapContainerRef.current
        ) {
          return;
        }

        setError(null);
        limparMapa();

        const primeiraReferencia =
          pluviometros[0]?.location ??
          ueis[0]?.centroide ??
          ueis[0]?.geometria[0] ?? {
            lat: -14.235,
            lng: -51.925,
          };

        const mapa =
          new google.maps.Map(
            mapContainerRef.current,
            {
              center: {
                lat:
                  primeiraReferencia.lat,
                lng:
                  primeiraReferencia.lng,
              },

              zoom:
                pluviometros.length > 0 ||
                ueis.length > 0
                  ? 14
                  : 4,

              mapTypeId: "satellite",
              disableDefaultUI: false,
              fullscreenControl: true,
              mapTypeControl: false,
              streetViewControl: false,
              zoomControl: true,
            },
          );

        camadaUEIRef.current =
          criarCamadaUEIGoogleMaps(
            google,
            mapa,
            ueis,
          );

        const limites =
          new google.maps.LatLngBounds();

        ueis.forEach((uei) => {
          uei.geometria.forEach(
            (ponto) => {
              limites.extend({
                lat: ponto.lat,
                lng: ponto.lng,
              });
            },
          );
        });

        pluviometros.forEach(
          (pluviometro) => {
            const totalRain =
              chuvasComunitarias
                .filter(
                  (chuva) =>
                    chuva.pluviometroId ===
                    pluviometro.id,
                )
                .reduce(
                  (total, chuva) =>
                    total + chuva.mm,
                  0,
                );

            const posicao = {
              lat:
                pluviometro.location.lat,
              lng:
                pluviometro.location.lng,
            };

            limites.extend(posicao);

            const marker =
              new google.maps.Marker({
                position: posicao,
                map: mapa,

                title:
                  `Pluviômetro: ${pluviometro.nome}`,

                zIndex: 10,

                icon: {
                  path:
                    google.maps.SymbolPath
                      .BACKWARD_CLOSED_ARROW,

                  scale: 7,
                  fillColor: "#ef4444",
                  fillOpacity: 1,
                  strokeColor: "#ffffff",
                  strokeWeight: 2,
                },
              });

            const infoWindow =
              new google.maps.InfoWindow({
                content:
                  criarConteudoPluviometro(
                    pluviometro,
                    totalRain,
                  ),
              });

            marker.addListener(
              "click",
              () => {
                infoWindow.open(
                  mapa,
                  marker,
                );
              },
            );

            markersRef.current.push(
              marker,
            );

            infoWindowsRef.current.push(
              infoWindow,
            );
          },
        );

        chuvasComunitarias.forEach(
          (chuva, index) => {
            const offsetLat =
              ((index % 5) - 2) *
              0.0001;

            const offsetLng =
              (((index + 2) % 5) - 2) *
              0.0001;

            const posicao = {
              lat:
                chuva.location.lat +
                offsetLat,

              lng:
                chuva.location.lng +
                offsetLng,
            };

            limites.extend(posicao);

            const marker =
              new google.maps.Marker({
                position: posicao,
                map: mapa,

                title:
                  `Chuva: ${chuva.mm.toFixed(
                    1,
                  )} mm`,

                zIndex: 9,

                icon: {
                  path:
                    google.maps.SymbolPath
                      .CIRCLE,

                  scale: 6,
                  fillColor: "#2563eb",
                  fillOpacity: 0.9,
                  strokeColor: "#ffffff",
                  strokeWeight: 2,
                },
              });

            const infoWindow =
              new google.maps.InfoWindow({
                content:
                  criarConteudoChuva(
                    chuva,
                  ),
              });

            marker.addListener(
              "click",
              () => {
                infoWindow.open(
                  mapa,
                  marker,
                );
              },
            );

            markersRef.current.push(
              marker,
            );

            infoWindowsRef.current.push(
              infoWindow,
            );
          },
        );

        if (!limites.isEmpty()) {
          mapa.fitBounds(
            limites,
            36,
          );

          google.maps.event
            .addListenerOnce(
              mapa,
              "idle",
              () => {
                const zoom =
                  mapa.getZoom() ?? 14;

                if (zoom > 18) {
                  mapa.setZoom(18);
                }
              },
            );
        }
      })
      .catch((erro) => {
        console.error(erro);

        if (active) {
          setError(
            "Erro ao carregar o Google Maps",
          );
        }
      });

    return () => {
      active = false;
      limparMapa();
    };
  }, [
    pluviometros,
    chuvasComunitarias,
    ueis,
  ]);

  return (
    <div className="relative z-0 h-[400px] w-full overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      {error ? (
        <div className="flex h-full w-full items-center justify-center bg-slate-100 p-6 text-center font-semibold text-rose-500">
          {error}
        </div>
      ) : (
        <div
          ref={mapContainerRef}
          className="h-full w-full"
        />
      )}

      {!error && (
        <div className="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-xl border border-white/30 bg-slate-950/80 px-3 py-2 text-xs font-bold text-white shadow-lg backdrop-blur-md">
          <Layers3 className="h-4 w-4 text-emerald-300" />

          {loadingUeis
            ? "Carregando UEIs..."
            : `${ueis.length} UEI${
                ueis.length === 1
                  ? ""
                  : "s"
              }`}
        </div>
      )}
    </div>
  );
}