import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Building2,
  Layers3,
  Map,
  Search,
  ShieldCheck,
} from "lucide-react";

import { carregarCartografiaGlobal } from "./cartografiaGlobalService";
import type { CartografiaGlobal } from "./cartografiaGlobalTypes";
import { MapaGlobalGoogleMaps } from "./MapaGlobalGoogleMaps";

const VAZIO: CartografiaGlobal = {
  fazendas: [],
  talhoes: [],
  ueis: [],
};

export function MapaGlobalSystemAdmin() {
  const [dados, setDados] = useState<CartografiaGlobal>(VAZIO);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [farmIdSelecionada, setFarmIdSelecionada] =
    useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    carregarCartografiaGlobal()
      .then((resultado) => {
        if (!ativo) return;
        setDados(resultado);
        setErro(null);
        setCarregando(false);
      })
      .catch((error) => {
        if (!ativo) return;
        setErro(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar a cartografia.",
        );
        setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  const fazendasFiltradas = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");

    if (!termo) return dados.fazendas;

    return dados.fazendas.filter((fazenda) =>
      [
        fazenda.nome,
        fazenda.municipio,
        fazenda.estado,
        fazenda.id,
      ]
        .filter(Boolean)
        .some((valor) =>
          String(valor)
            .toLocaleLowerCase("pt-BR")
            .includes(termo),
        ),
    );
  }, [busca, dados.fazendas]);

  const selecionarFazenda = useCallback((farmId: string) => {
    setFarmIdSelecionada(farmId);
  }, []);

  const talhoesSelecionados = farmIdSelecionada
    ? dados.talhoes.filter(
        (talhao) => talhao.farmId === farmIdSelecionada,
      )
    : dados.talhoes;
  const ueisSelecionadas = farmIdSelecionada
    ? dados.ueis.filter(
        (uei) => uei.farmId === farmIdSelecionada,
      )
    : dados.ueis;
  const areaMapeada = talhoesSelecionados.reduce(
    (total, talhao) => total + talhao.areaHa,
    0,
  );

  if (carregando) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-200 border-t-amber-500" />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1600px] space-y-5 px-4 py-6 lg:px-6">
      <header className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-amber-400">
              <ShieldCheck className="h-4 w-4" />
              Consulta exclusiva · System Admin
            </div>
            <h1 className="text-3xl font-black">Cartografia global Eqtara</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-300">
              Validação de implantação, limites de talhões e geração das UEIs. Nenhum dado técnico, operacional ou econômico é consultado neste modo.
            </p>
          </div>
          {farmIdSelecionada && (
            <button
              type="button"
              onClick={() => setFarmIdSelecionada(null)}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
            >
              Mostrar todas as fazendas
            </button>
          )}
        </div>
      </header>

      {erro && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
          {erro}
        </div>
      )}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Fazendas", farmIdSelecionada ? 1 : dados.fazendas.length, Building2],
          ["Talhões", talhoesSelecionados.length, Map],
          ["UEIs", ueisSelecionadas.length, Layers3],
          ["Área mapeada", `${areaMapeada.toFixed(1)} ha`, ShieldCheck],
        ].map(([rotulo, valor, Icone]) => {
          const Icon = Icone as typeof Building2;
          return (
            <div key={String(rotulo)} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <Icon className="mb-3 h-5 w-5 text-amber-500" />
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{String(rotulo)}</p>
              <p className="mt-1 text-2xl font-black text-slate-900">{String(valor)}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar fazenda ou município"
              className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
            />
          </label>
          <div className="mt-4 max-h-[62vh] space-y-2 overflow-y-auto pr-1">
            {fazendasFiltradas.map((fazenda) => {
              const quantidadeTalhoes = dados.talhoes.filter(
                (talhao) => talhao.farmId === fazenda.id,
              ).length;
              const quantidadeUEIs = dados.ueis.filter(
                (uei) => uei.farmId === fazenda.id,
              ).length;

              return (
                <button
                  type="button"
                  key={fazenda.id}
                  onClick={() => setFarmIdSelecionada(fazenda.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    farmIdSelecionada === fazenda.id
                      ? "border-amber-400 bg-amber-50"
                      : "border-slate-100 bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <p className="font-black text-slate-900">{fazenda.nome}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {[fazenda.municipio, fazenda.estado].filter(Boolean).join(" · ") || "Localidade não informada"}
                  </p>
                  <p className="mt-3 text-xs font-bold text-slate-600">
                    {quantidadeTalhoes} talhões · {quantidadeUEIs} UEIs
                  </p>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
          <MapaGlobalGoogleMaps
            fazendas={dados.fazendas}
            talhoes={dados.talhoes}
            ueis={dados.ueis}
            farmIdSelecionada={farmIdSelecionada}
            onSelecionarFazenda={selecionarFazenda}
          />
        </div>
      </section>
    </main>
  );
}
