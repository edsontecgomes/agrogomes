import { useEffect } from "react";
import {
  ArrowLeft,
  Check,
  Eraser,
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
    <div className="fixed inset-0 z-[200] h-[100dvh] overflow-hidden bg-slate-950">
      <main className="absolute inset-0">
        <div className="h-full [&>div]:h-full [&>div]:min-h-0 [&>div]:rounded-none [&>div]:border-0 [&>div>div:first-child]:h-full">
          <TalhaoMapCanvasV2
            mode="desenho"
            talhoes={talhoes}
            selectedTalhao={null}
            coordenadasDesenho={
              coordenadas
            }
            mostrarAjudaDesenho={false}
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

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-slate-950/95 via-slate-950/70 to-transparent px-3 pb-10 pt-3 text-white sm:px-6 sm:pt-5">
        <header className="pointer-events-auto mx-auto flex max-w-6xl items-start gap-3">
          <button
            type="button"
            onClick={onCancelar}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-slate-950/75 text-white shadow-xl backdrop-blur transition hover:bg-slate-900"
            aria-label="Cancelar desenho e voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="min-w-0 flex-1 rounded-2xl border border-white/15 bg-slate-950/75 px-3 py-2.5 shadow-xl backdrop-blur sm:px-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-sm font-black sm:text-base">
                    Defina o limite do talhão
                  </h1>

                  <span className="hidden rounded-full bg-emerald-400/15 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-300 sm:inline-flex">
                    Etapa 1 de 2
                  </span>
                </div>

                <p className="mt-0.5 truncate text-[10px] text-slate-300 sm:text-xs">
                  Toque no mapa para criar ou ajustar os vértices.
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <div className="rounded-xl bg-white/10 px-2.5 py-1.5 text-center">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                    Pontos
                  </p>
                  <p className="text-xs font-black text-white">
                    {totalPontos}
                  </p>
                </div>

                <div className="rounded-xl bg-emerald-400/15 px-2.5 py-1.5 text-center">
                  <p className="text-[8px] font-black uppercase tracking-widest text-emerald-300">
                    Área
                  </p>
                  <p className="whitespace-nowrap text-xs font-black text-emerald-200">
                    {areaHa.toFixed(2)} ha
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-12 text-white sm:px-6 sm:pb-5">
        <footer className="pointer-events-auto mx-auto max-w-6xl rounded-3xl border border-white/15 bg-slate-950/85 p-3 shadow-2xl backdrop-blur sm:flex sm:items-center sm:justify-between sm:gap-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onDesfazer}
              disabled={
                totalPontos === 0
              }
              className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-3 text-xs font-bold transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw className="h-4 w-4" />
              Desfazer último
            </button>

            <button
              type="button"
              onClick={onLimpar}
              disabled={
                totalPontos === 0
              }
              className="flex items-center justify-center gap-2 rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-3 text-xs font-bold text-rose-200 transition hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Eraser className="h-4 w-4" />
              Limpar
            </button>
          </div>

          <div className="mt-2 grid grid-cols-[0.8fr_1.2fr] gap-2 sm:mt-0 sm:min-w-[330px]">
            <button
              type="button"
              onClick={onCancelar}
              className="rounded-xl border border-white/15 bg-transparent px-3 py-3 text-xs font-bold text-slate-200 transition hover:bg-white/10"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={onAvancar}
              disabled={!desenhoValido}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-3 py-3 text-xs font-black text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              Finalizar desenho
              <Check className="h-4 w-4" />
            </button>
          </div>

          {!desenhoValido && (
            <p className="mt-2 text-center text-[10px] font-semibold text-amber-300 sm:absolute sm:bottom-full sm:right-6 sm:mb-2 sm:rounded-full sm:bg-slate-950/85 sm:px-3 sm:py-1.5">
              Marque pelo menos três pontos para avançar.
            </p>
          )}
        </footer>
      </div>
    </div>
  );
}
