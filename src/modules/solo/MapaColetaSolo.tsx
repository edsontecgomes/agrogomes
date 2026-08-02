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
  onSelecionar,
}: {
  ueis: UEIEspacial[];
  talhoes: Talhao[];
  pontos: PontoColetaSolo[];
  estados: Record<string, EstadoVisualPontoSolo>;
  onSelecionar: (ponto: PontoColetaSolo) => void;
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
          title: pontoColeta.codigo,
          label: {
            text: `P${pontoColeta.ordem}`,
            color: estado === "nao_visitado" ? "#0f172a" : "#ffffff",
            fontSize: "10px",
            fontWeight: "800",
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: estado === "dentro_raio" ? 10 : 8,
            fillColor: cor,
            fillOpacity: 1,
            strokeColor: "#0f172a",
            strokeWeight: 1.5,
          },
          zIndex: 30,
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
  }, [estados, onSelecionar, pontos, talhoes, ueis]);

  return <div ref={ref} className="h-[58vh] min-h-[460px] w-full rounded-3xl bg-slate-900" />;
}
