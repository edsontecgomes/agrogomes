import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import type {
  ExecucaoServico,
  Location,
  OrdemServico,
  Talhao,
} from "../types";
import { db } from "./firebase";
import {
  isOperacaoBaseadaEmArea,
  montarItensConsumoReconciliacao,
  type ItemConsumoReconciliacao,
} from "./reconciliacaoOperacionalCalculos";
import {
  persistirRastreabilidadeExecucaoUEI,
  prepararRastreabilidadeExecucaoUEI,
} from "./rastreabilidadeExecucaoUeiService";

export interface ReconciliarExecucaoOperacionalParams {
  execucaoId: string;
  ordemId: string;
  farmId: string;
  locationEnd?: Location;
  horimetroFinal?: number;
}

interface SaldoAgrupado {
  chave: string;
  origemEstoque:
    | "produtos"
    | "estoque";
  produtoId: string;
  quantidade: number;
}

class SaldoEstoqueInsuficienteError
  extends Error {
  constructor(message: string) {
    super(message);
    this.name =
      "SaldoEstoqueInsuficienteError";
  }
}

function agruparConsumos(
  itens: ItemConsumoReconciliacao[],
) {
  const grupos = new Map<
    string,
    SaldoAgrupado
  >();

  for (const item of itens) {
    const chave =
      `${item.origemEstoque}:` +
      item.produtoId;
    const atual = grupos.get(chave);

    grupos.set(chave, {
      chave,
      origemEstoque:
        item.origemEstoque,
      produtoId: item.produtoId,
      quantidade:
        (atual?.quantidade || 0) +
        item.quantidade,
    });
  }

  return [...grupos.values()];
}

function mensagemErro(
  error: unknown,
) {
  return error instanceof Error
    ? error.message
    : "Erro desconhecido ao consolidar a execução.";
}

async function carregarContexto(
  params:
    ReconciliarExecucaoOperacionalParams,
) {
  const [ordemSnapshot, execucaoSnapshot] =
    await Promise.all([
      getDoc(
        doc(
          db,
          "ordens_servico",
          params.ordemId,
        ),
      ),
      getDoc(
        doc(
          db,
          "execucoes_servico",
          params.execucaoId,
        ),
      ),
    ]);

  if (!ordemSnapshot.exists()) {
    throw new Error(
      "Ordem de serviço não encontrada para consolidação.",
    );
  }

  if (!execucaoSnapshot.exists()) {
    throw new Error(
      "Execução não encontrada para consolidação.",
    );
  }

  const ordem = {
    id: ordemSnapshot.id,
    ...ordemSnapshot.data(),
  } as OrdemServico;
  const execucao = {
    id: execucaoSnapshot.id,
    ...execucaoSnapshot.data(),
  } as ExecucaoServico;

  if (
    ordem.farmId !== params.farmId ||
    execucao.farmId !== params.farmId ||
    execucao.ordemId !== params.ordemId
  ) {
    throw new Error(
      "Fazenda ou ordem incompatível com a execução.",
    );
  }

  const talhaoSnapshot = await getDoc(
    doc(
      db,
      "talhoes",
      execucao.talhaoId,
    ),
  );
  const talhao = talhaoSnapshot.exists()
    ? ({
        id: talhaoSnapshot.id,
        ...talhaoSnapshot.data(),
      } as Talhao)
    : undefined;

  return {
    ordem,
    execucao,
    talhao,
  };
}

async function atualizarStatusOrdem(
  params:
    ReconciliarExecucaoOperacionalParams,
) {
  const snapshot = await getDocs(
    query(
      collection(
        db,
        "execucoes_servico",
      ),
      where(
        "farmId",
        "==",
        params.farmId,
      ),
      where(
        "ordemId",
        "==",
        params.ordemId,
      ),
    ),
  );
  const temExecucaoAtiva =
    snapshot.docs.some(
      (executionDocument) => {
        const status =
          executionDocument.data()
            .status;

        return (
          status === "em_execucao" ||
          status === "pausada"
        );
      },
    );

  await updateDoc(
    doc(
      db,
      "ordens_servico",
      params.ordemId,
    ),
    {
      status: temExecucaoAtiva
        ? "parcial"
        : "finalizada",
      updatedAt: serverTimestamp(),
    },
  );
}

