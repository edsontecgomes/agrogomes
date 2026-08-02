import type { Talhao } from "../../types";
import { GPS_PRECISAO_MAXIMA_METROS } from "../../utils/geoUtils";
import type { UEIEspacial } from "./types";
import {
  EstadoPresencaOperacional,
  resolverPresencaOperacional,
} from "./presencaOperacional";

export type OpcoesLocalizacaoUsuarioGoogleMaps = {
  centralizarNaPrimeiraLeitura?: boolean;
  zoomAoCentralizar?: number;
  exibirCirculoPrecisao?: boolean;
  precisaoMaximaParaCentralizar?: number;
  talhoes?: Talhao[];
  ueis?: UEIEspacial[];
  ordemServicoAtiva?: boolean;
  tempoEstabilidadeMs?: number;
};

export type ControleLocalizacaoUsuarioGoogleMaps = {
  limpar: () => void;
  centralizar: () => void;
};

type PosicaoUsuario = {
  lat: number;
  lng: number;
  accuracy: number;
};

export function criarCamadaLocalizacaoUsuarioGoogleMaps(
  google: any,
  mapa: any,
  opcoes: OpcoesLocalizacaoUsuarioGoogleMaps = {},
): ControleLocalizacaoUsuarioGoogleMaps {
  const {
    centralizarNaPrimeiraLeitura = false,
    zoomAoCentralizar = 18,
    exibirCirculoPrecisao = true,
    precisaoMaximaParaCentralizar = 50,
    talhoes = [],
    ueis = [],
    ordemServicoAtiva = false,
    tempoEstabilidadeMs = 2200,
  } = opcoes;

  let marcador: any = null;
  let circuloPrecisao: any = null;
  let watchId: number | null = null;
  let ultimaPosicao: PosicaoUsuario | null = null;
  let primeiraLeituraCentralizada = false;
  let estadoConfiavel: EstadoPresencaOperacional | null = null;
  let estadoCandidato: EstadoPresencaOperacional | null = null;
  let candidatoDesde = 0;
  let anelServico: any = null;
  const inicioPulsoServico = performance.now();

  const painel = document.createElement("div");
  painel.style.cssText =
    "margin:0 12px 16px;padding:9px 14px;max-width:360px;border:1px solid rgba(255,255,255,.35);border-radius:14px;background:rgba(15,23,42,.88);box-shadow:0 8px 24px rgba(15,23,42,.25);backdrop-filter:blur(8px);color:white;font:600 12px system-ui,sans-serif;text-align:left";
  mapa.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(painel);

  const chaveEstado = (estado: EstadoPresencaOperacional) =>
    `${estado.status}:${estado.talhaoId ?? ""}:${estado.ueiId ?? ""}`;

  const aplicarVisual = (
    estado: EstadoPresencaOperacional,
    coordenada: { lat: number; lng: number },
  ) => {
    const dentro = estado.status === "dentro";
    const impreciso = estado.status === "gps_impreciso";
    const cor = impreciso ? "#94a3b8" : dentro ? "#facc15" : "#2563eb";
    marcador?.setIcon({
      path: google.maps.SymbolPath.CIRCLE,
      scale: 7,
      fillColor: cor,
      fillOpacity: impreciso ? 0.65 : 1,
      strokeColor: "#ffffff",
      strokeOpacity: 1,
      strokeWeight: 2.5,
    });
    circuloPrecisao?.setOptions({
      fillColor: cor,
      strokeColor: cor,
    });
    if (ordemServicoAtiva && dentro) {
      if (!anelServico) {
        anelServico = new google.maps.Circle({
          map: mapa,
          center: coordenada,
          radius: 12,
          clickable: false,
          fillOpacity: 0,
          strokeColor: "#facc15",
          strokeOpacity: 0.8,
          strokeWeight: 3,
          zIndex: 998,
        });
      }
      anelServico.setCenter(coordenada);
      anelServico.setMap(mapa);
    } else {
      anelServico?.setMap(null);
    }

    painel.replaceChildren();
    const adicionarLinha = (
      texto: string,
      estilo: Partial<CSSStyleDeclaration> = {},
      destaque = false,
    ) => {
      const linha = document.createElement(destaque ? "strong" : "span");
      linha.textContent = texto;
      Object.assign(linha.style, estilo);
      linha.style.display = "block";
      painel.appendChild(linha);
    };

    if (impreciso) {
      adicionarLinha("GPS impreciso — posição não confirmada", {}, true);
      adicionarLinha(
        `Precisão aproximada: ${Math.round(estado.precisaoMetros)} m`,
        { opacity: "0.75" },
      );
    } else if (dentro) {
      adicionarLinha("Área operacional ativa", {}, true);
      adicionarLinha(`Talhão: ${estado.talhaoNome ?? "não identificado"}`, {
        opacity: "0.82",
      });
      adicionarLinha(`UEI: ${estado.ueiCodigo ?? "não identificada"}`, {
        color: "#fde047",
      });
      if (ordemServicoAtiva) {
        adicionarLinha("Serviço em execução", { color: "#86efac" });
      }
    } else {
      adicionarLinha("Fora da área operacional", {}, true);
      adicionarLinha("Nenhuma UEI identificada", { opacity: "0.75" });
    }
  };

  const animacaoServico = window.setInterval(() => {
    if (!anelServico || document.hidden) return;
    const progresso =
      ((performance.now() - inicioPulsoServico) % 1800) / 1800;
    anelServico.setRadius(9 + progresso * 16);
    anelServico.setOptions({
      strokeOpacity: 0.85 * (1 - progresso),
    });
  }, 100);

  const centralizar = () => {
    if (!ultimaPosicao) {
      return;
    }

    mapa.panTo({
      lat: ultimaPosicao.lat,
      lng: ultimaPosicao.lng,
    });

    const zoomAtual =
      mapa.getZoom() ?? 0;

    if (zoomAtual < zoomAoCentralizar) {
      mapa.setZoom(zoomAoCentralizar);
    }
  };

  if (
    typeof navigator !== "undefined" &&
    navigator.geolocation
  ) {
    watchId =
      navigator.geolocation.watchPosition(
        (position) => {
          const {
            latitude,
            longitude,
            accuracy,
          } = position.coords;

          if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
          ) {
            return;
          }

          ultimaPosicao = {
            lat: latitude,
            lng: longitude,

            accuracy:
              Number.isFinite(accuracy)
                ? accuracy
                : 0,
          };

          const coordenada = {
            lat: latitude,
            lng: longitude,
          };

          const calculado = resolverPresencaOperacional(
            ultimaPosicao,
            talhoes,
            ueis,
            GPS_PRECISAO_MAXIMA_METROS,
          );
          let visual = calculado;
          if (calculado.status === "gps_impreciso") {
            visual = calculado;
          } else if (!estadoConfiavel) {
            estadoConfiavel = calculado;
          } else if (chaveEstado(calculado) !== chaveEstado(estadoConfiavel)) {
            if (
              !estadoCandidato ||
              chaveEstado(estadoCandidato) !== chaveEstado(calculado)
            ) {
              estadoCandidato = calculado;
              candidatoDesde = Date.now();
            } else if (Date.now() - candidatoDesde >= tempoEstabilidadeMs) {
              estadoConfiavel = calculado;
              estadoCandidato = null;
            }
            visual = estadoConfiavel;
          } else {
            estadoCandidato = null;
            estadoConfiavel = calculado;
          }

          if (!marcador) {
            marcador =
              new google.maps.Marker({
                position: coordenada,
                map: mapa,
                clickable: false,
                title: "Sua localização",
                zIndex: 1000,

                icon: {
                  path:
                    google.maps.SymbolPath
                      .CIRCLE,

                  scale: 7,
                  fillColor: "#2563eb",
                  fillOpacity: 1,
                  strokeColor: "#ffffff",
                  strokeOpacity: 1,
                  strokeWeight: 2.5,
                },
              });
          } else {
            marcador.setPosition(
              coordenada,
            );

            marcador.setMap(mapa);
          }

          marcador.setTitle(
            `Sua localização · precisão aproximada de ${Math.round(
              ultimaPosicao.accuracy,
            )} m`,
          );

          if (exibirCirculoPrecisao) {
            if (!circuloPrecisao) {
              circuloPrecisao =
                new google.maps.Circle({
                  map: mapa,
                  center: coordenada,

                  radius: Math.max(
                    ultimaPosicao.accuracy,
                    3,
                  ),

                  clickable: false,
                  fillColor: "#3b82f6",
                  fillOpacity: 0.1,
                  strokeColor: "#60a5fa",
                  strokeOpacity: 0.45,
                  strokeWeight: 1,
                  zIndex: 999,
                });
            } else {
              circuloPrecisao.setCenter(
                coordenada,
              );

              circuloPrecisao.setRadius(
                Math.max(
                  ultimaPosicao.accuracy,
                  3,
                ),
              );

              circuloPrecisao.setMap(
                mapa,
              );
            }
          }

          aplicarVisual(visual, coordenada);

          if (
            centralizarNaPrimeiraLeitura &&
            !primeiraLeituraCentralizada &&
            ultimaPosicao.accuracy <=
              precisaoMaximaParaCentralizar
          ) {
            primeiraLeituraCentralizada =
              true;

            centralizar();
          }
        },

        (error) => {
          if (
            error.code !==
            error.PERMISSION_DENIED
          ) {
            console.warn(
              "Não foi possível atualizar a localização no mapa:",
              error.message,
            );
          }
        },

        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 5000,
        },
      );
  }

  return {
    centralizar,

    limpar: () => {
      window.clearInterval(animacaoServico);
      if (
        watchId !== null &&
        typeof navigator !== "undefined" &&
        navigator.geolocation
      ) {
        navigator.geolocation.clearWatch(
          watchId,
        );
      }

      marcador?.setMap(null);
      circuloPrecisao?.setMap(null);
      anelServico?.setMap(null);
      painel.remove();

      marcador = null;
      circuloPrecisao = null;
      ultimaPosicao = null;
      watchId = null;
      anelServico = null;
    },
  };
}
