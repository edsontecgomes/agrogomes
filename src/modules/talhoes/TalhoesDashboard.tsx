import React, {
  useEffect,
  useState,
} from "react";

import {
  ChevronRight,
  FlaskConical,
  MapPin,
  RotateCcw,
} from "lucide-react";

import type {
  Talhao,
} from "../../features/map/types/map.types";

import {
  useChuvasComunitarias,
} from "../../hooks/useChuvasComunitarias";

import {
  useFarmProducerId,
} from "../../hooks/useFarmProducerId";

import {
  usePluviometros,
} from "../../hooks/usePluviometros";

import {
  useTalhoes,
} from "../../hooks/useTalhoes";

import {
  useUsuarioProfile,
} from "../../hooks/useUsuarios";

import {
  auth,
} from "../../services/firebase";

import {
  TalhaoEditorV2,
} from "./TalhaoEditorV2";

import {
  TalhaoHistorico,
} from "./TalhaoHistorico";

import {
  TalhaoMapEditor,
} from "./TalhaoMapEditor";

interface TalhoesDashboardProps {
  farmId: string;
}

type VersaoEditor =
  | "v2"
  | "legado";

export function TalhoesDashboard({
  farmId,
}: TalhoesDashboardProps) {
  const {
    talhoes,
    loading: loadingTalhoes,
  } = useTalhoes(farmId);

  const {
    pluviometros,
  } = usePluviometros(farmId);

  const {
    chuvasComunitarias,
  } = useChuvasComunitarias(
    farmId,
  );

  const {
    usuario,
    loading: loadingUser,
  } = useUsuarioProfile(
    auth.currentUser?.uid ?? null,
  );

  const {
    producerId,
    loading: loadingProducerId,
  } = useFarmProducerId(farmId);

  const [
    selectedTalhao,
    setSelectedTalhao,
  ] = useState<Talhao | null>(
    null,
  );

  const [
    versaoEditor,
    setVersaoEditor,
  ] = useState<VersaoEditor>(
    "v2",
  );

  useEffect(() => {
    if (!selectedTalhao) {
      return;
    }

    const talhaoAtualizado =
      talhoes.find(
        (talhao) =>
          talhao.id ===
          selectedTalhao.id,
      );

    if (!talhaoAtualizado) {
      setSelectedTalhao(null);

      return;
    }

    if (
      talhaoAtualizado !==
      selectedTalhao
    ) {
      setSelectedTalhao(
        talhaoAtualizado,
      );
    }
  }, [
    selectedTalhao,
    talhoes,
  ]);

  const loading =
    loadingTalhoes ||
    loadingUser ||
    loadingProducerId;

  const userRole =
    usuario?.role ??
    "colaborador";

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 pb-20">
      <header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Gestão de Talhões
            </h1>

            {versaoEditor === "v2" && (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                Editor V2 ativo
              </span>
            )}
          </div>

          <p className="mt-2 text-slate-500">
            Desenhe e gerencie as áreas da sua fazenda.
          </p>
        </div>

        <div className="flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() =>
              setVersaoEditor("v2")
            }
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition ${
              versaoEditor === "v2"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <FlaskConical className="h-4 w-4" />

            Editor V2
          </button>

          <button
            type="button"
            onClick={() =>
              setVersaoEditor(
                "legado",
              )
            }
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition ${
              versaoEditor === "legado"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <RotateCcw className="h-4 w-4" />

            Editor antigo
          </button>
        </div>
      </header>

      {versaoEditor === "v2" ? (
        <>
          {producerId ? (
            <TalhaoEditorV2
              farmId={farmId}
              producerId={
                producerId
              }
              userRole={userRole}
              talhoes={talhoes}
              selectedTalhao={
                selectedTalhao
              }
              onSelectTalhao={
                setSelectedTalhao
              }
            />
          ) : (
            <section className="rounded-3xl border border-rose-200 bg-rose-50 p-8 shadow-sm">
              <div className="mx-auto max-w-2xl text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-rose-600 shadow-sm">
                  <MapPin className="h-7 w-7" />
                </div>

                <h2 className="mt-5 text-xl font-black text-rose-900">
                  Produtor da fazenda não identificado
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-rose-700">
                  O Editor V2 precisa do producerId da fazenda para vincular corretamente o talhão, as UEIs e os GDAs.
                </p>

                <p className="mt-3 rounded-xl border border-rose-200 bg-white px-4 py-3 text-xs font-semibold text-rose-700">
                  Verifique se o cadastro da fazenda possui o campo producerId corretamente preenchido.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setVersaoEditor(
                      "legado",
                    )
                  }
                  className="mt-6 rounded-xl bg-rose-700 px-5 py-3 text-sm font-black text-white transition hover:bg-rose-800"
                >
                  Abrir editor antigo
                </button>
              </div>
            </section>
          )}
        </>
      ) : (
        <section className="space-y-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <p className="text-sm font-bold text-amber-900">
              Editor legado temporariamente ativo
            </p>

            <p className="mt-1 text-xs leading-relaxed text-amber-700">
              Esse editor permanece disponível apenas durante a validação do novo fluxo. Ele não utiliza integralmente o pipeline de UEIs e GDAs.
            </p>
          </div>

          <TalhaoMapEditor
            talhoes={talhoes}
            farmId={farmId}
            userRole={userRole}
            selectedTalhao={
              selectedTalhao
            }
            onSelectTalhao={
              setSelectedTalhao
            }
          />
        </section>
      )}

      {talhoes.length === 0 && (
        <section className="mx-auto max-w-2xl rounded-[32px] border border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
            <MapPin className="h-8 w-8 text-amber-600" />
          </div>

          <h2 className="mb-2 text-xl font-bold text-amber-900">
            Primeiros Passos com Mapas
          </h2>

          <p className="mx-auto mb-8 max-w-md text-amber-700">
            Você ainda não mapeou seus talhões. Utilize o Editor V2 acima para desenhar o primeiro limite físico da fazenda.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() =>
                setVersaoEditor("v2")
              }
              className="rounded-xl bg-amber-600 px-6 py-3 font-bold text-white transition-all active:scale-95"
            >
              Iniciar mapeamento
            </button>
          </div>
        </section>
      )}

      {selectedTalhao && (
        <TalhaoHistorico
          talhao={selectedTalhao}
          onClose={() =>
            setSelectedTalhao(null)
          }
        />
      )}

      <section>
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Talhões cadastrados
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Selecione um talhão para visualizar seu Diário Agronômico.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest">
            <span className="rounded-lg bg-slate-100 px-3 py-2 text-slate-600">
              {talhoes.length} talhões
            </span>

            <span className="rounded-lg bg-blue-50 px-3 py-2 text-blue-700">
              {pluviometros.length} pluviômetros
            </span>

            <span className="rounded-lg bg-cyan-50 px-3 py-2 text-cyan-700">
              {chuvasComunitarias.length} chuvas
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {talhoes.map(
            (talhao) => {
              const selecionado =
                selectedTalhao?.id ===
                talhao.id;

              return (
                <button
                  key={talhao.id}
                  type="button"
                  onClick={() =>
                    setSelectedTalhao(
                      talhao,
                    )
                  }
                  className={`group rounded-3xl border bg-white p-6 text-left shadow-sm transition-all hover:border-emerald-200 hover:shadow-md ${
                    selecionado
                      ? "border-emerald-400 ring-2 ring-emerald-100"
                      : "border-slate-100"
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between gap-4">
                    <h3 className="font-bold text-slate-800 transition-colors group-hover:text-emerald-600">
                      {talhao.nome}
                    </h3>

                    <span className="whitespace-nowrap rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {(
                        talhao.areaHa ??
                        talhao.area ??
                        0
                      ).toFixed(2)}{" "}
                      ha
                    </span>
                  </div>

                  <p className="mb-4 truncate text-xs text-slate-500">
                    Área mapeada e vinculada à Memória Agronômica.
                  </p>

                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                    Ver Diário Agronômico

                    <ChevronRight className="h-3 w-3" />
                  </div>
                </button>
              );
            },
          )}
        </div>
      </section>
    </div>
  );
}