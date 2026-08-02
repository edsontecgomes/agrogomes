import { useEffect, useRef } from "react";

import { loadGoogleMaps } from "../../services/googleMaps";
import type { Talhao } from "../../types";
import {
  ControleCamadaUEIGoogleMaps,
  criarCamadaUEIGoogleMaps,
} from "../motorEspacial/camadaUEIGoogleMaps";
import type { UEIEspacial } from "../motorEspacial/types";
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

export function MapaColetaSolo({
  ueis,
  talhoes,
  pontos,
  estados,
  ueiSelecionadaId,
  onSelecionar,
  onSelecionarUEI,
}: {
  ueis: UEIEspacial[];
  talhoes: Talhao[];
  pontos: PontoColetaSolo[];
  estados: Record<string, EstadoVisualPontoSolo>;
  ueiSelecionadaId: string | null;
  onSelecionar: (ponto: PontoColetaSolo) => void;
  onSelecionarUEI: (ueiId: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let ativo = true;
    let camada: ControleCamadaUEIGoogleMaps | null = null;
    const elementos: any[] = [];
    const listeners: any[] = [];
    loadGoogleMaps().then((google) => {
      if (!ativo || !ref.current) return;
      const mapa = new google.maps.Map(ref.current, {
        center: pontos[0]?.coordenadaPlanejada ?? { lat: -14.235, lng: -51.925 },
        zoom: pontos.length ? 18 : 4,
        mapTypeId: "satellite",
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });
      camada = criarCamadaUEIGoogleMaps(google, mapa, ueis, {
        ajustarEnquadramento: ueis.length > 0,
        talhoes,
        centralizarUsuarioNaPrimeiraLeitura: true,
      });
      ueis.forEach((uei) => {
        const selecionada = uei.id === ueiSelecionadaId;
        const seletor = new google.maps.Polygon({
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
        elementos.push(seletor);
        listeners.push(
          seletor.addListener("click", () => onSelecionarUEI(uei.id)),
        );
      });
      pontos.forEach((pontoColeta) => {
        const estado = estados[pontoColeta.id] ?? "nao_visitado";
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
            text: pontoColeta.principal ? "P1" : `P${pontoColeta.ordem}`,
            color: estado === "nao_visitado" ? "#0f172a" : "#ffffff",
            fontSize: "10px",
            fontWeight: "800",
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: pontoColeta.principal
              ? estado === "dentro_raio"
                ? 13
                : 11
              : estado === "dentro_raio"
                ? 10
                : 8,
            fillColor: cor,
            fillOpacity: 1,
            strokeColor: pontoColeta.principal ? "#f59e0b" : "#0f172a",
            strokeWeight: pontoColeta.principal ? 3 : 1.5,
          },
          zIndex: pontoColeta.principal ? 40 : 30,
        });
        elementos.push(microarea, marcador);
        listeners.push(
          marcador.addListener("click", () => onSelecionar(pontoColeta)),
        );
      });
    });
    return () => {
      ativo = false;
      camada?.limpar();
      elementos.forEach((elemento) => elemento.setMap(null));
      listeners.forEach((listener) => listener.remove());
    };
  }, [
    estados,
    onSelecionar,
    onSelecionarUEI,
    pontos,
    talhoes,
    ueiSelecionadaId,
    ueis,
  ]);

  return <div ref={ref} className="h-[58vh] min-h-[460px] w-full rounded-3xl bg-slate-900" />;
}
