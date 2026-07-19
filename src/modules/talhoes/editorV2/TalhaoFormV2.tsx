import {
  Eraser,
  MapPin,
  RotateCcw,
  Save,
  X,
} from "lucide-react";

import type {
  BordaduraTalhaoEditor,
  TalhaoFormV2Props,
} from "./types";

const OPCOES_BORDADURA:
  BordaduraTalhaoEditor[] = [
    10,
    15,
    20,
  ];

function obterClasseMensagem(
  tipo:
    TalhaoFormV2Props["mensagem"] extends infer T
      ? T extends { tipo: infer U }
        ? U
        : never
      : never,
): string {
  switch (tipo) {
    case "sucesso":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";

    case "erro":
      return "border-rose-200 bg-rose-50 text-rose-800";

    case "aviso":
      return "border-amber-200 bg-amber-50 text-amber-800";

    default:
      return "border-blue-200 bg-blue-50 text-blue-800";
  }
}

export function TalhaoFormV2({
  draft,
  loading,
  podeSalvar,
  mensagem,
  onChangeNome,
  onChangeBordadura,
  onIniciarDesenho,
  onDesfazerPonto,
  onLimparDesenho,
  onCancelar,
  onSalvar,
}: TalhaoFormV2Props) {
  const totalPontos =
    draft.coordenadas.length;

  const desenhoValido =
    totalPontos >= 3 &&
    draft.areaHa > 0;

  return (
    <aside className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <div className="flex items-start gap-3 border-b border-slate-100 pb-5">
          <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
            <MapPin className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg font-black text-slate-900">
              Novo Talhão
            </h2>

            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Desenhe o limite físico e escolha a bordadura operacional.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="talhao-v2-nome"
              className="mb-2 block text-[11px] font-black uppercase tracking-widest text-slate-500"
            >
              Nome do talhão
            </label>

            <input
              id="talhao-v2-nome"
              type="text"
              value={draft.nome}
              onChange={(event) =>
                onChangeNome(
                  event.target.value,
                )
              }
              disabled={loading}
              placeholder="Ex.: Talhão Norte 01"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div>
            <p className="mb-2 text-[11px] font-black uppercase tracking-widest text-slate-500">
              Bordadura operacional
            </p>

            <div className="grid grid-cols-3 gap-2">
              {OPCOES_BORDADURA.map(
                (percentual) => {
                  const selecionada =
                    draft.bordaduraPercentual ===
                    percentual;

                  return (
                    <button
                      key={percentual}
                      type="button"
                      disabled={loading}
                      onClick={() =>
                        onChangeBordadura(
                          percentual,
                        )
                      }
                      className={`rounded-xl border px-3 py-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        selecionada
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {percentual}%
                    </button>
                  );
                },
              )}
            </div>

            <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
              A bordadura será removida geograficamente do limite original antes da geração das UEIs.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Pontos
              </p>

              <p className="mt-2 text-2xl font-black text-slate-800">
                {totalPontos}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                Área estimada
              </p>

              <p className="mt-2 text-2xl font-black text-emerald-800">
                {draft.areaHa.toFixed(2)}
                <span className="ml-1 text-xs">
                  ha
                </span>
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold text-slate-700">
              Status do desenho
            </p>

            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {desenhoValido
                ? "Polígono válido e pronto para salvar."
                : "Adicione pelo menos três pontos no mapa para formar o talhão."}
            </p>
          </div>

          {mensagem && (
            <div
              className={`rounded-2xl border p-4 text-sm font-semibold ${obterClasseMensagem(
                mensagem.tipo,
              )}`}
            >
              {mensagem.texto}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={onIniciarDesenho}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <MapPin className="h-4 w-4" />

          {totalPontos > 0
            ? "Continuar desenho"
            : "Iniciar desenho"}
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onDesfazerPonto}
            disabled={
              loading ||
              totalPontos === 0
            }
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" />
            Desfazer
          </button>

          <button
            type="button"
            onClick={onLimparDesenho}
            disabled={
              loading ||
              totalPontos === 0
            }
            className="flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-xs font-bold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Eraser className="h-4 w-4" />
            Limpar
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            onClick={onCancelar}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            Cancelar
          </button>

          <button
            type="button"
            onClick={onSalvar}
            disabled={
              loading ||
              !podeSalvar
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />

            {loading
              ? "Salvando..."
              : "Salvar"}
          </button>
        </div>
      </div>
    </aside>
  );
}