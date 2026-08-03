import { useEffect, useMemo, useRef, useState } from "react";

import { loadGoogleMaps } from "../../services/googleMaps";
import type { Talhao } from "../../types";
import {
  ControleCamadaUEIGoogleMaps,
  criarCamadaUEIGoogleMaps,
} from "../motorEspacial/camadaUEIGoogleMaps";
import type { UEIEspacial } from "../motorEspacial/types";
import { rotuloWaypointSolo } from "./exportarRotaColetaGPX";
import type { PontoColetaSolo } from "./types";

export type EstadoVisualPontoSolo =
  | "nao_visitado"
  | "proximo"
  | "dentro_raio"
  | "concluido"
  | "gps_impreciso"
  | "inconsistente";

const CORES: Record<EstadoVisualPontoSolo, string> = {
  nao_visitado: "#ffffff",
  proximo: "#facc15",
  dentro_raio: "#2563eb",
  concluido: "#22c55e",
  gps_impreciso: "#94a3b8",
  inconsistente: "#ef4444",
};

type PosicaoMapa = { lat: number; lng: number } | null;

export function MapaColetaSolo({
  ueis,
  talhoes,
  pontos,
  estados,
  ueiSelecionadaId,
  posicaoUsuario = null,
  onSelecionar,
  onSelecionarUEI,
}: {
  ueis: UEIEspacial[];
  talhoes: Talhao[];
  pontos: PontoColetaSolo[];
  estados: Record<string, EstadoVisualPontoSolo>;
  ueiSelecionadaId: string | null;
  posicaoUsuario?: PosicaoMapa;
  onSelecionar: (ponto: PontoColetaSolo) => void;
  onSelecionarUEI: (ueiId: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const googleRef = useRef<any>(null);
  const mapaRef = useRef<any>(null);
  const seletoresRef = useRef<Array<{ ueiId: string; poligono: any }>>([]);
  const marcadoresRef = useRef<
    Array<{ ponto: PontoColetaSolo; marcador: any; microarea: any }>
  >([]);
  const onSelecionarRef = useRef(onSelecionar);
  const onSelecionarUEIRef = useRef(onSelecionarUEI);
  const estadosRef = useRef(estados);
  const ueiSelecionadaRef = useRef(ueiSelecionadaId);
  const [online, setOnline] = useState(() => navigator.onLine);
  const [falhaMapa, setFalhaMapa] = useState(false);

  useEffect(() => {
    onSelecionarRef.current = onSelecionar;
    onSelecionarUEIRef.current = onSelecionarUEI;
  }, [onSelecionar, onSelecionarUEI]);

  useEffect(() => {
    estadosRef.current = estados;
    ueiSelecionadaRef.current = ueiSelecionadaId;
    const google = googleRef.current;
    if (!google) return;

    seletoresRef.current.forEach(({ ueiId, poligono }) => {
      const selecionada = ueiId === ueiSelecionadaId;
      poligono.setOptions({
        fillColor: selecionada ? "#f59e0b" : "#0f172a",
        fillOpacity: selecionada ? 0.12 : 0.01,
        strokeColor: selecionada ? "#fbbf24" : "#e2e8f0",
        strokeOpacity: selecionada ? 1 : 0.28,
        strokeWeight: selecionada ? 3 : 1,
        zIndex: selecionada ? 18 : 10,
      });
    });

    marcadoresRef.current.forEach(({ ponto, marcador, microarea }) => {
      const estado = estados[ponto.id] ?? "nao_visitado";
      const cor = CORES[estado];
      microarea.setOptions({ fillColor: cor, strokeColor: cor });
      marcador.setIcon({
        path: google.maps.SymbolPath.CIRCLE,
        scale: ponto.principal
          ? estado === "dentro_raio"
            ? 13
            : 11
          : estado === "dentro_raio"
            ? 10
            : 8,
        fillColor: cor,
        fillOpacity: 1,
        strokeColor: ponto.principal ? "#f59e0b" : "#0f172a",
        strokeWeight: ponto.principal ? 3 : 1.5,
      });
      marcador.setLabel({
        text: rotuloWaypointSolo(ponto, 0),
        color: estado === "nao_visitado" ? "#0f172a" : "#ffffff",
        fontSize: "10px",
        fontWeight: "800",
      });
    });
  }, [estados, ueiSelecionadaId]);

  useEffect(() => {
    const aoConectar = () => setOnline(true);
    const aoDesconectar = () => setOnline(false);
    window.addEventListener("online", aoConectar);
    window.addEventListener("offline", aoDesconectar);
    return () => {
      window.removeEventListener("online", aoConectar);
      window.removeEventListener("offline", aoDesconectar);
    };
  }, []);

  useEffect(() => {
    if (!online || !ref.current) return;
    let ativo = true;
    let camada: ControleCamadaUEIGoogleMaps | null = null;
    const elementos: any[] = [];
    const listeners: any[] = [];
    setFalhaMapa(false);

    void loadGoogleMaps()
      .then((google) => {
        if (!ativo || !ref.current) return;
        googleRef.current = google;
        const mapa = new google.maps.Map(ref.current, {
          center: pontos[0]?.coordenadaPlanejada ?? {
            lat: -14.235,
            lng: -51.925,
          },
          zoom: pontos.length ? 18 : 4,
          mapTypeId: "satellite",
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });
        mapaRef.current = mapa;

        camada = criarCamadaUEIGoogleMaps(google, mapa, ueis, {
          ajustarEnquadramento: false,
          talhoes,
          centralizarUsuarioNaPrimeiraLeitura: false,
        });

        const limites = new google.maps.LatLngBounds();
        talhoes.forEach((talhao) =>
          (talhao.coordenadas ?? []).forEach((coordenada) =>
            limites.extend({ lat: coordenada.lat, lng: coordenada.lng }),
          ),
        );
        if (limites.isEmpty()) {
          ueis.forEach((uei) =>
            uei.geometria.forEach((coordenada) => limites.extend(coordenada)),
          );
        }
        if (!limites.isEmpty()) mapa.fitBounds(limites, 48);

        seletoresRef.current = ueis.map((uei) => {
          const selecionada = uei.id === ueiSelecionadaRef.current;
          const poligono = new google.maps.Polygon({
            map: mapa,
            paths: uei.geometria,
            clickable: true,
            fillColor: selecionada ? "#f59e0b" : "#0f172a",
            fillOpacity: selecionada ? 0.12 : 0.01,
            strokeColor: selecionada ? "#fbbf24" : "#e2e8f0",
            strokeOpacity: selecionada ? 1 : 0.28,
            strokeWeight: selecionada ? 3 : 1,
            zIndex: selecionada ? 18 : 10,
          });
          elementos.push(poligono);
          listeners.push(
            poligono.addListener("click", () =>
              onSelecionarUEIRef.current(uei.id),
            ),
          );
          return { ueiId: uei.id, poligono };
        });

        marcadoresRef.current = pontos.map((pontoColeta, indice) => {
          const estado = estadosRef.current[pontoColeta.id] ?? "nao_visitado";
          const cor = CORES[estado];
          const microarea = new google.maps.Circle({
            map: mapa,
            center: pontoColeta.coordenadaPlanejada,
            radius: pontoColeta.raioOperacionalMetros,
            fillColor: cor,
            fillOpacity: 0.16,
            strokeColor: cor,
            strokeOpacity: 0.85,
            strokeWeight: 1,
            clickable: false,
          });
          const marcador = new google.maps.Marker({
            map: mapa,
            position: pontoColeta.coordenadaPlanejada,
            title: pontoColeta.principal
              ? `${pontoColeta.codigo} · ponto central principal`
              : pontoColeta.codigo,
            label: {
              text: rotuloWaypointSolo(pontoColeta, indice),
              color: estado === "nao_visitado" ? "#0f172a" : "#ffffff",
              fontSize: "10px",
              fontWeight: "800",
            },
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: pontoColeta.principal ? 11 : 8,
              fillColor: cor,
              fillOpacity: 1,
              strokeColor: pontoColeta.principal ? "#f59e0b" : "#0f172a",
              strokeWeight: pontoColeta.principal ? 3 : 1.5,
            },
            zIndex: pontoColeta.principal ? 40 : 30,
          });
          elementos.push(microarea, marcador);
          listeners.push(
            marcador.addListener("click", () =>
              onSelecionarRef.current(pontoColeta),
            ),
          );
          return { ponto: pontoColeta, marcador, microarea };
        });
      })
      .catch(() => {
        if (ativo) setFalhaMapa(true);
      });

    return () => {
      ativo = false;
      camada?.limpar();
      elementos.forEach((elemento) => elemento.setMap(null));
      listeners.forEach((listener) => listener.remove());
      seletoresRef.current = [];
      marcadoresRef.current = [];
      googleRef.current = null;
      mapaRef.current = null;
    };
  }, [online, pontos, talhoes, ueis]);

  const desenhoOffline = useMemo(() => {
    const coordenadas = [
      ...talhoes.flatMap((talhao) => talhao.coordenadas ?? []),
      ...ueis.flatMap((uei) => uei.geometria),
      ...pontos.map((ponto) => ponto.coordenadaPlanejada),
    ];
    if (coordenadas.length === 0) return null;
    const latitudes = coordenadas.map((ponto) => ponto.lat);
    const longitudes = coordenadas.map((ponto) => ponto.lng);
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    const margem = 42;
    const largura = 1000 - margem * 2;
    const altura = 700 - margem * 2;
    const projetar = ({ lat, lng }: { lat: number; lng: number }) => ({
      x: margem + ((lng - minLng) / Math.max(maxLng - minLng, 0.000001)) * largura,
      y: margem + ((maxLat - lat) / Math.max(maxLat - minLat, 0.000001)) * altura,
    });
    return { projetar };
  }, [pontos, talhoes, ueis]);

  const exibirOffline = !online || falhaMapa;

  return (
    <div className="relative h-[58vh] min-h-[460px] w-full overflow-hidden rounded-3xl bg-slate-900">
      <div ref={ref} className={exibirOffline ? "hidden" : "h-full w-full"} />
      {exibirOffline && desenhoOffline && (
        <div className="relative h-full w-full bg-slate-950">
          <svg
            viewBox="0 0 1000 700"
            className="h-full w-full"
            role="img"
            aria-label="Mapa vetorial offline da rota de coleta"
          >
            <rect width="1000" height="700" fill="#07111f" />
            {ueis.map((uei) => (
              <polygon
                key={uei.id}
                points={uei.geometria
                  .map((coordenada) => {
                    const ponto = desenhoOffline.projetar(coordenada);
                    return `${ponto.x},${ponto.y}`;
                  })
                  .join(" ")}
                fill={uei.id === ueiSelecionadaId ? "#f59e0b2e" : "#10b98114"}
                stroke={uei.id === ueiSelecionadaId ? "#fbbf24" : "#e2e8f0"}
                strokeWidth={uei.id === ueiSelecionadaId ? 4 : 1.5}
                onClick={() => onSelecionarUEI(uei.id)}
              />
            ))}
            {pontos.map((ponto, indice) => {
              const posicao = desenhoOffline.projetar(ponto.coordenadaPlanejada);
              const estado = estados[ponto.id] ?? "nao_visitado";
              return (
                <g
                  key={ponto.id}
                  onClick={() => onSelecionar(ponto)}
                  className="cursor-pointer"
                >
                  <circle cx={posicao.x} cy={posicao.y} r="13" fill={CORES[estado]} stroke={ponto.principal ? "#f59e0b" : "#0f172a"} strokeWidth={ponto.principal ? 4 : 2} />
                  <text x={posicao.x} y={posicao.y + 4} textAnchor="middle" fontSize="10" fontWeight="800" fill={estado === "nao_visitado" ? "#0f172a" : "#ffffff"}>
                    {rotuloWaypointSolo(ponto, indice)}
                  </text>
                </g>
              );
            })}
            {posicaoUsuario && (() => {
              const atual = desenhoOffline.projetar(posicaoUsuario);
              return <circle cx={atual.x} cy={atual.y} r="10" fill="#2563eb" stroke="#ffffff" strokeWidth="4" />;
            })()}
          </svg>
          <div className="absolute left-4 top-4 rounded-xl bg-slate-950/85 px-3 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg">
            Mapa vetorial offline · rota disponível
          </div>
        </div>
      )}
      {exibirOffline && !desenhoOffline && (
        <div className="flex h-full items-center justify-center p-8 text-center text-sm font-bold text-slate-300">
          Cartografia ainda não carregada neste aparelho.
        </div>
      )}
    </div>
  );
}
