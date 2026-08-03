import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Download,
  FlaskConical,
  MapPin,
  Navigation,
} from "lucide-react";

import { useTalhoes } from "../../hooks/useTalhoes";
import { auth } from "../../services/firebase";
import { calcularDistancia, GPS_PRECISAO_MAXIMA_METROS } from "../../utils/geoUtils";
import { buscarUEIsDaFazenda } from "../motorEspacial/buscarUEIsDaFazenda";
import type { UEIEspacial } from "../motorEspacial/types";
import {
  comporAmostraUEI,
  listarColetasSolo,
  obterOuCriarPontosPermanentes,
  registrarColetaSolo,
} from "./coletaSoloService";
import { gerarPontosColetaUEI } from "./gerarPontosColetaUEI";
import { MapaColetaSolo, type EstadoVisualPontoSolo } from "./MapaColetaSolo";
import { baixarRotaColetaSoloGPX } from "./exportarRotaColetaGPX";
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
  const { talhoes, loading: carregandoTalhoes } = useTalhoes(farmId);
  const [ueis, setUeis] = useState<UEIEspacial[]>([]);
  const [coletas, setColetas] = useState<RegistroColetaSolo[]>([]);
  const [talhaoId, setTalhaoId] = useState("");
  const [ueiId, setUeiId] = useState("");
  const [pontos, setPontos] = useState<PontoColetaSolo[]>([]);
  const [carregandoPontos, setCarregandoPontos] = useState(false);
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
    setUeis([]);
    setColetas([]);
    setTalhaoId("");
    setUeiId("");
    setPontos([]);
    setPontoSelecionado(null);
    void buscarUEIsDaFazenda(farmId)
      .then(setUeis)
      .catch(() => {
        setUeis([]);
        setMensagem("Não foi possível carregar as UEIs cadastradas da fazenda.");
      });
    void listarColetasSolo(farmId).then(setColetas).catch(() => setColetas([]));
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

  useEffect(() => {
    if (carregandoTalhoes) return;
    if (talhoes.length === 0) {
      setTalhaoId("");
      return;
    }
    const atualExiste = talhoes.some((talhao) => talhao.id === talhaoId);
    const atualTemUEI = ueis.some((uei) => uei.talhaoId === talhaoId);
    const existeTalhaoComUEI = talhoes.some((talhao) =>
      ueis.some((uei) => uei.talhaoId === talhao.id),
    );
    if (atualExiste && (atualTemUEI || !existeTalhaoComUEI)) return;
    const primeiroComUEI = talhoes.find((talhao) =>
      ueis.some((uei) => uei.talhaoId === talhao.id),
    );
    setTalhaoId((primeiroComUEI ?? talhoes[0]).id);
  }, [carregandoTalhoes, talhaoId, talhoes, ueis]);

  const talhaoSelecionado = useMemo(
    () => talhoes.find((talhao) => talhao.id === talhaoId) ?? null,
    [talhaoId, talhoes],
  );
  const ueisDoTalhao = useMemo(
    () =>
      ueis
        .filter((uei) => uei.talhaoId === talhaoId)
        .sort((a, b) => {
          const numeroA = a.numero ?? Number.MAX_SAFE_INTEGER;
          const numeroB = b.numero ?? Number.MAX_SAFE_INTEGER;
          if (numeroA !== numeroB) return numeroA - numeroB;
          return (a.codigo ?? a.nome ?? a.id).localeCompare(
            b.codigo ?? b.nome ?? b.id,
          );
        }),
    [talhaoId, ueis],
  );

  useEffect(() => {
    if (ueisDoTalhao.some((uei) => uei.id === ueiId)) return;
    setUeiId(ueisDoTalhao[0]?.id ?? "");
    setPontoSelecionado(null);
  }, [ueiId, ueisDoTalhao]);

  const ueiSelecionada = useMemo(
    () => ueisDoTalhao.find((uei) => uei.id === ueiId) ?? null,
    [ueiId, ueisDoTalhao],
  );

  useEffect(() => {
    let ativo = true;
    setPontoSelecionado(null);
    if (ueisDoTalhao.length === 0) {
      setPontos([]);
      setCarregandoPontos(false);
      return () => {
        ativo = false;
      };
    }
    setCarregandoPontos(true);
    void Promise.all(
      ueisDoTalhao.map(async (uei, indiceUEI) => {
        const candidatos = gerarPontosColetaUEI(uei);
        const permanentes = await obterOuCriarPontosPermanentes({
          farmId,
          ueiId: uei.id,
          candidatos,
        });
        return permanentes
          .sort((a, b) => a.ordem - b.ordem)
          .map((ponto, indicePonto) => ({
            ...ponto,
            ordemRotaTalhao: indiceUEI * 5 + indicePonto + 1,
          }));
      }),
    )
      .then((grupos) => {
        if (ativo) setPontos(grupos.flat());
      })
      .catch(() => {
        if (ativo) {
          setPontos([]);
          setMensagem(
            "Não foi possível preparar todos os pontos da rota de coleta.",
          );
        }
      })
      .finally(() => {
        if (ativo) setCarregandoPontos(false);
      });
    return () => {
      ativo = false;
    };
  }, [farmId, ueisDoTalhao]);

  const pontosDaUeiSelecionada = useMemo(
    () => pontos.filter((ponto) => ponto.ueiId === ueiSelecionada?.id),
    [pontos, ueiSelecionada?.id],
  );

  const concluidos = useMemo(
    () =>
      new Set(
        coletas
          .filter((coleta) => coleta.ueiId === ueiSelecionada?.id)
          .filter((coleta) => coleta.profundidade === profundidade)
          .map((coleta) => coleta.pontoColetaId),
      ),
    [coletas, profundidade, ueiSelecionada?.id],
  );
  const ordenados = useMemo(
    () => {
      const principal = pontosDaUeiSelecionada.find((ponto) => ponto.principal);
      const demais = pontosDaUeiSelecionada.filter((ponto) => !ponto.principal).sort((a, b) => {
        if (!posicao) return a.ordem - b.ordem;
        const da = calcularDistancia(posicao.lat, posicao.lng, a.coordenadaPlanejada.lat, a.coordenadaPlanejada.lng);
        const db = calcularDistancia(posicao.lat, posicao.lng, b.coordenadaPlanejada.lat, b.coordenadaPlanejada.lng);
        return da - db;
      });
      return principal ? [principal, ...demais] : demais;
    },
    [pontosDaUeiSelecionada, posicao],
  );
  const principalPendente = pontosDaUeiSelecionada.find(
    (ponto) => ponto.principal && !concluidos.has(ponto.id),
  );
  const proximo =
    principalPendente ??
    ordenados.find((ponto) => !concluidos.has(ponto.id)) ??
    null;
  const distanciaSelecionada = pontoSelecionado && posicao
    ? calcularDistancia(posicao.lat, posicao.lng, pontoSelecionado.coordenadaPlanejada.lat, pontoSelecionado.coordenadaPlanejada.lng)
    : null;
  const estados = useMemo(() => {
    const resultado: Record<string, EstadoVisualPontoSolo> = {};
    const concluidosNoTalhao = new Set(
      coletas
        .filter((coleta) => coleta.profundidade === profundidade)
        .map((coleta) => coleta.pontoColetaId),
    );
    pontos.forEach((ponto) => {
      if (concluidosNoTalhao.has(ponto.id)) resultado[ponto.id] = "concluido";
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
  }, [coletas, pontos, posicao, profundidade, proximo]);

  const selecionar = useCallback((ponto: PontoColetaSolo) => {
    setUeiId(ponto.ueiId);
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
      pontoPrincipal: pontoSelecionado.principal,
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

  const coletasCompostas = pontosDaUeiSelecionada
    .map((ponto) => coletas.find((coleta) => coleta.pontoColetaId === ponto.id && coleta.profundidade === profundidade))
    .filter((coleta): coleta is RegistroColetaSolo => Boolean(coleta));
  const pontoPrincipal =
    pontosDaUeiSelecionada.find((ponto) => ponto.principal) ?? null;
  const coletaPrincipal = pontoPrincipal
    ? coletasCompostas.find((coleta) => coleta.pontoColetaId === pontoPrincipal.id) ?? null
    : null;
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
        <p className="mt-2 text-slate-500">
          Selecione um talhão cadastrado e uma de suas UEIs reais. O P01 central é
          a referência principal das cinco subamostras que compõem a amostra da UEI.
        </p>
      </div>

      {!carregandoTalhoes && talhoes.length === 0 && (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
          <strong className="text-amber-950">Nenhum talhão cadastrado nesta fazenda.</strong>
          <p className="mt-2 text-sm text-amber-800">
            Cadastre e finalize o processamento de um talhão antes de planejar a
            coleta de solo. Este núcleo não cria uma cartografia paralela.
          </p>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {talhaoSelecionado && ueisDoTalhao.length > 0 ? (
          <MapaColetaSolo
            ueis={ueisDoTalhao}
            talhoes={[talhaoSelecionado]}
            pontos={pontos}
            estados={estados}
            ueiSelecionadaId={ueiSelecionada?.id ?? null}
            posicaoUsuario={posicao}
            onSelecionar={selecionar}
            onSelecionarUEI={setUeiId}
          />
        ) : (
          <div className="flex h-[58vh] min-h-[460px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-100 p-8 text-center">
            <div>
              <MapPin className="mx-auto h-10 w-10 text-slate-400" />
              <strong className="mt-4 block text-slate-800">Mapa de coleta indisponível</strong>
              <p className="mt-2 max-w-md text-sm text-slate-500">
                Selecione um talhão cadastrado que já possua UEIs geradas para abrir
                sua cartografia real e planejar as subamostras.
              </p>
            </div>
          </div>
        )}
        <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-500">Talhão cadastrado</label>
          <select
            value={talhaoId}
            onChange={(evento) => setTalhaoId(evento.target.value)}
            disabled={carregandoTalhoes || talhoes.length === 0}
            className="w-full rounded-xl border border-slate-200 p-3 font-bold disabled:bg-slate-100"
          >
            {talhoes.map((talhao) => (
              <option key={talhao.id} value={talhao.id}>
                {talhao.nome} · {Number(talhao.areaHa ?? talhao.area ?? 0).toFixed(2)} ha
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={carregandoPontos || pontos.length === 0 || !talhaoSelecionado}
            onClick={() => {
              if (!talhaoSelecionado) return;
              baixarRotaColetaSoloGPX({
                nomeTalhao: talhaoSelecionado.nome,
                pontos,
              });
              setMensagem(
                `Rota GPX exportada com ${pontos.length} pontos para uso em GPS de mão.`,
              );
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 font-black text-slate-950 shadow-sm transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download className="h-5 w-5" />
            Exportar rota GPX
          </button>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900">
            <strong className="block text-sm">Rota preparada para uso offline</strong>
            <span className="mt-1 block">
              {carregandoPontos
                ? "Carregando as UEIs e os pontos deste talhão..."
                : `${ueisDoTalhao.length} UEIs e ${pontos.length} pontos disponíveis neste aparelho.`}
            </span>
          </div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-500">UEI em coleta</label>
          <select
            value={ueiId}
            onChange={(evento) => setUeiId(evento.target.value)}
            disabled={ueisDoTalhao.length === 0}
            className="w-full rounded-xl border border-slate-200 p-3 font-bold disabled:bg-slate-100"
          >
            {ueisDoTalhao.map((uei) => (
              <option key={uei.id} value={uei.id}>
                {uei.codigo ?? uei.nome ?? uei.id} · {uei.areaHa.toFixed(2)} ha
              </option>
            ))}
          </select>
          {talhaoSelecionado && ueisDoTalhao.length === 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Este talhão ainda não possui UEIs processadas. Finalize a geração das
              unidades no módulo Talhões; o núcleo de solos usará exatamente essas
              mesmas divisões.
            </div>
          )}
          {ueiSelecionada && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="block text-slate-500">UEIs no talhão</span>
                <strong className="mt-1 block text-base text-slate-900">{ueisDoTalhao.length}</strong>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="block text-slate-500">Área da UEI</span>
                <strong className="mt-1 block text-base text-slate-900">{ueiSelecionada.areaHa.toFixed(2)} ha</strong>
              </div>
            </div>
          )}
          <label className="block text-xs font-black uppercase tracking-wider text-slate-500">Profundidade</label>
          <select value={profundidade} onChange={(evento) => setProfundidade(evento.target.value as ProfundidadeSolo)} className="w-full rounded-xl border border-slate-200 p-3">
            <option value="0_10">0–10 cm</option><option value="10_20">10–20 cm</option><option value="20_30">20–30 cm</option>
          </select>
          <div className="rounded-2xl bg-slate-950 p-4 text-white">
            <div className="flex items-center gap-2 text-sm font-black"><Navigation className="h-4 w-4 text-yellow-300" /> Próximo ponto</div>
            <div className="mt-2 text-lg font-black">
              {carregandoPontos ? "Carregando pontos..." : proximo?.codigo ?? "Etapa concluída"}
            </div>
            {proximo?.principal && (
              <div className="mt-1 text-xs font-bold text-yellow-300">Ponto central principal da UEI</div>
            )}
            {proximo && posicao && <div className="mt-1 text-xs text-slate-300">Distância: {Math.round(calcularDistancia(posicao.lat, posicao.lng, proximo.coordenadaPlanejada.lat, proximo.coordenadaPlanejada.lng))} m</div>}
          </div>
          <div className="space-y-2">
            {ordenados.map((ponto) => (
              <button key={ponto.id} onClick={() => selecionar(ponto)} className={`flex w-full items-center justify-between rounded-xl border p-3 text-left ${pontoSelecionado?.id === ponto.id ? "border-blue-500 bg-blue-50" : "border-slate-200"}`}>
                <span>
                  <strong className="block text-sm">
                    P{String(ponto.ordemRotaTalhao ?? ponto.ordem).padStart(2, "0")} · {ponto.codigo}
                  </strong>
                  <span className="text-xs text-slate-500">
                    {ponto.principal ? "Ponto central principal" : "Subamostra complementar"} · raio de {ponto.raioOperacionalMetros} m
                  </span>
                </span>
                {concluidos.has(ponto.id) ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <MapPin className="h-5 w-5 text-slate-400" />}
              </button>
            ))}
          </div>
        </aside>
      </div>

      {pontoSelecionado && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3"><FlaskConical className="h-6 w-6 text-amber-500" /><div><h2 className="font-black">Confirmar {pontoSelecionado.codigo}</h2>{pontoSelecionado.principal && <p className="text-xs font-black uppercase tracking-wider text-amber-600">Ponto central principal da amostra composta</p>}<p className="text-xs text-slate-500">Distância atual: {distanciaSelecionada === null ? "—" : `${distanciaSelecionada.toFixed(1)} m`} · GPS: {posicao ? `${Math.round(posicao.accuracy)} m` : "indisponível"}</p></div></div>
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
        <div><strong className="block text-emerald-950">Amostra composta da UEI real</strong><span className="text-sm text-emerald-800">{coletasCompostas.length}/5 subamostras concluídas em {profundidade.replace("_", "–")} cm. {coletaPrincipal ? "P01 central registrado." : "P01 central ainda pendente."}</span></div>
        <button disabled={coletasCompostas.length !== 5 || !coletaPrincipal || !pontoPrincipal || !auth.currentUser || !ueiSelecionada} onClick={() => ueiSelecionada && pontoPrincipal && coletaPrincipal && auth.currentUser && void comporAmostraUEI({ farmId, talhaoId: ueiSelecionada.talhaoId, ueiId: ueiSelecionada.id, profundidade, coletaIds: coletasCompostas.map((item) => item.id), pontoPrincipalId: pontoPrincipal.id, coletaPrincipalId: coletaPrincipal.id, usuarioId: auth.currentUser.uid }).then(() => setMensagem("Amostra composta criada e vinculada ao talhão, à UEI e ao P01 central."))} className="rounded-xl bg-emerald-700 px-5 py-3 font-black text-white disabled:opacity-40">Compor amostra</button>
      </section>
      {mensagem && <div className="fixed bottom-5 left-1/2 z-[300] -translate-x-1/2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-2xl">{mensagem}</div>}
    </div>
  );
}
