import { useEffect, useRef, useState } from "react";

import { loadGoogleMaps } from "../../../services/googleMaps";
import { buscarUEIsDoTalhao } from "../../motorEspacial/buscarUEIsDoTalhao";
import {
  criarCamadaLocalizacaoUsuarioGoogleMaps,
  type ControleLocalizacaoUsuarioGoogleMaps,
} from "../../motorEspacial/camadaLocalizacaoUsuarioGoogleMaps";

import type { LatLng } from "../../../features/map/types/map.types";
import type { UEIEspacial } from "../../motorEspacial/types";
import type { TalhaoMapCanvasV2Props } from "./types";

const CENTRO_INICIAL = {
  lat: -14.235,
  lng: -51.925,
};

const ZOOM_ROTULO_CURTO = 17;
const ZOOM_ROTULO_COMPLETO = 19;

type MarcadorUei = {
  marcador: any;
  uei: UEIEspacial;
  indice: number;
};

function coordenadaValida(
  coordenada: LatLng | undefined,
): coordenada is LatLng {
  return Boolean(
    coordenada &&
      Number.isFinite(coordenada.lat) &&
      Number.isFinite(coordenada.lng),
  );
}

function obterNumeroUei(
  uei: UEIEspacial,
  indice: number,
): number {
  if (
    Number.isFinite(uei.numero) &&
    Number(uei.numero) > 0
  ) {
    return Number(uei.numero);
  }

  const correspondencia =
    uei.id.match(/UEI-(\d+)$/i);

  if (correspondencia) {
    return Number(correspondencia[1]);
  }

  return indice + 1;
}

function obterRotuloCurtoUei(
  uei: UEIEspacial,
  indice: number,
): string {
  return `UEI ${String(
    obterNumeroUei(uei, indice),
  ).padStart(3, "0")}`;
}

function obterRotuloCompletoUei(
  uei: UEIEspacial,
  indice: number,
): string {
  return `UEI-${String(
    obterNumeroUei(uei, indice),
  ).padStart(5, "0")}`;
}

function obterCentroideUei(
  uei: UEIEspacial,
): LatLng | null {
  if (coordenadaValida(uei.centroide)) {
    return {
      lat: uei.centroide.lat,
      lng: uei.centroide.lng,
    };
  }

  const coordenadasValidas =
    uei.geometria.filter(coordenadaValida);

  if (coordenadasValidas.length === 0) {
    return null;
  }

  const soma = coordenadasValidas.reduce(
    (acumulador, coordenada) => ({
      lat: acumulador.lat + coordenada.lat,
      lng: acumulador.lng + coordenada.lng,
    }),
    { lat: 0, lng: 0 },
  );

  return {
    lat:
      soma.lat /
      coordenadasValidas.length,

    lng:
      soma.lng /
      coordenadasValidas.length,
  };
}

function criarConteudoInfoUei(
  uei: UEIEspacial,
  indice: number,
  nomeTalhao: string,
): HTMLDivElement {
  const container =
    document.createElement("div");

  container.style.minWidth = "190px";
  container.style.padding = "4px 2px";

  const titulo =
    document.createElement("strong");

  titulo.textContent =
    obterRotuloCompletoUei(
      uei,
      indice,
    );

  titulo.style.display = "block";
  titulo.style.color = "#0f172a";
  titulo.style.fontSize = "14px";

  const identificador =
    document.createElement("p");

  identificador.textContent =
    `ID: ${uei.codigo?.trim() || uei.id}`;

  identificador.style.margin =
    "6px 0 0";

  identificador.style.color =
    "#475569";

  identificador.style.fontSize =
    "12px";

  identificador.style.overflowWrap =
    "anywhere";

  const talhao =
    document.createElement("p");

  talhao.textContent =
    `Talhão: ${nomeTalhao}`;

  talhao.style.margin = "4px 0 0";
  talhao.style.color = "#475569";
  talhao.style.fontSize = "12px";

  const area =
    document.createElement("p");

  area.textContent =
    `Área: ${uei.areaHa.toFixed(4)} ha`;

  area.style.margin = "4px 0 0";
  area.style.color = "#047857";
  area.style.fontSize = "12px";
  area.style.fontWeight = "700";

  container.append(
    titulo,
    identificador,
    talhao,
    area,
  );

  return container;
}

