import { UEIEspacial } from "./types";

import {
  ControleLocalizacaoUsuarioGoogleMaps,
  criarCamadaLocalizacaoUsuarioGoogleMaps,
} from "./camadaLocalizacaoUsuarioGoogleMaps";

type CamadaUEIGoogleMapsOpcoes = {
  ajustarEnquadramento?: boolean;
  zoomRotuloResumido?: number;
  zoomRotuloCompleto?: number;
  exibirLocalizacaoUsuario?: boolean;
  centralizarUsuarioNaPrimeiraLeitura?: boolean;
};

export type ControleCamadaUEIGoogleMaps = {
  limpar: () => void;
};

function obterCentroide(
  google: any,
  uei: UEIEspacial,
) {
  if (
    uei.centroide &&
    Number.isFinite(uei.centroide.lat) &&
    Number.isFinite(uei.centroide.lng)
  ) {
    return {
      lat: uei.centroide.lat,
      lng: uei.centroide.lng,
    };
  }

  const limites =
    new google.maps.LatLngBounds();

  uei.geometria.forEach((ponto) => {
    limites.extend({
      lat: ponto.lat,
      lng: ponto.lng,
    });
  });

  const centro =
    limites.getCenter();

  return {
    lat: centro.lat(),
    lng: centro.lng(),
  };
}

function codigoResumido(
  uei: UEIEspacial,
): string {
  if (typeof uei.numero === "number") {
    return `UEI ${String(
      uei.numero,
    ).padStart(3, "0")}`;
  }

  return (
    uei.codigo ??
    uei.nome ??
    "UEI"
  );
}

function codigoCompleto(
  uei: UEIEspacial,
): string {
  return (
    uei.codigo ??
    uei.nome ??
    uei.id
  );
}

function criarConteudoInfo(
  uei: UEIEspacial,
): HTMLDivElement {
  const conteudo =
    document.createElement("div");

  conteudo.style.padding = "8px";
  conteudo.style.color = "#0f172a";
  conteudo.style.fontFamily =
    "sans-serif";

  const titulo =
    document.createElement("strong");

  titulo.textContent =
    codigoCompleto(uei);

  titulo.style.display = "block";
  titulo.style.marginBottom = "4px";

  const area =
    document.createElement("span");

  area.textContent =
    `${uei.areaHa.toFixed(2)} ha`;

  area.style.color = "#475569";
  area.style.fontSize = "12px";

  const zona =
    document.createElement("span");

  zona.textContent =
    uei.zonaTalhao ===
    "faixa_avaliacao_bordadura"
      ? "Célula de bordadura"
      : "Núcleo produtivo";

  zona.style.display = "block";
  zona.style.marginTop = "4px";
  zona.style.color =
    uei.zonaTalhao ===
    "faixa_avaliacao_bordadura"
      ? "#b45309"
      : "#047857";
  zona.style.fontSize = "11px";
  zona.style.fontWeight = "700";

  conteudo.append(
    titulo,
    area,
    zona,
  );

  return conteudo;
}

