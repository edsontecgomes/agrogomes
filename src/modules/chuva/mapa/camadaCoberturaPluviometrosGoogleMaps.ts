import type {
  ChuvaComunitaria,
  Pluviometro,
} from "../../../types";

export const RAIO_COBERTURA_PLUVIOMETRO_METROS = 500;

export type ControleCamadaCoberturaPluviometros = {
  limpar: () => void;
};

function iconePluviometro() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 42 42"><circle cx="21" cy="21" r="19" fill="#0369a1" stroke="white" stroke-width="3"/><path d="M14 10h14l-2.8 21h-8.4L14 10Z" fill="#e0f2fe" stroke="#7dd3fc" stroke-width="1.5"/><path d="M16.2 16h9.6M17 21h8M17.7 26h6.6" stroke="#0369a1" stroke-width="1.6"/><path d="M10 13c0-2 2-4 4-5M32 13c0-2-2-4-4-5" fill="none" stroke="#7dd3fc" stroke-width="1.7" stroke-linecap="round"/></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function dataValida(valor: unknown): Date | null {
  if (valor instanceof Date && Number.isFinite(valor.getTime())) {
    return valor;
  }
  if (typeof valor === "object" && valor !== null && "toDate" in valor) {
    const data = (valor as { toDate: () => Date }).toDate();
    return Number.isFinite(data.getTime()) ? data : null;
  }
  if (typeof valor === "string" || typeof valor === "number") {
    const data = new Date(valor);
    return Number.isFinite(data.getTime()) ? data : null;
  }
  return null;
}

function resumoPluviometro(
  pluviometro: Pluviometro,
  leituras: ChuvaComunitaria[],
) {
  const ordenadas = [...leituras].sort(
    (a, b) =>
      (dataValida(b.timestamp)?.getTime() ?? 0) -
      (dataValida(a.timestamp)?.getTime() ?? 0),
  );
  const ultima = ordenadas[0];
  const dataUltima = ultima ? dataValida(ultima.timestamp) : null;
  const verificacao = dataValida(pluviometro.ultimaVerificacaoEm);
  const referencia = verificacao ?? dataUltima;
  const diasSemVerificar = referencia
    ? Math.max(0, Math.floor((Date.now() - referencia.getTime()) / 86400000))
    : null;
  const confiabilidade = Math.max(
    0,
    Math.min(
      100,
      pluviometro.indiceConfiabilidade ??
        ultima?.confiabilidade ??
        (ultima ? 80 : 0),
    ),
  );
  const situacao =
    pluviometro.situacaoOperacional ??
    (ultima ? "operacional" : "sem_leitura");

  return { ultima, dataUltima, diasSemVerificar, confiabilidade, situacao };
}

function criarConteudo(
  pluviometro: Pluviometro,
  leituras: ChuvaComunitaria[],
) {
  const resumo = resumoPluviometro(pluviometro, leituras);
  const raiz = document.createElement("div");
  raiz.style.cssText =
    "min-width:220px;padding:8px;color:#0f172a;font-family:system-ui,sans-serif";
  const titulo = document.createElement("strong");
  titulo.textContent = pluviometro.nome;
  titulo.style.cssText = "display:block;font-size:14px;margin-bottom:8px";
  raiz.appendChild(titulo);

  const linhas = [
    `Identificação: ${pluviometro.id}`,
    resumo.ultima
      ? `Última leitura: ${resumo.ultima.mm.toFixed(1)} mm`
      : "Última leitura: sem registros",
    `Data: ${resumo.dataUltima?.toLocaleString("pt-BR") ?? "não informada"}`,
    `Confiabilidade: ${Math.round(resumo.confiabilidade)}%`,
    `Desde a verificação: ${resumo.diasSemVerificar ?? "—"} dia(s)`,
    `Situação: ${resumo.situacao.replaceAll("_", " ")}`,
    "Cobertura visual: raio de 500 m",
  ];
  linhas.forEach((texto) => {
    const linha = document.createElement("div");
    linha.textContent = texto;
    linha.style.cssText = "font-size:12px;margin-top:4px;color:#475569";
    raiz.appendChild(linha);
  });
  return raiz;
}

export function criarCamadaCoberturaPluviometrosGoogleMaps(
  google: any,
  mapa: any,
  pluviometros: Pluviometro[],
  chuvas: ChuvaComunitaria[],
): ControleCamadaCoberturaPluviometros {
  const elementos: any[] = [];
  const listeners: any[] = [];
  const radares: Array<{ circulo: any; fase: number }> = [];
  const info = new google.maps.InfoWindow();

  pluviometros.forEach((pluviometro, indice) => {
    const centro = {
      lat: pluviometro.location.lat,
      lng: pluviometro.location.lng,
    };
    const leituras = chuvas.filter(
      (chuva) => chuva.pluviometroId === pluviometro.id,
    );
    const cobertura = new google.maps.Circle({
      map: mapa,
      center: centro,
      radius: RAIO_COBERTURA_PLUVIOMETRO_METROS,
      clickable: false,
      fillColor: "#38bdf8",
      fillOpacity: 0.1,
      strokeColor: "#0284c7",
      strokeOpacity: 0.45,
      strokeWeight: 1,
      zIndex: 4,
    });
    elementos.push(cobertura);

    for (let pulso = 0; pulso < 2; pulso += 1) {
      const circulo = new google.maps.Circle({
        map: mapa,
        center: centro,
        radius: 1,
        clickable: false,
        fillColor: "#0ea5e9",
        fillOpacity: 0,
        strokeColor: "#38bdf8",
        strokeOpacity: 0.65,
        strokeWeight: 1.5,
        zIndex: 5,
      });
      elementos.push(circulo);
      radares.push({ circulo, fase: (indice * 0.17 + pulso * 0.5) % 1 });
    }

    const marcador = new google.maps.Marker({
      map: mapa,
      position: centro,
      title: `Pluviômetro: ${pluviometro.nome}`,
      zIndex: 20,
      icon: {
        url: iconePluviometro(),
        scaledSize: new google.maps.Size(42, 42),
        anchor: new google.maps.Point(21, 21),
      },
    });
    elementos.push(marcador);
    listeners.push(
      marcador.addListener("click", () => {
        info.setContent(criarConteudo(pluviometro, leituras));
        info.open({ map: mapa, anchor: marcador });
      }),
    );
  });

  const inicio = performance.now();
  const animacao = window.setInterval(() => {
    if (document.hidden) return;
    const tempo = ((performance.now() - inicio) % 6000) / 6000;
    radares.forEach(({ circulo, fase }) => {
      const progresso = (tempo + fase) % 1;
      circulo.setRadius(
        Math.max(1, progresso * RAIO_COBERTURA_PLUVIOMETRO_METROS),
      );
      circulo.setOptions({
        strokeOpacity: 0.7 * (1 - progresso),
      });
    });
  }, 140);

  return {
    limpar: () => {
      window.clearInterval(animacao);
      listeners.forEach((listener) => listener.remove());
      elementos.forEach((elemento) => elemento.setMap(null));
      info.close();
    },
  };
}
