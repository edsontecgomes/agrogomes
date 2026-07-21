import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  Fuel,
  Save,
  X,
} from "lucide-react";

import { useAbastecimentos } from "../../hooks/useAbastecimentos";
import { useEquipamentos } from "../../hooks/useEquipamentos";
import { useHorimetros } from "../../hooks/useHorimetros";
import { useIndicadoresConsumo } from "../../hooks/useIndicadoresConsumo";
import { useProdutosEstoque } from "../../hooks/useProdutosEstoque";
import { registrarAbastecimentoComEstoque } from "../../services/abastecimentoService";
import { auth } from "../../services/firebase";

interface AbastecimentoFormProps {
  farmId: string;
  onClose: () => void;
}

function normalizarTexto(
  valor: unknown,
): string {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .trim()
    .toLowerCase();
}

function ehCombustivelEmLitros(
  categoria: unknown,
  unidade: unknown,
): boolean {
  return (
    normalizarTexto(categoria) ===
      "combustivel" &&
    [
      "l",
      "litro",
      "litros",
    ].includes(
      normalizarTexto(unidade),
    )
  );
}

export function AbastecimentoForm({
  farmId,
  onClose,
}: AbastecimentoFormProps) {
  const { equipamentos } =
    useEquipamentos(farmId);

  const { abastecimentos } =
    useAbastecimentos(farmId);

  const { horimetros } =
    useHorimetros(farmId);

  const { atualizarIndicador } =
    useIndicadoresConsumo(farmId);

  const {
    produtos,
    loading: loadingProdutos,
  } = useProdutosEstoque(farmId);

  const user = auth.currentUser;

  const [
    combustivelProdutoId,
    setCombustivelProdutoId,
  ] = useState("");

  const [
    maquinaId,
    setMaquinaId,
  ] = useState("");

  const [
    horimetroAtual,
    setHorimetroAtual,
  ] = useState("");

  const [litros, setLitros] =
    useState("");

  const [
    valorLitro,
    setValorLitro,
  ] = useState("");

  const [posto, setPosto] =
    useState("");

  const [
    observacoes,
    setObservacoes,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const maquinas = useMemo(
    () =>
      equipamentos.filter(
        (equipamento) =>
          equipamento.tipo ===
          "maquina",
      ),
    [equipamentos],
  );

  const combustiveis = useMemo(
    () =>
      produtos.filter(
        (produto) =>
          produto.ativo &&
          ehCombustivelEmLitros(
            produto.categoria,
            produto.unidade,
          ),
      ),
    [produtos],
  );

  const combustivelSelecionado =
    useMemo(
      () =>
        combustiveis.find(
          (produto) =>
            produto.id ===
            combustivelProdutoId,
        ) ?? null,
      [
        combustiveis,
        combustivelProdutoId,
      ],
    );

  useEffect(() => {
    if (
      !combustivelProdutoId &&
      combustiveis.length === 1
    ) {
      setCombustivelProdutoId(
        combustiveis[0].id,
      );
    }
  }, [
    combustiveis,
    combustivelProdutoId,
  ]);

  const numLitros =
    Number.parseFloat(
      litros.replace(",", "."),
    ) || 0;

  const numValorLitro =
    Number.parseFloat(
      valorLitro.replace(",", "."),
    ) || 0;

  const numHorimetro =
    Number.parseFloat(
      horimetroAtual.replace(
        ",",
        ".",
      ),
    ) || 0;

  const valorTotal =
    numLitros * numValorLitro;

  const saldoDisponivel =
    combustivelSelecionado
      ?.estoqueAtual ?? 0;

  const saldoDepois =
    saldoDisponivel - numLitros;

  const estoqueInsuficiente =
    combustivelSelecionado !==
      null &&
    numLitros > saldoDisponivel;

  const podeSalvar =
    !submitting &&
    !loadingProdutos &&
    Boolean(
      combustivelProdutoId,
    ) &&
    Boolean(maquinaId) &&
    numHorimetro >= 0 &&
    numLitros > 0 &&
    numValorLitro > 0 &&
    !estoqueInsuficiente;

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    if (!user) {
      setError(
        "Usuário não autenticado.",
      );
      return;
    }

    if (!combustivelProdutoId) {
      setError(
        "Selecione o combustível que será retirado do estoque.",
      );
      return;
    }

    if (
      !maquinaId ||
      !horimetroAtual ||
      !litros ||
      !valorLitro
    ) {
      setError(
        "Preencha os campos obrigatórios.",
      );
      return;
    }

    if (
      numLitros <= 0 ||
      numValorLitro <= 0
    ) {
      setError(
        "Litros e valor por litro precisam ser maiores que zero.",
      );
      return;
    }

    if (estoqueInsuficiente) {
      setError(
        `Estoque insuficiente. Disponível: ${saldoDisponivel.toFixed(
          2,
        )} litros.`,
      );
      return;
    }

    const maquina = maquinas.find(
      (item) =>
        item.id === maquinaId,
    );

    if (!maquina) {
      setError(
        "A máquina selecionada não foi encontrada.",
      );
      return;
    }

    const ultimoHorimetro =
      horimetros.find(
        (registro) =>
          registro.maquinaId ===
          maquinaId,
      );

    const horimetroAnterior =
      ultimoHorimetro
        ?.horimetroAtual ?? 0;

    if (
      numHorimetro <
      horimetroAnterior
    ) {
      setError(
        `Horímetro atual (${numHorimetro}) não pode ser menor que o anterior (${horimetroAnterior}).`,
      );
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await registrarAbastecimentoComEstoque(
        {
          farmId,
          produtoId:
            combustivelProdutoId,
          maquinaId,
          maquinaNome:
            maquina.nome,
          operadorNome:
            user.displayName ||
            "Operador",
          horimetroAnterior,
          horimetroAtual:
            numHorimetro,
          litros: numLitros,
          valorLitro:
            numValorLitro,
          valorTotal,
          postoCombustivel:
            posto.trim(),
          observacoes:
            observacoes.trim(),
        },
      );

      const abastecimentoAnterior =
        abastecimentos.find(
          (abastecimento) =>
            abastecimento.maquinaId ===
            maquinaId,
        );

      if (
        abastecimentoAnterior
      ) {
        const horasTrabalhadas =
          numHorimetro -
          abastecimentoAnterior.horimetroAtual;

        if (horasTrabalhadas > 0) {
          try {
            await atualizarIndicador(
              maquinaId,
              {
                litrosHora:
                  numLitros /
                  horasTrabalhadas,
                custoHora:
                  valorTotal /
                  horasTrabalhadas,
              },
            );
          } catch (
            indicadorError
          ) {
            console.warn(
              "O abastecimento foi salvo, mas o indicador de consumo não foi atualizado:",
              indicadorError,
            );
          }
        }
      }

      onClose();
    } catch (submitError) {
      console.error(submitError);

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Erro ao salvar. Verifique a conexão e tente novamente.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-xl max-h-[92vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
              <Fuel className="w-5 h-5" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Novo Abastecimento
              </h2>

              <p className="text-xs text-slate-500 mt-0.5">
                A baixa será aplicada
                automaticamente ao estoque.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
            aria-label="Fechar formulário"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 overflow-y-auto max-h-[calc(92vh-92px)]"
        >
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-sm font-medium rounded-xl border border-rose-200">
              {error}
            </div>
          )}

          {!loadingProdutos &&
            combustiveis.length ===
              0 && (
              <div className="p-4 bg-amber-50 text-amber-800 text-sm rounded-xl border border-amber-200 flex gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />

                <div>
                  <p className="font-bold">
                    Nenhum combustível
                    disponível
                  </p>

                  <p className="mt-1 text-amber-700">
                    Cadastre na aba Estoque
                    um produto ativo na
                    categoria Combustível e
                    com unidade litro.
                  </p>
                </div>
              </div>
            )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Combustível do estoque *
              </label>

              <select
                value={
                  combustivelProdutoId
                }
                onChange={(event) =>
                  setCombustivelProdutoId(
                    event.target.value,
                  )
                }
                disabled={
                  loadingProdutos ||
                  combustiveis.length ===
                    0
                }
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-100 disabled:text-slate-400"
                required
              >
                <option value="">
                  {loadingProdutos
                    ? "Carregando estoque..."
                    : "Selecione o combustível..."}
                </option>

                {combustiveis.map(
                  (produto) => (
                    <option
                      key={produto.id}
                      value={produto.id}
                    >
                      {produto.nome} —{" "}
                      {produto.estoqueAtual.toFixed(
                        2,
                      )}{" "}
                      {produto.unidade}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Máquina *
              </label>

              <select
                value={maquinaId}
                onChange={(event) =>
                  setMaquinaId(
                    event.target.value,
                  )
                }
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">
                  Selecione uma máquina...
                </option>

                {maquinas.map(
                  (maquina) => (
                    <option
                      key={maquina.id}
                      value={maquina.id}
                    >
                      {maquina.nome}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Horímetro atual *
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={
                    horimetroAtual
                  }
                  onChange={(event) =>
                    setHorimetroAtual(
                      event.target.value,
                    )
                  }
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Ex: 5600.5"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Posto / tanque
                </label>

                <input
                  type="text"
                  value={posto}
                  onChange={(event) =>
                    setPosto(
                      event.target.value,
                    )
                  }
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Ex: Sede"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Litros *
                </label>

                <input
                  type="number"
                  min="0.01"
                  max={
                    combustivelSelecionado
                      ?.estoqueAtual
                  }
                  step="0.01"
                  value={litros}
                  onChange={(event) =>
                    setLitros(
                      event.target.value,
                    )
                  }
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Ex: 250"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  R$ por litro *
                </label>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={valorLitro}
                  onChange={(event) =>
                    setValorLitro(
                      event.target.value,
                    )
                  }
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Ex: 5.40"
                  required
                />
              </div>
            </div>

            {combustivelSelecionado && (
              <div
                className={`p-4 rounded-xl border ${
                  estoqueInsuficiente
                    ? "bg-rose-50 border-rose-200"
                    : "bg-blue-50 border-blue-100"
                }`}
              >
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">
                      Saldo disponível
                    </p>

                    <p className="font-bold text-slate-800 mt-1">
                      {saldoDisponivel.toFixed(
                        2,
                      )}{" "}
                      litros
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500">
                      Saldo após a saída
                    </p>

                    <p
                      className={`font-bold mt-1 ${
                        estoqueInsuficiente
                          ? "text-rose-700"
                          : "text-blue-700"
                      }`}
                    >
                      {saldoDepois.toFixed(
                        2,
                      )}{" "}
                      litros
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex justify-between items-center">
              <span className="text-sm font-bold text-emerald-800">
                Valor total:
              </span>

              <span className="text-xl font-black text-emerald-600">
                {valorTotal.toLocaleString(
                  "pt-BR",
                  {
                    style: "currency",
                    currency: "BRL",
                  },
                )}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Observações
              </label>

              <textarea
                value={observacoes}
                onChange={(event) =>
                  setObservacoes(
                    event.target.value,
                  )
                }
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none h-24"
                placeholder="Observações adicionais..."
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 disabled:opacity-50"
              disabled={submitting}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={!podeSalvar}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                "Salvando..."
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Salvar e baixar estoque
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}