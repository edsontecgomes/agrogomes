import {
  useEffect,
  useRef,
} from "react";

import { loadGoogleMaps } from "../../services/googleMaps";
import type {
  FazendaCartografica,
  TalhaoCartografico,
  UEICartografica,
} from "./cartografiaGlobalTypes";

type MapaGlobalGoogleMapsProps = {
  fazendas: FazendaCartografica[];
  talhoes: TalhaoCartografico[];
  ueis: UEICartografica[];
  farmIdSelecionada: string | null;
  onSelecionarFazenda: (farmId: string) => void;
};

function elementoInfo(
  titulo: string,
  linhas: string[],
) {
  const raiz = document.createElement("div");
  raiz.style.padding = "8px";
  raiz.style.fontFamily = "sans-serif";
  raiz.style.color = "#0f172a";

  const cabecalho = document.createElement("strong");
  cabecalho.textContent = titulo;
  cabecalho.style.display = "block";
  cabecalho.style.marginBottom = "6px";
  raiz.appendChild(cabecalho);

  linhas.forEach((texto) => {
    const linha = document.createElement("div");
    linha.textContent = texto;
    linha.style.fontSize = "12px";
    linha.style.marginTop = "3px";
    raiz.appendChild(linha);
  });

  return raiz;
}

export function MapaGlobalGoogleMaps({
  fazendas,
  talhoes,
  ueis,
  farmIdSelecionada,
  onSelecionarFazenda,
}: MapaGlobalGoogleMapsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ativo = true;
    const sobreposicoes: Array<{
      setMap: (mapa: null) => void;
    }> = [];
    const listeners: Array<{ remove: () => void }> = [];

    loadGoogleMaps().then((google) => {
      if (!ativo || !containerRef.current) {
        return;
      }

      const mapa = new google.maps.Map(containerRef.current, {
        center: { lat: -14.235, lng: -51.925 },
        zoom: 4,
        mapTypeId: "satellite",
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });
      const limites = new google.maps.LatLngBounds();
      const info = new google.maps.InfoWindow();
      const fazendasVisiveis = farmIdSelecionada
        ? fazendas.filter(
            (fazenda) => fazenda.id === farmIdSelecionada,
          )
        : fazendas;
      const idsVisiveis = new Set(
        fazendasVisiveis.map((fazenda) => fazenda.id),
      );

      talhoes
        .filter((talhao) => idsVisiveis.has(talhao.farmId))
        .forEach((talhao) => {
          if (talhao.coordenadas.length < 3) return;

          talhao.coordenadas.forEach((ponto) =>
            limites.extend(ponto),
          );
          const poligono = new google.maps.Polygon({
            map: mapa,
            paths: talhao.coordenadas,
            fillColor: "#10b981",
            fillOpacity: 0.08,
            strokeColor: "#34d399",
            strokeOpacity: 0.95,
            strokeWeight: 2,
            zIndex: 2,
          });
          sobreposicoes.push(poligono);
          listeners.push(
            poligono.addListener("click", (evento: any) => {
              const totalUEIs = ueis.filter(
                (uei) => uei.talhaoId === talhao.id,
              ).length;
              info.setContent(
                elementoInfo(talhao.nome, [
                  `Área do talhão: ${talhao.areaHa.toFixed(2)} ha`,
                  `UEIs geradas: ${totalUEIs}`,
                ]),
              );
              info.setPosition(evento.latLng);
              info.open(mapa);
            }),
          );
        });

      ueis
        .filter((uei) => idsVisiveis.has(uei.farmId))
        .forEach((uei) => {
          if (uei.geometria.length < 3) return;

          const bordadura =
            uei.zonaTalhao ===
            "faixa_avaliacao_bordadura";
          const poligono = new google.maps.Polygon({
            map: mapa,
            paths: uei.geometria,
            fillColor: bordadura ? "#f59e0b" : "#0ea5e9",
            fillOpacity: bordadura ? 0.12 : 0.045,
            strokeColor: "#f8fafc",
            strokeOpacity: 0.82,
            strokeWeight: 1,
            zIndex: 3,
          });
          sobreposicoes.push(poligono);

          if (uei.centroide) {
            const rotulo = new google.maps.Marker({
              map: mapa,
              position: uei.centroide,
              clickable: true,
              zIndex: 6,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 0,
              },
              label: {
                text: uei.codigo,
                color: "#ffffff",
                fontSize: "10px",
                fontWeight: "700",
              },
            });
            sobreposicoes.push(rotulo);
            listeners.push(
              rotulo.addListener("click", () => {
                info.setContent(
                  elementoInfo(uei.codigo, [
                    `Área da UEI: ${uei.areaHa.toFixed(2)} ha`,
                    bordadura
                      ? "Zona: bordadura"
                      : "Zona: núcleo produtivo",
                  ]),
                );
                info.open({ map: mapa, anchor: rotulo });
              }),
            );
          }
        });

      fazendasVisiveis.forEach((fazenda) => {
        if (!fazenda.centroide) return;

        limites.extend(fazenda.centroide);
        const quantidadeTalhoes = talhoes.filter(
          (talhao) => talhao.farmId === fazenda.id,
        ).length;
        const marcador = new google.maps.Marker({
          map: mapa,
          position: fazenda.centroide,
          title: fazenda.nome,
          zIndex: 10,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#f59e0b",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          },
        });
        sobreposicoes.push(marcador);
        listeners.push(
          marcador.addListener("click", () => {
            onSelecionarFazenda(fazenda.id);
            info.setContent(
              elementoInfo(fazenda.nome, [
                `Talhões: ${quantidadeTalhoes}`,
                [fazenda.municipio, fazenda.estado]
                  .filter(Boolean)
                  .join(" · "),
              ]),
            );
            info.open({ map: mapa, anchor: marcador });
          }),
        );
      });

      if (!limites.isEmpty()) {
        mapa.fitBounds(limites, 48);
      }
    });

    return () => {
      ativo = false;
      listeners.forEach((listener) => listener.remove());
      sobreposicoes.forEach((item) => item.setMap(null));
    };
  }, [
    farmIdSelecionada,
    fazendas,
    onSelecionarFazenda,
    talhoes,
    ueis,
  ]);

  return (
    <div
      ref={containerRef}
      className="h-[68vh] min-h-[480px] w-full rounded-3xl bg-slate-900"
    />
  );
}
