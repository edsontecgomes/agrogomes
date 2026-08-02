import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, FlaskConical, MapPin, Navigation } from "lucide-react";

import { useTalhoes } from "../../hooks/useTalhoes";
import { auth } from "../../services/firebase";
import { calcularDistancia, GPS_PRECISAO_MAXIMA_METROS } from "../../utils/geoUtils";
import { buscarUEIsDaFazenda } from "../motorEspacial/buscarUEIsDaFazenda";
import type { UEIEspacial } from "../motorEspacial/types";
import {
  comporAmostraUEI,
  listarColetasSolo,
  registrarColetaSolo,
  salvarPontosPermanentes,
} from "./coletaSoloService";
import { gerarPontosColetaUEI } from "./gerarPontosColetaUEI";
import { MapaColetaSolo, type EstadoVisualPontoSolo } from "./MapaColetaSolo";
import type {
  PontoColetaSolo,
  ProfundidadeSolo,
  RegistroColetaSolo,
} from "./types";

type Posicao = { lat: number; lng: number; accuracy: number };

async function otimizarFotografia(file: File): Promise<string> {
  const origem = await new Promise<string>((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(String(leitor.result));
    leitor.onerror = () => reject(new Error("Não foi possível ler a fotografia."));
    leitor.readAsDataURL(file);
  });
  const imagem = await new Promise<HTMLImageElement>((resolve, reject) => {
    const elemento = new Image();
    elemento.onload = () => resolve(elemento);
    elemento.onerror = () => reject(new Error("Fotografia inválida."));
    elemento.src = origem;
  });
  const escala = Math.min(1, 1024 / Math.max(imagem.width, imagem.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(imagem.width * escala));
  canvas.height = Math.max(1, Math.round(imagem.height * escala));
  const contexto = canvas.getContext("2d");
  if (!contexto) throw new Error("Não foi possível preparar a fotografia.");
  contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);
  let qualidade = 0.72;
  let resultado = canvas.toDataURL("image/jpeg", qualidade);
  while (resultado.length > 450_000 && qualidade > 0.36) {
    qualidade -= 0.08;
    resultado = canvas.toDataURL("image/jpeg", qualidade);
  }
  if (resultado.length > 450_000) {
    throw new Error("A fotografia ficou grande demais. Tente outra imagem.");
  }
  return resultado;
}