export function criarCamadaUEIGoogleMaps(
  google: any,
  mapa: any,
  ueis: UEIEspacial[],
  opcoes: CamadaUEIGoogleMapsOpcoes = {},
): ControleCamadaUEIGoogleMaps {
  const {
    ajustarEnquadramento = false,
    zoomRotuloResumido = 17,
    zoomRotuloCompleto = 19,
    exibirLocalizacaoUsuario = true,
    centralizarUsuarioNaPrimeiraLeitura =
      false,
  } = opcoes;

  const poligonos: any[] = [];
  const rotulos: any[] = [];
  const listeners: any[] = [];

  const limites =
    new google.maps.LatLngBounds();

  const infoWindow =
    new google.maps.InfoWindow();

  let controleLocalizacao:
    ControleLocalizacaoUsuarioGoogleMaps | null =
    null;

  if (exibirLocalizacaoUsuario) {
    controleLocalizacao =
      criarCamadaLocalizacaoUsuarioGoogleMaps(
        google,
        mapa,
        {
          centralizarNaPrimeiraLeitura:
            centralizarUsuarioNaPrimeiraLeitura,
        },
      );
  }

  ueis.forEach((uei) => {
    const pertenceFaixaAvaliacao =
      uei.zonaTalhao ===
      "faixa_avaliacao_bordadura";

    const corBase =
      pertenceFaixaAvaliacao
        ? "#f59e0b"
        : "#10b981";

    const caminho =
      uei.geometria.map(
        (ponto) => ({
          lat: ponto.lat,
          lng: ponto.lng,
        }),
      );

    caminho.forEach((ponto) => {
      limites.extend(ponto);
    });

    const poligono =
      new google.maps.Polygon({
        paths: caminho,
        map: mapa,
        clickable: true,

        fillColor: corBase,
        fillOpacity:
          pertenceFaixaAvaliacao
            ? 0.1
            : 0.045,

        strokeColor: "#f8fafc",
        strokeOpacity: 0.8,
        strokeWeight: 1,

        zIndex: 3,
      });

    const rotulo =
      new google.maps.Marker({
        position: obterCentroide(
          google,
          uei,
        ),

        map: mapa,
        clickable: false,
        visible: false,
        zIndex: 4,

        icon: {
          path:
            google.maps.SymbolPath
              .CIRCLE,

          scale: 0,
        },

        label: {
          text:
            codigoResumido(uei),

          color: "#ffffff",
          fontSize: "11px",
          fontWeight: "700",
        },
      });

    listeners.push(
      poligono.addListener(
        "mouseover",
        () => {
          poligono.setOptions({
            fillColor: "#facc15",
            fillOpacity: 0.14,
            strokeColor: "#fde047",
            strokeOpacity: 0.9,
            strokeWeight: 1.5,
          });
        },
      ),

      poligono.addListener(
        "mouseout",
        () => {
          poligono.setOptions({
            fillColor: corBase,
            fillOpacity:
              pertenceFaixaAvaliacao
                ? 0.1
                : 0.045,
            strokeColor: "#f8fafc",
            strokeOpacity: 0.8,
            strokeWeight: 1,
          });
        },
      ),

      poligono.addListener(
        "click",
        (evento: any) => {
          infoWindow.setContent(
            criarConteudoInfo(uei),
          );

          infoWindow.setPosition(
            evento.latLng,
          );

          infoWindow.open(mapa);
        },
      ),
    );

    poligonos.push(poligono);

    rotulos.push({
      marcador: rotulo,
      uei,
    });
  });

  const atualizarRotulos = () => {
    const zoom =
      mapa.getZoom() ?? 0;

    rotulos.forEach(
      ({ marcador, uei }) => {
        marcador.setVisible(
          zoom >=
            zoomRotuloResumido,
        );

        marcador.setLabel({
          text:
            zoom >=
            zoomRotuloCompleto
              ? codigoCompleto(uei)
              : codigoResumido(uei),

          color: "#ffffff",

          fontSize:
            zoom >=
            zoomRotuloCompleto
              ? "12px"
              : "11px",

          fontWeight: "700",
        });
      },
    );
  };

  listeners.push(
    mapa.addListener(
      "zoom_changed",
      atualizarRotulos,
    ),
  );

  atualizarRotulos();

  if (
    ajustarEnquadramento &&
    !limites.isEmpty()
  ) {
    mapa.fitBounds(
      limites,
      36,
    );
  }

  return {
    limpar: () => {
      listeners.forEach(
        (listener) => {
          listener.remove();
        },
      );

      poligonos.forEach(
        (poligono) => {
          poligono.setMap(null);
        },
      );

      rotulos.forEach(
        ({ marcador }) => {
          marcador.setMap(null);
        },
      );

      infoWindow.close();

      controleLocalizacao?.limpar();
      controleLocalizacao = null;
    },
  };
}
