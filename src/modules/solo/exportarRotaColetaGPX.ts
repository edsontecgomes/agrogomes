import type { PontoColetaSolo } from "./types";

function escaparXml(valor: string): string {
  return valor
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function rotuloWaypointSolo(
  ponto: PontoColetaSolo,
  indice: number,
): string {
  const numero = ponto.ordemRotaTalhao ?? indice + 1;
  return `P${String(numero).padStart(2, "0")}`;
}

export function criarRotaColetaSoloGPX(params: {
  nomeFazenda?: string;
  nomeTalhao: string;
  pontos: PontoColetaSolo[];
}): string {
  const nomeRota = [params.nomeFazenda, params.nomeTalhao, "Coleta de solos"]
    .filter(Boolean)
    .join(" - ");
  const waypoints = params.pontos
    .map((ponto, indice) => {
      const rotulo = rotuloWaypointSolo(ponto, indice);
      const descricao = `${ponto.codigo} | UEI ${ponto.ueiCodigo}${
        ponto.principal ? " | ponto central da amostra composta" : ""
      }`;
      return `  <wpt lat="${ponto.coordenadaPlanejada.lat}" lon="${
        ponto.coordenadaPlanejada.lng
      }"><name>${rotulo}</name><desc>${escaparXml(descricao)}</desc><sym>Waypoint</sym></wpt>`;
    })
    .join("\n");
  const rota = params.pontos
    .map((ponto, indice) => {
      const rotulo = rotuloWaypointSolo(ponto, indice);
      return `    <rtept lat="${ponto.coordenadaPlanejada.lat}" lon="${
        ponto.coordenadaPlanejada.lng
      }"><name>${rotulo}</name></rtept>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Eqtara" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata><name>${escaparXml(nomeRota)}</name></metadata>
${waypoints}
  <rte>
    <name>${escaparXml(nomeRota)}</name>
${rota}
  </rte>
</gpx>
`;
}

function nomeArquivoSeguro(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export function baixarRotaColetaSoloGPX(params: {
  nomeFazenda?: string;
  nomeTalhao: string;
  pontos: PontoColetaSolo[];
}) {
  const conteudo = criarRotaColetaSoloGPX(params);
  const blob = new Blob([conteudo], { type: "application/gpx+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${nomeArquivoSeguro(params.nomeTalhao) || "talhao"}-rota-coleta-solos.gpx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