export function SoloColetaDashboard({ farmId }: { farmId: string }) {
  const { talhoes } = useTalhoes(farmId);
  const [ueis, setUeis] = useState<UEIEspacial[]>([]);
  const [coletas, setColetas] = useState<RegistroColetaSolo[]>([]);
  const [ueiId, setUeiId] = useState("");
  const [pontoSelecionado, setPontoSelecionado] = useState<PontoColetaSolo | null>(null);
  const [posicao, setPosicao] = useState<Posicao | null>(null);
  const [profundidade, setProfundidade] = useState<ProfundidadeSolo>("0_10");
  const [numeroAmostra, setNumeroAmostra] = useState("");
  const [tipoAnalise, setTipoAnalise] = useState("Química e física");
  const [observacoes, setObservacoes] = useState("");
  const [fotografia, setFotografia] = useState<string | null>(null);
  const [nomeFotografia, setNomeFotografia] = useState("");
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    void buscarUEIsDaFazenda(farmId).then((resultado) => {
      setUeis(resultado);
      setUeiId((atual) => atual || resultado[0]?.id || "");
      const permanentes = resultado.flatMap((uei) => gerarPontosColetaUEI(uei));
      void salvarPontosPermanentes(permanentes).catch(console.warn);
    });
    void listarColetasSolo(farmId).then(setColetas);
  }, [farmId]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      ({ coords }) =>
        setPosicao({ lat: coords.latitude, lng: coords.longitude, accuracy: coords.accuracy }),
      () => setPosicao(null),
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  const ueiSelecionada = ueis.find((uei) => uei.id === ueiId) ?? null;
  const pontos = useMemo(
    () => (ueiSelecionada ? gerarPontosColetaUEI(ueiSelecionada) : []),
    [ueiSelecionada],
  );
  const concluidos = useMemo(
    () =>
      new Set(
        coletas
          .filter((coleta) => coleta.profundidade === profundidade)
          .map((coleta) => coleta.pontoColetaId),
      ),
    [coletas, profundidade],
  );
  const ordenados = useMemo(
    () =>
      [...pontos].sort((a, b) => {
        if (!posicao) return a.ordem - b.ordem;
        const da = calcularDistancia(posicao.lat, posicao.lng, a.coordenadaPlanejada.lat, a.coordenadaPlanejada.lng);
        const db = calcularDistancia(posicao.lat, posicao.lng, b.coordenadaPlanejada.lat, b.coordenadaPlanejada.lng);
        return da - db;
      }),
    [pontos, posicao],
  );
  const proximo = ordenados.find((ponto) => !concluidos.has(ponto.id)) ?? null;
  const distanciaSelecionada = pontoSelecionado && posicao
    ? calcularDistancia(posicao.lat, posicao.lng, pontoSelecionado.coordenadaPlanejada.lat, pontoSelecionado.coordenadaPlanejada.lng)
    : null;
  const estados = useMemo(() => {
    const resultado: Record<string, EstadoVisualPontoSolo> = {};
    pontos.forEach((ponto) => {
      if (concluidos.has(ponto.id)) resultado[ponto.id] = "concluido";
      else if (!posicao || posicao.accuracy > GPS_PRECISAO_MAXIMA_METROS) resultado[ponto.id] = "gps_impreciso";
      else {
        const distancia = calcularDistancia(posicao.lat, posicao.lng, ponto.coordenadaPlanejada.lat, ponto.coordenadaPlanejada.lng);
        resultado[ponto.id] = distancia <= ponto.raioOperacionalMetros
          ? "dentro_raio"
          : ponto.id === proximo?.id
            ? "proximo"
            : "nao_visitado";
      }
    });
    return resultado;
  }, [concluidos, pontos, posicao, proximo]);

  const selecionar = useCallback((ponto: PontoColetaSolo) => {
    setPontoSelecionado(ponto);
    setNumeroAmostra((atual) => atual || `${ponto.codigo}-${profundidade}`);
  }, [profundidade]);

  const confirmar = async () => {
    if (!pontoSelecionado || !posicao || !auth.currentUser) return;
    if (posicao.accuracy > GPS_PRECISAO_MAXIMA_METROS) {
      setMensagem("GPS impreciso. Aguarde precisão de até 20 m.");
      return;
    }
    const distancia = calcularDistancia(posicao.lat, posicao.lng, pontoSelecionado.coordenadaPlanejada.lat, pontoSelecionado.coordenadaPlanejada.lng);
    if (distancia > pontoSelecionado.raioOperacionalMetros) {
      setMensagem(`Aproxime-se do ponto: faltam ${Math.ceil(distancia - pontoSelecionado.raioOperacionalMetros)} m.`);
      return;
    }
    if (!numeroAmostra.trim()) {
      setMensagem("Informe o número da amostra.");
      return;
    }
    if (concluidos.has(pontoSelecionado.id)) {
      setMensagem("Este ponto e profundidade já foram coletados.");
      return;
    }
    const talhao = talhoes.find((item) => item.id === pontoSelecionado.talhaoId);
    const coleta: RegistroColetaSolo = {
      id: `${pontoSelecionado.id}__${profundidade}__${Date.now()}`,
      producerId: talhao?.producerId ?? auth.currentUser.uid,
      farmId,
      talhaoId: pontoSelecionado.talhaoId,
      ueiId: pontoSelecionado.ueiId,
      pontoColetaId: pontoSelecionado.id,
      pontoColetaCodigo: pontoSelecionado.codigo,
      coordenadaPlanejada: pontoSelecionado.coordenadaPlanejada,
      coordenadaReal: { lat: posicao.lat, lng: posicao.lng },
      distanciaMetros: distancia,
      precisaoGPSMetros: posicao.accuracy,
      usuarioId: auth.currentUser.uid,
      usuarioNome: auth.currentUser.displayName ?? undefined,
      coletadoEm: new Date().toISOString(),
      profundidade,
      numeroAmostra: numeroAmostra.trim(),
      tipoAnalise,
      observacoes: observacoes.trim() || undefined,
      fotografiaUrl: fotografia ?? undefined,
      origem: navigator.onLine ? "online" : "offline",
      status: "coletada",
    };
    setSalvando(true);
    try {
      const origem = await registrarColetaSolo(coleta);
      setColetas((atuais) => [...atuais, coleta]);
      setMensagem(origem === "online" ? "Coleta confirmada e georreferenciada." : "Coleta salva offline; sincronização pendente.");
      setPontoSelecionado(null);
      setNumeroAmostra("");
      setObservacoes("");
      setFotografia(null);
      setNomeFotografia("");
    } finally {
      setSalvando(false);
    }
  };

  const coletasCompostas = pontos
    .map((ponto) => coletas.find((coleta) => coleta.pontoColetaId === ponto.id && coleta.profundidade === profundidade))
    .filter((coleta): coleta is RegistroColetaSolo => Boolean(coleta));
  const historicoPonto = pontoSelecionado
    ? coletas
        .filter((coleta) => coleta.pontoColetaId === pontoSelecionado.id)
        .sort((a, b) => b.coletadoEm.localeCompare(a.coletadoEm))
    : [];

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 pb-20 sm:px-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[.2em] text-amber-600">Memória Agronômica</p>
        <h1 className="mt-1 text-3xl font-black text-slate-950">Núcleo de Coleta de Solos</h1>
        <p className="mt-2 text-slate-500">Cinco pontos permanentes por UEI, rastreados por profundidade e safra.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <MapaColetaSolo
          ueis={ueiSelecionada ? [ueiSelecionada] : []}
          talhoes={talhoes}
          pontos={pontos}
          estados={estados}
          onSelecionar={selecionar}
        />
        <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-500">UEI em coleta</label>
          <select value={ueiId} onChange={(evento) => setUeiId(evento.target.value)} className="w-full rounded-xl border border-slate-200 p-3 font-bold">
            {ueis.map((uei) => <option key={uei.id} value={uei.id}>{uei.codigo ?? uei.nome ?? uei.id}</option>)}
          </select>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-500">Profundidade</label>
          <select value={profundidade} onChange={(evento) => setProfundidade(evento.target.value as ProfundidadeSolo)} className="w-full rounded-xl border border-slate-200 p-3">
            <option value="0_10">0–10 cm</option><option value="10_20">10–20 cm</option><option value="20_30">20–30 cm</option>
          </select>
          <div className="rounded-2xl bg-slate-950 p-4 text-white">
            <div className="flex items-center gap-2 text-sm font-black"><Navigation className="h-4 w-4 text-yellow-300" /> Próximo ponto</div>
            <div className="mt-2 text-lg font-black">{proximo?.codigo ?? "Etapa concluída"}</div>
            {proximo && posicao && <div className="mt-1 text-xs text-slate-300">Distância: {Math.round(calcularDistancia(posicao.lat, posicao.lng, proximo.coordenadaPlanejada.lat, proximo.coordenadaPlanejada.lng))} m</div>}
          </div>
          <div className="space-y-2">
            {ordenados.map((ponto) => (
              <button key={ponto.id} onClick={() => selecionar(ponto)} className={`flex w-full items-center justify-between rounded-xl border p-3 text-left ${pontoSelecionado?.id === ponto.id ? "border-blue-500 bg-blue-50" : "border-slate-200"}`}>
                <span><strong className="block text-sm">{ponto.codigo}</strong><span className="text-xs text-slate-500">Raio de {ponto.raioOperacionalMetros} m</span></span>
                {concluidos.has(ponto.id) ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <MapPin className="h-5 w-5 text-slate-400" />}
              </button>
            ))}
          </div>
        </aside>
      </div>

      {pontoSelecionado && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3"><FlaskConical className="h-6 w-6 text-amber-500" /><div><h2 className="font-black">Confirmar {pontoSelecionado.codigo}</h2><p className="text-xs text-slate-500">Distância atual: {distanciaSelecionada === null ? "—" : `${distanciaSelecionada.toFixed(1)} m`} · GPS: {posicao ? `${Math.round(posicao.accuracy)} m` : "indisponível"}</p></div></div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <input value={numeroAmostra} onChange={(e) => setNumeroAmostra(e.target.value)} placeholder="Número da amostra" className="rounded-xl border border-slate-200 p-3" />
            <input value={tipoAnalise} onChange={(e) => setTipoAnalise(e.target.value)} placeholder="Tipo de análise" className="rounded-xl border border-slate-200 p-3" />
            <input value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Observações" className="rounded-xl border border-slate-200 p-3" />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="cursor-pointer rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 hover:border-blue-400">
              {nomeFotografia || "Adicionar fotografia opcional"}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(evento) => {
                  const arquivo = evento.target.files?.[0];
                  if (!arquivo) return;
                  setMensagem("Preparando fotografia...");
                  void otimizarFotografia(arquivo)
                    .then((resultado) => {
                      setFotografia(resultado);
                      setNomeFotografia(arquivo.name);
                      setMensagem("Fotografia pronta para ser vinculada à coleta.");
                    })
                    .catch((erro) => {
                      setFotografia(null);
                      setNomeFotografia("");
                      setMensagem(erro instanceof Error ? erro.message : "Fotografia inválida.");
                    });
                }}
              />
            </label>
            {fotografia && (
              <button
                type="button"
                onClick={() => {
                  setFotografia(null);
                  setNomeFotografia("");
                }}
                className="text-sm font-bold text-rose-600"
              >
                Remover fotografia
              </button>
            )}
          </div>
          <button onClick={() => void confirmar()} disabled={salvando} className="mt-4 rounded-xl bg-blue-600 px-5 py-3 font-black text-white disabled:opacity-50">{salvando ? "Salvando..." : "Confirmar coleta por GPS"}</button>
          <div className="mt-6 border-t border-slate-100 pt-5">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-500">Histórico permanente do ponto</h3>
            {historicoPonto.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">Nenhuma coleta anterior neste ponto.</p>
            ) : (
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {historicoPonto.map((coleta) => (
                  <div key={coleta.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <strong className="text-sm text-slate-900">{coleta.numeroAmostra}</strong>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(coleta.coletadoEm).toLocaleString("pt-BR")} · {coleta.profundidade.replace("_", "–")} cm
                    </p>
                    <p className="mt-2 text-xs text-slate-600">
                      Distância do ponto: {coleta.distanciaMetros.toFixed(1)} m · GPS {Math.round(coleta.precisaoGPSMetros)} m
                    </p>
                    <p className="mt-1 text-xs font-bold text-emerald-700">
                      {coleta.tipoAnalise} · {coleta.status}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
        <div><strong className="block text-emerald-950">Amostra composta da UEI</strong><span className="text-sm text-emerald-800">{coletasCompostas.length}/5 subamostras concluídas em {profundidade.replace("_", "–")} cm.</span></div>
        <button disabled={coletasCompostas.length !== 5 || !auth.currentUser || !ueiSelecionada} onClick={() => ueiSelecionada && auth.currentUser && void comporAmostraUEI({ farmId, talhaoId: ueiSelecionada.talhaoId, ueiId: ueiSelecionada.id, profundidade, coletaIds: coletasCompostas.map((item) => item.id), usuarioId: auth.currentUser.uid }).then(() => setMensagem("Amostra composta criada e vinculada à UEI."))} className="rounded-xl bg-emerald-700 px-5 py-3 font-black text-white disabled:opacity-40">Compor amostra</button>
      </section>
      {mensagem && <div className="fixed bottom-5 left-1/2 z-[300] -translate-x-1/2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-2xl">{mensagem}</div>}
    </div>
  );
}