function obterCoordenadasTalhao(
  talhao:
    TalhaoMapCanvasV2Props["talhoes"][number],
): LatLng[] {
  if (
    Array.isArray(talhao.coordenadas) &&
    talhao.coordenadas.length >= 3
  ) {
    return talhao.coordenadas;
  }

  if (
    Array.isArray(talhao.polygon) &&
    talhao.polygon.length >= 3
  ) {
    return talhao.polygon;
  }

  if (
    Array.isArray(talhao.pontos) &&
    talhao.pontos.length >= 3
  ) {
    return talhao.pontos;
  }

  return [];
}

function calcularAreaHa(
  googleMaps: any,
  coordenadas: LatLng[],
): number {
  if (
    !googleMaps ||
    coordenadas.length < 3
  ) {
    return 0;
  }

  const caminho = coordenadas.map(
    (coordenada) =>
      new googleMaps.maps.LatLng(
        coordenada.lat,
        coordenada.lng,
      ),
  );

  const areaM2 =
    googleMaps.maps.geometry.spherical
      .computeArea(caminho);

  return Number(
    (areaM2 / 10000).toFixed(4),
  );
}

export function TalhaoMapCanvasV2({
  mode,
  talhoes,
  selectedTalhao,
  coordenadasDesenho,
  corDesenho = "#10b981",
  onSelectTalhao,
  onChangeCoordenadas,
  onAreaCalculada,
}: TalhaoMapCanvasV2Props) {
  const mapContainerRef =
    useRef<HTMLDivElement>(null);

  const mapInstanceRef =
    useRef<any>(null);

  const localizacaoUsuarioRef =
    useRef<ControleLocalizacaoUsuarioGoogleMaps | null>(
      null,
    );

  const overlaysTalhoesRef =
    useRef<any[]>([]);

  const overlaysUeisRef =
    useRef<any[]>([]);

  const marcadoresUeisRef =
    useRef<MarcadorUei[]>([]);

  const infoWindowUeiRef =
    useRef<any>(null);

  const desenhoPolylineRef =
    useRef<any>(null);

  const desenhoPolygonRef =
    useRef<any>(null);

  const marcadoresDesenhoRef =
    useRef<any[]>([]);

  const clickListenerRef =
    useRef<any>(null);

  const zoomListenerRef =
    useRef<any>(null);

  const [googleMaps, setGoogleMaps] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  const [erro, setErro] =
    useState<string | null>(null);

  const [ueis, setUeis] =
    useState<UEIEspacial[]>([]);

  const [loadingUeis, setLoadingUeis] =
    useState(false);

  const [erroUeis, setErroUeis] =
    useState<string | null>(null);

  const [zoomAtual, setZoomAtual] =
    useState(0);

  const [
    indiceVerticeSelecionado,
    setIndiceVerticeSelecionado,
  ] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (
      mode !== "desenho" ||
      (
        indiceVerticeSelecionado !==
          null &&
        indiceVerticeSelecionado >=
          coordenadasDesenho.length
      )
    ) {
      setIndiceVerticeSelecionado(
        null,
      );
    }
  }, [
    coordenadasDesenho.length,
    indiceVerticeSelecionado,
    mode,
  ]);

  useEffect(() => {
    let ativo = true;

    async function inicializarMapa() {
      try {
        setLoading(true);
        setErro(null);

        const google =
          await loadGoogleMaps();

        if (
          !ativo ||
          !mapContainerRef.current
        ) {
          return;
        }

        setGoogleMaps(google);

        const primeiroTalhao =
          talhoes.find(
            (talhao) =>
              obterCoordenadasTalhao(
                talhao,
              ).length >= 3,
          );

        const coordenadasPrimeiroTalhao =
          primeiroTalhao
            ? obterCoordenadasTalhao(
                primeiroTalhao,
              )
            : [];

        const centro =
          coordenadasPrimeiroTalhao[0] ??
          CENTRO_INICIAL;

        const zoom =
          coordenadasPrimeiroTalhao.length >=
          3
            ? 15
            : 4;

        const mapa =
          new google.maps.Map(
            mapContainerRef.current,
            {
              center: centro,
              zoom,
              mapTypeId: "satellite",
              mapTypeControl: true,
              streetViewControl: false,
              fullscreenControl: true,
              zoomControl: true,
              tilt: 0,
            },
          );

        mapInstanceRef.current = mapa;

        localizacaoUsuarioRef.current?.limpar();
        localizacaoUsuarioRef.current =
          criarCamadaLocalizacaoUsuarioGoogleMaps(
            google,
            mapa,
            {
              centralizarNaPrimeiraLeitura:
                coordenadasPrimeiroTalhao.length <
                3,
              zoomAoCentralizar: 18,
              precisaoMaximaParaCentralizar: 50,
            },
          );

        setLoading(false);
      } catch (error) {
        console.error(
          "Erro ao carregar o Google Maps no Editor V2:",
          error,
        );

        if (ativo) {
          setErro(
            "Não foi possível carregar o mapa.",
          );

          setLoading(false);
        }
      }
    }

    inicializarMapa();

    return () => {
      ativo = false;
      localizacaoUsuarioRef.current?.limpar();
      localizacaoUsuarioRef.current = null;
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (
      !googleMaps ||
      !mapInstanceRef.current
    ) {
      return;
    }

    const atualizarZoom = () => {
      setZoomAtual(
        Number(
          mapInstanceRef.current
            ?.getZoom?.() ?? 0,
        ),
      );
    };

    atualizarZoom();

    zoomListenerRef.current =
      mapInstanceRef.current.addListener(
        "zoom_changed",
        atualizarZoom,
      );

    return () => {
      if (zoomListenerRef.current) {
        googleMaps.maps.event
          .removeListener(
            zoomListenerRef.current,
          );

        zoomListenerRef.current = null;
      }
    };
  }, [googleMaps]);

  useEffect(() => {
    let ativo = true;

    setUeis([]);
    setErroUeis(null);

    if (
      mode !== "visualizacao" ||
      !selectedTalhao
    ) {
      setLoadingUeis(false);

      return () => {
        ativo = false;
      };
    }

    setLoadingUeis(true);

    buscarUEIsDoTalhao(
      selectedTalhao.farmId,
      selectedTalhao.id,
    )
      .then((resultado) => {
        if (!ativo) {
          return;
        }

        const ordenadas =
          [...resultado].sort(
            (ueiA, ueiB) => {
              const numeroA = Number(
                ueiA.numero ??
                  Number.MAX_SAFE_INTEGER,
              );

              const numeroB = Number(
                ueiB.numero ??
                  Number.MAX_SAFE_INTEGER,
              );

              if (numeroA !== numeroB) {
                return numeroA - numeroB;
              }

              return ueiA.id.localeCompare(
                ueiB.id,
              );
            },
          );

        setUeis(ordenadas);
      })
      .catch((error) => {
        console.error(
          "Erro ao carregar as UEIs do talhão:",
          error,
        );

        if (ativo) {
          setErroUeis(
            "Não foi possível carregar as divisões de hectare.",
          );
        }
      })
      .finally(() => {
        if (ativo) {
          setLoadingUeis(false);
        }
      });

    return () => {
      ativo = false;
    };
  }, [
    mode,
    selectedTalhao?.farmId,
    selectedTalhao?.id,
  ]);

  useEffect(() => {
    if (
      !googleMaps ||
      !mapInstanceRef.current
    ) {
      return;
    }

    overlaysTalhoesRef.current.forEach(
      (overlay) => {
        overlay.setMap(null);
      },
    );

    overlaysTalhoesRef.current = [];

    talhoes.forEach((talhao) => {
      const coordenadas =
        obterCoordenadasTalhao(talhao);

      if (coordenadas.length < 3) {
        return;
      }

      const selecionado =
        selectedTalhao?.id ===
        talhao.id;

      const cor =
        talhao.cor ?? "#10b981";

      const polygon =
        new googleMaps.maps.Polygon({
          paths: coordenadas,
          strokeColor: cor,

          strokeOpacity:
            selecionado ? 1 : 0.65,

          strokeWeight:
            selecionado ? 2 : 1,

          fillColor: cor,

          fillOpacity:
            selecionado ? 0.28 : 0.12,

          clickable:
            mode === "visualizacao",

          map:
            mapInstanceRef.current,
        });

      if (
        mode === "visualizacao"
      ) {
        polygon.addListener(
          "click",
          () => {
            onSelectTalhao(talhao);
          },
        );
      }

      overlaysTalhoesRef.current.push(
        polygon,
      );

      if (selecionado) {
        const limitesInternos = [
          {
            coordenadas:
              talhao.limiteAtivacaoOperacional ??
              talhao.limiteOperacional,
            cor: "#3b82f6",
          },
          {
            coordenadas:
              talhao.limiteNucleoProdutivo,
            cor: "#fbbf24",
          },
        ];

        limitesInternos.forEach(
          ({
            coordenadas:
              coordenadasLimite,
            cor: corLimite,
          }) => {
            const pontos =
              coordenadasLimite?.filter(
                coordenadaValida,
              ) ?? [];

            if (pontos.length < 3) {
              return;
            }

            const limite =
              new googleMaps.maps.Polygon({
                paths: pontos,
                strokeColor: corLimite,
                strokeOpacity: 0.95,
                strokeWeight: 1.5,
                fillOpacity: 0,
                clickable: false,
                zIndex: 4,
                map:
                  mapInstanceRef.current,
              });

            overlaysTalhoesRef.current.push(
              limite,
            );
          },
        );
      }
    });

    return () => {
      overlaysTalhoesRef.current.forEach(
        (overlay) => {
          overlay.setMap(null);
        },
      );

      overlaysTalhoesRef.current = [];
    };
  }, [
    googleMaps,
    mode,
    onSelectTalhao,
    selectedTalhao,
    talhoes,
  ]);

  useEffect(() => {
    if (
      !googleMaps ||
      !mapInstanceRef.current
    ) {
      return;
    }

    overlaysUeisRef.current.forEach(
      (overlay) => {
        overlay.setMap(null);
      },
    );

    overlaysUeisRef.current = [];

    marcadoresUeisRef.current.forEach(
      ({ marcador }) => {
        marcador.setMap(null);
      },
    );

    marcadoresUeisRef.current = [];

    if (infoWindowUeiRef.current) {
      infoWindowUeiRef.current.close();
      infoWindowUeiRef.current = null;
    }

    if (
      mode !== "visualizacao" ||
      !selectedTalhao
    ) {
      return;
    }

    const infoWindow =
      new googleMaps.maps.InfoWindow();

    infoWindowUeiRef.current =
      infoWindow;

    ueis.forEach((uei, indice) => {
      const geometria =
        uei.geometria.filter(
          coordenadaValida,
        );

      if (geometria.length < 3) {
        return;
      }

      const centroide =
        obterCentroideUei(uei);

      const pertenceFaixaAvaliacao =
        uei.zonaTalhao ===
        "faixa_avaliacao_bordadura";

      const corBase =
        pertenceFaixaAvaliacao
          ? "#f59e0b"
          : "#0ea5e9";

      const poligono =
        new googleMaps.maps.Polygon({
          paths: geometria,

          strokeColor: "#f8fafc",
          strokeOpacity: 0.95,
          strokeWeight: 1,

          fillColor: corBase,
          fillOpacity:
            pertenceFaixaAvaliacao
              ? 0.1
              : 0.045,

          clickable: true,
          zIndex: 5,

          map:
            mapInstanceRef.current,
        });

      poligono.addListener(
        "mouseover",
        () => {
          poligono.setOptions({
            strokeColor: "#facc15",
            strokeWeight: 1.5,

            fillColor: "#facc15",
            fillOpacity: 0.12,
          });
        },
      );

      poligono.addListener(
        "mouseout",
        () => {
          poligono.setOptions({
            strokeColor: "#f8fafc",
            strokeWeight: 1,

            fillColor: corBase,
            fillOpacity:
              pertenceFaixaAvaliacao
                ? 0.1
                : 0.045,
          });
        },
      );

      poligono.addListener(
        "click",
        (event: any) => {
          const posicao =
            event.latLng ?? centroide;

          if (!posicao) {
            return;
          }

          infoWindow.setContent(
            criarConteudoInfoUei(
              uei,
              indice,
              selectedTalhao.nome,
            ),
          );

          infoWindow.setPosition(
            posicao,
          );

          infoWindow.open({
            map:
              mapInstanceRef.current,
          });
        },
      );

      overlaysUeisRef.current.push(
        poligono,
      );

      if (!centroide) {
        return;
      }

      const marcador =
        new googleMaps.maps.Marker({
          position: centroide,
          clickable: false,
          optimized: false,
          zIndex: 10,

          icon: {
            path:
              googleMaps.maps.SymbolPath
                .CIRCLE,

            scale: 0,
            fillOpacity: 0,
            strokeOpacity: 0,
          },

          label: {
            text:
              obterRotuloCurtoUei(
                uei,
                indice,
              ),

            color: "#ffffff",
            fontSize: "12px",
            fontWeight: "800",
          },
        });

      marcadoresUeisRef.current.push({
        marcador,
        uei,
        indice,
      });
    });

    return () => {
      overlaysUeisRef.current.forEach(
        (overlay) => {
          overlay.setMap(null);
        },
      );

      overlaysUeisRef.current = [];

      marcadoresUeisRef.current.forEach(
        ({ marcador }) => {
          marcador.setMap(null);
        },
      );

      marcadoresUeisRef.current = [];

      infoWindow.close();

      if (
        infoWindowUeiRef.current ===
        infoWindow
      ) {
        infoWindowUeiRef.current =
          null;
      }
    };
  }, [
    googleMaps,
    mode,
    selectedTalhao,
    ueis,
  ]);

  useEffect(() => {
    const mapa =
      mapInstanceRef.current;

    marcadoresUeisRef.current.forEach(
      ({ marcador, uei, indice }) => {
        const exibir =
          mode === "visualizacao" &&
          zoomAtual >=
            ZOOM_ROTULO_CURTO;

        if (!exibir || !mapa) {
          marcador.setMap(null);
          return;
        }

        const texto =
          zoomAtual >=
          ZOOM_ROTULO_COMPLETO
            ? obterRotuloCompletoUei(
                uei,
                indice,
              )
            : obterRotuloCurtoUei(
                uei,
                indice,
              );

        marcador.setLabel({
          text: texto,
          color: "#ffffff",

          fontSize:
            zoomAtual >=
            ZOOM_ROTULO_COMPLETO
              ? "13px"
              : "12px",

          fontWeight: "800",
        });

        marcador.setMap(mapa);
      },
    );
  }, [
    mode,
    ueis,
    zoomAtual,
  ]);

  useEffect(() => {
    if (
      !googleMaps ||
      !mapInstanceRef.current
    ) {
      return;
    }

    if (desenhoPolylineRef.current) {
      desenhoPolylineRef.current
        .setMap(null);

      desenhoPolylineRef.current =
        null;
    }

    if (desenhoPolygonRef.current) {
      desenhoPolygonRef.current
        .setMap(null);

      desenhoPolygonRef.current =
        null;
    }

    marcadoresDesenhoRef.current.forEach(
      (marcador) => {
        marcador.setMap(null);
      },
    );

    marcadoresDesenhoRef.current = [];

    if (
      coordenadasDesenho.length >= 3
    ) {
      desenhoPolygonRef.current =
        new googleMaps.maps.Polygon({
          paths:
            coordenadasDesenho,

          strokeColor:
            corDesenho,

          strokeOpacity: 1,
          strokeWeight: 2,

          fillColor:
            corDesenho,

          fillOpacity: 0.22,
          clickable: false,

          map:
            mapInstanceRef.current,
        });
    } else if (
      coordenadasDesenho.length > 0
    ) {
      desenhoPolylineRef.current =
        new googleMaps.maps.Polyline({
          path:
            coordenadasDesenho,

          strokeColor:
            corDesenho,

          strokeOpacity: 1,
          strokeWeight: 2,

          clickable: false,

          map:
            mapInstanceRef.current,
        });
    }

    coordenadasDesenho.forEach(
      (coordenada, indice) => {
        const primeiroPonto =
          indice === 0;
        const selecionado =
          indiceVerticeSelecionado ===
          indice;

        const marcador =
          new googleMaps.maps.Marker({
            position: coordenada,

            map:
              mapInstanceRef.current,

            clickable: true,
            draggable:
              mode === "desenho",

            icon: {
              path:
                googleMaps.maps
                  .SymbolPath.CIRCLE,

              scale:
                selecionado
                  ? 9
                  : primeiroPonto
                    ? 7
                    : 5,

              fillColor:
                selecionado
                  ? "#f59e0b"
                  : primeiroPonto
                    ? "#dc2626"
                    : corDesenho,

              fillOpacity: 1,

              strokeColor:
                "#ffffff",

              strokeWeight: 1.5,
            },

            label: {
              text: String(
                indice + 1,
              ),
              color: "#ffffff",
              fontSize: "10px",
              fontWeight: "800",
            },

            title:
              `Ponto ${indice + 1}: toque para selecionar ou arraste para corrigir`,
          });

        marcador.addListener(
          "click",
          (event: any) => {
            event.domEvent
              ?.stopPropagation?.();

            setIndiceVerticeSelecionado(
              indice,
            );
          },
        );

        marcador.addListener(
          "dragstart",
          () => {
            setIndiceVerticeSelecionado(
              indice,
            );
          },
        );

        marcador.addListener(
          "dragend",
          (event: any) => {
            if (!event.latLng) {
              return;
            }

            const atualizadas = [
              ...coordenadasDesenho,
            ];

            atualizadas[indice] = {
              lat:
                event.latLng.lat(),
              lng:
                event.latLng.lng(),
            };

            onChangeCoordenadas(
              atualizadas,
            );

            setIndiceVerticeSelecionado(
              null,
            );
          },
        );

        marcadoresDesenhoRef.current.push(
          marcador,
        );
      },
    );

    const areaHa =
      calcularAreaHa(
        googleMaps,
        coordenadasDesenho,
      );

    onAreaCalculada(areaHa);

    return () => {
      if (desenhoPolylineRef.current) {
        desenhoPolylineRef.current
          .setMap(null);
      }

      if (desenhoPolygonRef.current) {
        desenhoPolygonRef.current
          .setMap(null);
      }

      marcadoresDesenhoRef.current.forEach(
        (marcador) => {
          marcador.setMap(null);
        },
      );
    };
  }, [
    coordenadasDesenho,
    corDesenho,
    googleMaps,
    indiceVerticeSelecionado,
    mode,
    onChangeCoordenadas,
    onAreaCalculada,
  ]);

  useEffect(() => {
    if (
      !googleMaps ||
      !mapInstanceRef.current
    ) {
      return;
    }

    if (clickListenerRef.current) {
      googleMaps.maps.event
        .removeListener(
          clickListenerRef.current,
        );

      clickListenerRef.current = null;
    }

    if (mode !== "desenho") {
      return;
    }

    clickListenerRef.current =
      mapInstanceRef.current.addListener(
        "click",
        (event: any) => {
          if (!event.latLng) {
            return;
          }

          const novaCoordenada: LatLng =
            {
              lat:
                event.latLng.lat(),

              lng:
                event.latLng.lng(),
            };

          if (
            indiceVerticeSelecionado !==
            null
          ) {
            const atualizadas = [
              ...coordenadasDesenho,
            ];

            atualizadas[
              indiceVerticeSelecionado
            ] = novaCoordenada;

            onChangeCoordenadas(
              atualizadas,
            );

            setIndiceVerticeSelecionado(
              null,
            );

            return;
          }

          onChangeCoordenadas([
            ...coordenadasDesenho,
            novaCoordenada,
          ]);
        },
      );

    return () => {
      if (clickListenerRef.current) {
        googleMaps.maps.event
          .removeListener(
            clickListenerRef.current,
          );

        clickListenerRef.current =
          null;
      }
    };
  }, [
    coordenadasDesenho,
    googleMaps,
    indiceVerticeSelecionado,
    mode,
    onChangeCoordenadas,
  ]);

  useEffect(() => {
    if (
      !googleMaps ||
      !mapInstanceRef.current ||
      !selectedTalhao
    ) {
      return;
    }

    const coordenadas =
      obterCoordenadasTalhao(
        selectedTalhao,
      );

    if (coordenadas.length < 3) {
      return;
    }

    const limites =
      new googleMaps.maps
        .LatLngBounds();

    coordenadas.forEach(
      (coordenada) => {
        limites.extend(
          new googleMaps.maps.LatLng(
            coordenada.lat,
            coordenada.lng,
          ),
        );
      },
    );

    mapInstanceRef.current.fitBounds(
      limites,
    );
  }, [
    googleMaps,
    selectedTalhao,
  ]);

  return (
    <div className="relative min-h-[560px] overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
      <div
        ref={mapContainerRef}
        className="h-[560px] w-full"
      />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />

            <p className="mt-3 text-sm font-semibold text-slate-500">
              Carregando mapa...
            </p>
          </div>
        </div>
      )}

      {erro && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 p-6">
          <div className="max-w-md rounded-2xl border border-rose-200 bg-white p-6 text-center shadow-sm">
            <p className="font-bold text-rose-700">
              {erro}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Verifique a configuração da API do Google Maps e tente novamente.
            </p>
          </div>
        </div>
      )}

      {mode === "visualizacao" &&
        selectedTalhao &&
        !loading &&
        !erro && (
          <div className="pointer-events-none absolute left-4 top-4 max-w-[280px] rounded-2xl border border-white/20 bg-slate-950/85 px-4 py-3 text-white shadow-lg backdrop-blur">
            <p className="text-xs font-black uppercase tracking-widest text-sky-300">
              Hectares inteligentes
            </p>

            {loadingUeis ? (
              <p className="mt-1 text-xs text-slate-200">
                Carregando divisões do talhão...
              </p>
            ) : erroUeis ? (
              <p className="mt-1 text-xs font-semibold text-rose-300">
                {erroUeis}
              </p>
            ) : ueis.length === 0 ? (
              <p className="mt-1 text-xs text-amber-200">
                Nenhuma UEI foi encontrada neste talhão.
              </p>
            ) : (
              <>
                <p className="mt-1 text-sm font-bold text-white">
                  {ueis.length}{" "}
                  {ueis.length === 1
                    ? "UEI carregada"
                    : "UEIs carregadas"}
                </p>

                <p className="mt-1 text-xs text-slate-200">
                  {zoomAtual <
                  ZOOM_ROTULO_CURTO
                    ? "Aproxime o mapa para visualizar os IDs."
                    : zoomAtual <
                        ZOOM_ROTULO_COMPLETO
                      ? "IDs resumidos visíveis. Aproxime mais para o ID completo."
                      : "IDs completos visíveis."}
                </p>

                <p className="mt-2 text-[11px] text-slate-300">
                  Clique em uma célula para consultar ID, área e talhão.
                </p>
              </>
            )}
          </div>
        )}

      {mode === "desenho" &&
        !loading &&
        !erro && (
          <div className="pointer-events-none absolute left-4 top-4 max-w-[310px] rounded-2xl border border-white/20 bg-slate-950/85 px-4 py-3 text-white shadow-lg backdrop-blur">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-300">
              Ajuste dos vértices
            </p>

            <p className="mt-1 text-xs leading-relaxed text-slate-200">
              {indiceVerticeSelecionado ===
              null
                ? "Toque no mapa para criar um ponto. Toque em um ponto numerado para selecioná-lo."
                : `Ponto ${indiceVerticeSelecionado + 1} selecionado. Toque na nova posição ou arraste o marcador.`}
            </p>

            <p className="mt-2 text-xs font-bold text-white">
              Pontos:{" "}
              {coordenadasDesenho.length}
            </p>
          </div>
        )}

      {mode === "salvando" && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/45 backdrop-blur-[2px]">
          <div className="rounded-2xl bg-white px-6 py-5 text-center shadow-xl">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />

            <p className="mt-3 text-sm font-bold text-slate-700">
              Processando talhão, UEIs e GDAs...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
