import {
  Edit3,
  MapPin,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";

import type {
  TalhaoFormV2Props,
} from "./types";

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
  selectedTalhao,
  editando,
  loading,
  podeGerenciar,
  podeSalvar,
  mensagem,
  onChangeNome,
  onIniciarDesenho,
  onIniciarNovoTalhao,
  onEditarTalhao,
  onExcluirTalhao,
  onCancelar,
  onSalvar,
}: TalhaoFormV2Props) {
  const totalPontos =
    draft.coordenadas.length;

  const desenhoValido =
    totalPontos >= 3 &&
    draft.areaHa > 0;

  if (!desenhoValido) {
    if (selectedTalhao) {
      const areaSelecionada =
        selectedTalhao.areaHa ??
        selectedTalhao.area ??
        0;

      return (
        <aside className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3 border-b border-slate-100 pb-5">
            <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
              <MapPin className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                Talhão selecionado
              </p>

              <h2 className="mt-1 truncate text-lg font-black text-slate-900">
                {selectedTalhao.nome}
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {areaSelecionada.toFixed(
                  2,
                )}{" "}
                ha mapeados
              </p>
            </div>
          </div>

          <div className="mt-6 flex-1 space-y-4">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <p className="text-sm font-black text-blue-900">
                Gerenciamento do limite
              </p>

              <p className="mt-2 text-xs leading-relaxed text-blue-800">
                Edite o nome ou ajuste diretamente os vértices. As UEIs e os GDAs serão recalculados sem trocar o ID do talhão.
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

          {podeGerenciar && (
            <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={
                  onEditarTalhao
                }
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Edit3 className="h-4 w-4" />
                Editar este talhão
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={
                    onIniciarNovoTalhao
                  }
                  disabled={loading}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Novo
                </button>

                <button
                  type="button"
                  onClick={
                    onExcluirTalhao
                  }
                  disabled={loading}
                  className="flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </button>
              </div>
            </div>
          )}
        </aside>
      );
    }

    return (
      <aside className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3 border-b border-slate-100 pb-5">
          <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
            <MapPin className="h-5 w-5" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-black text-slate-900">
                Novo talhão
              </h2>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-slate-500">
                Etapa 1 de 2
              </span>
            </div>

            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Primeiro defina o limite físico utilizando o mapa em tela cheia.
            </p>
          </div>
        </div>

        <div className="mt-6 flex-1 space-y-4">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <p className="text-sm font-black text-emerald-900">
              Como funciona
            </p>

            <ol className="mt-3 space-y-2 text-xs leading-relaxed text-emerald-800">
              <li>
                1. Marque os pontos seguindo o perímetro do talhão.
              </li>

              <li>
                2. Desfaça ou limpe os pontos quando necessário.
              </li>

              <li>
                3. Avance para informar o nome e confirmar as faixas espaciais.
              </li>
            </ol>
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

        <div className="mt-6 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={
              onIniciarNovoTalhao
            }
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <MapPin className="h-4 w-4" />
            Adicionar novo talhão
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <div className="flex items-start gap-3 border-b border-slate-100 pb-5">
          <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
            <MapPin className="h-5 w-5" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-black text-slate-900">
                {editando
                  ? "Editar informações"
                  : "Informações do talhão"}
              </h2>

              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-700">
                Etapa 2 de 2
              </span>
            </div>

            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Complete os dados antes de gerar as UEIs e os GDAs.
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
              autoFocus
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div>
            <p className="mb-2 text-[11px] font-black uppercase tracking-widest text-slate-500">
              Regras espaciais padronizadas
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                  Ativação GPS
                </p>

                <p className="mt-2 text-2xl font-black text-blue-800">
                  20 m
                </p>

                <p className="mt-1 text-[11px] leading-relaxed text-blue-700">
                  Sugere a ordem somente após a entrada segura.
                </p>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">
                  Bordadura agronômica
                </p>

                <p className="mt-2 text-2xl font-black text-amber-800">
                  4%
                </p>

                <p className="mt-1 text-[11px] leading-relaxed text-amber-700">
                  Formada por células próprias para manejo diferenciado.
                </p>
              </div>
            </div>

            <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
              As células da bordadura e do núcleo são recortadas separadamente, sem sobreposição.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Vértices
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
          onClick={
            onIniciarDesenho
          }
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <MapPin className="h-4 w-4" />
          Editar limite no mapa
        </button>

        <div className="grid grid-cols-2 gap-2">
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
              : editando
                ? "Salvar alterações"
                : "Salvar talhão"}
          </button>
        </div>
      </div>
    </aside>
  );
}
