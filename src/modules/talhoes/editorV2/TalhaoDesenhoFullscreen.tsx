import { useEffect } from "react";
import {
  ArrowLeft,
  Eraser,
  Redo2,
  RotateCcw,
} from "lucide-react";

import type {
  LatLng,
  Talhao,
} from "../../../features/map/types/map.types";

import { TalhaoMapCanvasV2 } from "./TalhaoMapCanvasV2";

export type TalhaoDesenhoFullscreenProps = {
  talhoes: Talhao[];
  coordenadas: LatLng[];
  areaHa: number;

  onChangeCoordenadas(
    coordenadas: LatLng[],
  ): void;

  onAreaCalculada(
    areaHa: number,
  ): void;

  onDesfazer(): void;
  onLimpar(): void;
  onCancelar(): void;
  onAvancar(): void;
};

export function TalhaoDesenhoFullscreen({
  talhoes,
  coordenadas,
  areaHa,
  onChangeCoordenadas,
  onAreaCalculada,
  onDesfazer,
  onLimpar,
  onCancelar,
  onAvancar,
}: TalhaoDesenhoFullscreenProps) {
  const totalPontos =
    coordenadas.length;

  const desenhoValido =
    totalPontos >= 3 &&
    areaHa > 0;

  useEffect(() => {
    const overflowAnterior =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        overflowAnterior;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-slate-950">
      <header className="flex flex-col gap-3 border-b border-white/10 bg-slate-950 px-4 py-3 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancelar}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Cancelar desenho e voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-black sm:text-base">
                Defina o limite do talhão
              </p>

              <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-300">
                Etapa 1 de 2
              </span>
            </div>

            <p className="mt-0.5 text-[11px] text-slate-300 sm:text-xs">
              Toque no mapa para marcar os vértices na ordem do perímetro.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex">
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              Pontos
            </p>

            <p className="mt-0.5 text-sm font-black text-white">
              {totalPontos}
            </p>
          </div>

          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-300">
              Área estimada
            </p>

            <p className="mt-0.5 text-sm font-black text-emerald-200">
              {areaHa.toFixed(2)} ha
            </p>
          </div>
        </div>
      </header>

      <main className="relative min-h-0 flex-1 bg-slate-900 p-0 sm:p-3">
        <div className="h-full [&>div]:h-full [&>div]:min-h-0 [&>div]:rounded-none sm:[&>div]:rounded-3xl [&>div>div:first-child]:h-full">
          <TalhaoMapCanvasV2
            mode="desenho"
            talhoes={talhoes}
            selectedTalhao={null}
            coordenadasDesenho={
              coordenadas
            }
            onSelectTalhao={() =>
              undefined
            }
            onChangeCoordenadas={
              onChangeCoordenadas
            }
            onAreaCalculada={
              onAreaCalculada
            }
          />
        </div>
      </main>

      <footer className="border-t border-white/10 bg-slate-950 px-4 py-3 text-white shadow-2xl sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <button
              type="button"
              onClick={onDesfazer}
              disabled={
                totalPontos === 0
              }
              className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-xs font-bold transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw className="h-4 w-4" />
              Desfazer ponto
            </button>

            <button
              type="button"
              onClick={onLimpar}
              disabled={
                totalPontos === 0
              }
              className="flex items-center justify-center gap-2 rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-xs font-bold text-rose-200 transition hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Eraser className="h-4 w-4" />
              Limpar tudo
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex">
            <button
              type="button"
              onClick={onCancelar}
              className="rounded-xl border border-white/15 bg-transparent px-5 py-3 text-sm font-bold text-slate-200 transition hover:bg-white/10"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={onAvancar}
              disabled={!desenhoValido}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              Seguir em frente
              <Redo2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!desenhoValido && (
          <p className="mx-auto mt-2 max-w-6xl text-center text-[11px] text-amber-300 sm:text-right">
            Marque pelo menos três pontos para liberar a próxima etapa.
          </p>
        )}
      </footer>
    </div>
  );
}