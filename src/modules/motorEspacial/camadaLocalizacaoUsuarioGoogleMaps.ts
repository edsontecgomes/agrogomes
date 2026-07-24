export type OpcoesLocalizacaoUsuarioGoogleMaps = {
  centralizarNaPrimeiraLeitura?: boolean;
  zoomAoCentralizar?: number;
  exibirCirculoPrecisao?: boolean;
  precisaoMaximaParaCentralizar?: number;
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
  } = opcoes;

  let marcador: any = null;
  let circuloPrecisao: any = null;
  let watchId: number | null = null;
  let ultimaPosicao: PosicaoUsuario | null = null;
  let primeiraLeituraCentralizada = false;

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

      marcador = null;
      circuloPrecisao = null;
      ultimaPosicao = null;
      watchId = null;
    },
  };
}