export async function reconciliarExecucaoOperacional(
  params:
    ReconciliarExecucaoOperacionalParams,
) {
  const executionReference = doc(
    db,
    "execucoes_servico",
    params.execucaoId,
  );

  try {
    await updateDoc(
      executionReference,
      {
        reconciliacaoOperacionalStatus:
          "processando",
        reconciliacaoOperacionalErro:
          null,
        reconciliacaoOperacionalTentativaAt:
          serverTimestamp(),
      },
    );

    const {
      ordem,
      talhao,
    } = await carregarContexto(
      params,
    );
    const rastreabilidade =
      await prepararRastreabilidadeExecucaoUEI(
        {
          execucaoId:
            params.execucaoId,
          ordem,
          talhao,
          locationEnd:
            params.locationEnd,
        },
      );
    const produtos =
      rastreabilidade.execucao
        .produtos?.length
        ? rastreabilidade.execucao
            .produtos
        : ordem.produtos || [];
    const baseadaEmArea =
      isOperacaoBaseadaEmArea(
        ordem.tipoOperacao,
      );
    const itensConsumo =
      montarItensConsumoReconciliacao(
        params.execucaoId,
        produtos,
        ordem.tipoOperacao,
        rastreabilidade.areaExecutadaHa,
      );
    const saldos =
      agruparConsumos(itensConsumo);
    const produtorId =
      talhao?.producerId ||
      rastreabilidade.execucao
        .operadorId;

    await runTransaction(
      db,
      async (transaction) => {
        const executionSnapshot =
          await transaction.get(
            executionReference,
          );

        if (
          !executionSnapshot.exists()
        ) {
          throw new Error(
            "Execução removida durante a consolidação.",
          );
        }

        const executionData =
          executionSnapshot.data();
        const consumoJaConsolidado =
          executionData
            .consumoEstoqueExecucaoId ===
          params.execucaoId;
        const saldosComSnapshot =
          consumoJaConsolidado
            ? []
            : await Promise.all(
                saldos.map(
                  async (saldo) => {
                    const reference =
                      doc(
                        db,
                        saldo.origemEstoque,
                        saldo.produtoId,
                      );
                    const snapshot =
                      await transaction.get(
                        reference,
                      );

                    return {
                      ...saldo,
                      reference,
                      snapshot,
                    };
                  },
                ),
              );

        for (
          const saldo of
            saldosComSnapshot
        ) {
          if (!saldo.snapshot.exists()) {
            throw new SaldoEstoqueInsuficienteError(
              `Produto ${saldo.produtoId} não encontrado no estoque.`,
            );
          }

          const campoSaldo =
            saldo.origemEstoque ===
            "produtos"
              ? "estoqueAtual"
              : "quantidadeAtual";
          const quantidadeAtual =
            Number(
              saldo.snapshot.data()[
                campoSaldo
              ] || 0,
            );

          if (
            quantidadeAtual +
              0.000001 <
            saldo.quantidade
          ) {
            throw new SaldoEstoqueInsuficienteError(
              `Saldo insuficiente para ${saldo.produtoId}: ` +
                `${quantidadeAtual} disponível e ` +
                `${saldo.quantidade} necessário.`,
            );
          }
        }

        if (!consumoJaConsolidado) {
          for (
            const saldo of
              saldosComSnapshot
          ) {
            const campoSaldo =
              saldo.origemEstoque ===
              "produtos"
                ? "estoqueAtual"
                : "quantidadeAtual";
            const quantidadeAtual =
              Number(
                saldo.snapshot.data()[
                  campoSaldo
                ] || 0,
              );

            transaction.update(
              saldo.reference,
              {
                [campoSaldo]:
                  Number(
                    (
                      quantidadeAtual -
                      saldo.quantidade
                    ).toFixed(6),
                  ),
                updatedAt:
                  serverTimestamp(),
              },
            );
          }

          for (
            const item of itensConsumo
          ) {
            transaction.set(
              doc(
                db,
                "movimentacoes_estoque",
                item.movimentoId,
              ),
              {
                id: item.movimentoId,
                produtoId:
                  item.produtoId,
                produtoNome:
                  item.produtoNome,
                categoria:
                  item.categoria ||
                  null,
                lote:
                  item.lote || null,
                unidade:
                  item.unidade ||
                  null,
                dose: item.dose,
                quantidade:
                  item.quantidade,
                tipo: "saida",
                origemEstoque:
                  item.origemEstoque,
                ordemId: ordem.id,
                execucaoId:
                  params.execucaoId,
                talhaoId:
                  ordem.talhaoId,
                ueiIds:
                  rastreabilidade.ueiIds,
                areaBaseCalculoHa:
                  rastreabilidade
                    .areaExecutadaHa,
                metodoCalculoArea:
                  rastreabilidade
                    .areaExecutadaHa >
                  0
                    ? "cobertura_gps_uei"
                    : "dose_fixa",
                farmId:
                  params.farmId,
                producerId:
                  produtorId,
                data:
                  serverTimestamp(),
                createdAt:
                  serverTimestamp(),
              },
              { merge: true },
            );
          }
        }

        if (
          params.horimetroFinal !==
            undefined &&
          ordem.maquinaId
        ) {
          transaction.set(
            doc(
              db,
              "horimetros",
              `${params.execucaoId}_fechamento`,
            ),
            {
              farmId:
                params.farmId,
              producerId:
                produtorId,
              maquinaId:
                ordem.maquinaId,
              maquinaNome:
                ordem.maquinaNome ||
                "",
              horimetroAnterior:
                params.horimetroFinal,
              horimetroAtual:
                params.horimetroFinal,
              dataRegistro:
                serverTimestamp(),
              operadorId:
                rastreabilidade
                  .execucao
                  .operadorId,
              operadorNome:
                rastreabilidade
                  .execucao
                  .operadorNome ||
                "Operador",
              observacao:
                `Fechamento da Ordem #${ordem.id.slice(
                  -6,
                )}`,
              execucaoId:
                params.execucaoId,
              createdAt:
                serverTimestamp(),
              syncedAt:
                serverTimestamp(),
            },
            { merge: true },
          );

          transaction.update(
            doc(
              db,
              "equipamentos",
              ordem.maquinaId,
            ),
            {
              horimetroAtual:
                params.horimetroFinal,
              ultimaAtualizacaoHorimetro:
                serverTimestamp(),
            },
          );
        }

        const consumoPendente =
          baseadaEmArea &&
          rastreabilidade
            .areaExecutadaHa <= 0;

        transaction.update(
          executionReference,
          {
            status: "finalizada",
            ueiIds:
              rastreabilidade.ueiIds,
            coberturaUEIs:
              rastreabilidade.coberturas,
            areaExecutadaHa:
              rastreabilidade
                .areaExecutadaHa,
            confiabilidadeEspacial:
              rastreabilidade
                .confiabilidade,
            metodoEspacial:
              rastreabilidade.metodo,
            observacoesRastreabilidade:
              rastreabilidade
                .observacoes,
            rastreabilidadeStatus:
              rastreabilidade.status,
            consumoEstoqueStatus:
              consumoPendente
                ? "pendente_cobertura"
                : "baixado",
            ...(!consumoPendente
              ? {
                  consumoEstoqueExecucaoId:
                    params.execucaoId,
                  consumoEstoqueConsolidadoAt:
                    serverTimestamp(),
                }
              : {}),
            reconciliacaoOperacionalStatus:
              consumoPendente
                ? "pendente_cobertura"
                : "processando",
            ...(params.horimetroFinal !==
            undefined
              ? {
                  horimetroFinal:
                    params.horimetroFinal,
                }
              : {}),
            updatedAt:
              serverTimestamp(),
          },
        );
      },
    );

    await persistirRastreabilidadeExecucaoUEI(
      {
        rastreabilidade,
        ordem,
        talhao,
      },
    );
    await atualizarStatusOrdem(params);

    const consumoPendente =
      baseadaEmArea &&
      rastreabilidade
        .areaExecutadaHa <= 0;

    await updateDoc(
      executionReference,
      {
        reconciliacaoOperacionalStatus:
          consumoPendente
            ? "pendente_cobertura"
            : "concluida",
        reconciliacaoOperacionalErro:
          null,
        reconciliacaoOperacionalConcluidaAt:
          serverTimestamp(),
      },
    );
  } catch (error) {
    const saldoInsuficiente =
      error instanceof
      SaldoEstoqueInsuficienteError;

    await updateDoc(
      executionReference,
      {
        reconciliacaoOperacionalStatus:
          "erro",
        reconciliacaoOperacionalErro:
          mensagemErro(error),
        ...(saldoInsuficiente
          ? {
              consumoEstoqueStatus:
                "erro_saldo_insuficiente",
            }
          : {}),
        updatedAt:
          serverTimestamp(),
      },
    ).catch(() => undefined);

    throw error;
  }
}
