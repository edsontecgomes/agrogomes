import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

import { PlanoManutencao } from "../types";
import {
  handleFirestoreError,
  OperationType,
} from "../utils/errorHandling";
import { auth, db } from "./firebase";

export interface RegistrarAbastecimentoComEstoqueInput {
  farmId: string;
  produtoId: string;
  maquinaId: string;
  maquinaNome: string;
  operadorNome: string;
  horimetroAnterior: number;
  horimetroAtual: number;
  litros: number;
  valorLitro: number;
  valorTotal: number;
  postoCombustivel?: string;
  observacoes?: string;
}

export interface RegistrarAbastecimentoComEstoqueResult {
  abastecimentoId: string;
  horimetroId: string;
  movimentacaoId: string;
  saldoAnterior: number;
  saldoAtual: number;
}

function normalizarTexto(valor: unknown): string {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function numeroValido(valor: unknown): number {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : 0;
}

function ehCombustivel(categoria: unknown): boolean {
  return normalizarTexto(categoria) === "combustivel";
}

function ehUnidadeDeLitro(unidade: unknown): boolean {
  return ["l", "litro", "litros"].includes(
    normalizarTexto(unidade),
  );
}

async function verificarPlanosDeManutencao(
  farmId: string,
  maquinaId: string,
  maquinaNome: string,
  horimetroAtual: number,
): Promise<void> {
  try {
    const consultaPlanos = query(
      collection(db, "planos_manutencao"),
      where("farmId", "==", farmId),
      where("equipamentoId", "==", maquinaId),
      where("ativo", "==", true),
    );

    const planosSnapshot = await getDocs(
      consultaPlanos,
    );

    const planos = planosSnapshot.docs.map(
      (documento) => ({
        id: documento.id,
        ...documento.data(),
      }),
    ) as unknown as PlanoManutencao[];

    for (const plano of planos) {
      const horasRestantes =
        plano.proximaExecucaoHorimetro -
        horimetroAtual;

      const percentualRestante =
        plano.intervaloHoras > 0
          ? (horasRestantes /
              plano.intervaloHoras) *
            100
          : 0;

      const manutencaoVencida =
        horasRestantes <= 0;

      const manutencaoProxima =
        !manutencaoVencida &&
        percentualRestante <= 20;

      if (
        !manutencaoVencida &&
        !manutencaoProxima
      ) {
        continue;
      }

      const notificacaoRef = doc(
        collection(
          db,
          "notificacoes_operacionais",
        ),
      );

      const mensagem = manutencaoVencida
        ? `A manutenção preventiva "${plano.tipoManutencao}" da máquina ${maquinaNome} está vencida no horímetro ${horimetroAtual}h.`
        : `A manutenção preventiva "${plano.tipoManutencao}" da máquina ${maquinaNome} está próxima. Restam ${horasRestantes.toFixed(
            1,
          )}h.`;

      await setDoc(notificacaoRef, {
        id: notificacaoRef.id,
        farmId,
        tipo: manutencaoVencida
          ? "MANUTENCAO_VENCIDA"
          : "MANUTENCAO_PROXIMA",
        titulo: manutencaoVencida
          ? "Manutenção vencida"
          : "Manutenção próxima",
        mensagem,
        severidade: manutencaoVencida
          ? "critical"
          : "warning",
        visualizada: false,
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.warn(
      "O abastecimento foi salvo, mas não foi possível verificar os planos de manutenção:",
      error,
    );
  }
}

export async function registrarAbastecimentoComEstoque(
  dados: RegistrarAbastecimentoComEstoqueInput,
): Promise<RegistrarAbastecimentoComEstoqueResult> {
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error(
      "Usuário não autenticado para registrar o abastecimento.",
    );
  }

  if (!dados.farmId) {
    throw new Error(
      "A fazenda é obrigatória para registrar o abastecimento.",
    );
  }

  if (
    !Number.isFinite(dados.litros) ||
    dados.litros <= 0
  ) {
    throw new Error(
      "Informe uma quantidade de combustível maior que zero.",
    );
  }

  if (
    !Number.isFinite(dados.horimetroAtual) ||
    dados.horimetroAtual < 0
  ) {
    throw new Error(
      "Informe um horímetro válido.",
    );
  }

  const produtoRef = doc(
    db,
    "produtos",
    dados.produtoId,
  );

  const equipamentoRef = doc(
    db,
    "equipamentos",
    dados.maquinaId,
  );

  const abastecimentoRef = doc(
    collection(db, "abastecimentos"),
  );

  const horimetroRef = doc(
    collection(db, "horimetros"),
  );

  const movimentacaoRef = doc(
    collection(
      db,
      "movimentacoes_estoque",
    ),
  );

  try {
    const resultado = await runTransaction(
      db,
      async (transaction) => {
        const produtoSnapshot =
          await transaction.get(produtoRef);

        const equipamentoSnapshot =
          await transaction.get(
            equipamentoRef,
          );

        if (!produtoSnapshot.exists()) {
          throw new Error(
            "O combustível selecionado não existe no estoque.",
          );
        }

        if (!equipamentoSnapshot.exists()) {
          throw new Error(
            "A máquina selecionada não foi encontrada.",
          );
        }

        const produto =
          produtoSnapshot.data();

        const equipamento =
          equipamentoSnapshot.data();

        if (
          produto.farmId !== dados.farmId
        ) {
          throw new Error(
            "O combustível selecionado pertence a outra fazenda.",
          );
        }

        if (
          equipamento.farmId !==
          dados.farmId
        ) {
          throw new Error(
            "A máquina selecionada pertence a outra fazenda.",
          );
        }

        if (produto.ativo === false) {
          throw new Error(
            "O combustível selecionado está arquivado no estoque.",
          );
        }

        if (
          !ehCombustivel(
            produto.categoria,
          )
        ) {
          throw new Error(
            "O produto selecionado não está na categoria Combustível.",
          );
        }

        if (
          !ehUnidadeDeLitro(
            produto.unidade,
          )
        ) {
          throw new Error(
            "O combustível precisa estar cadastrado em litros para realizar a baixa.",
          );
        }

        const saldoAnterior =
          numeroValido(
            produto.estoqueAtual,
          );

        if (
          dados.litros >
          saldoAnterior
        ) {
          throw new Error(
            `Estoque insuficiente. Disponível: ${saldoAnterior.toFixed(
              2,
            )} litros.`,
          );
        }

        const horimetroEquipamento =
          numeroValido(
            equipamento.horimetroAtual,
          );

        const horimetroAnterior =
          Math.max(
            horimetroEquipamento,
            numeroValido(
              dados.horimetroAnterior,
            ),
          );

        if (
          dados.horimetroAtual <
          horimetroAnterior
        ) {
          throw new Error(
            `Horímetro atual (${dados.horimetroAtual}) não pode ser menor que o anterior (${horimetroAnterior}).`,
          );
        }

        const saldoAtual =
          saldoAnterior - dados.litros;

        const producerId =
          typeof produto.producerId ===
            "string" &&
          produto.producerId
            ? produto.producerId
            : usuario.uid;

        transaction.update(
          produtoRef,
          {
            estoqueAtual: saldoAtual,
            updatedAt:
              serverTimestamp(),
          },
        );

        transaction.update(
          equipamentoRef,
          {
            horimetroAtual:
              dados.horimetroAtual,
            ultimaAtualizacaoHorimetro:
              serverTimestamp(),
          },
        );

        transaction.set(
          horimetroRef,
          {
            id: horimetroRef.id,
            farmId: dados.farmId,
            producerId,
            maquinaId:
              dados.maquinaId,
            maquinaNome:
              dados.maquinaNome,
            horimetroAnterior,
            horimetroAtual:
              dados.horimetroAtual,
            dataRegistro:
              serverTimestamp(),
            operadorId: usuario.uid,
            operadorNome:
              dados.operadorNome,
            observacao:
              `Registro via abastecimento. ${
                dados.observacoes ?? ""
              }`.trim(),
            abastecimentoId:
              abastecimentoRef.id,
            createdAt:
              serverTimestamp(),
          },
        );

        transaction.set(
          abastecimentoRef,
          {
            id: abastecimentoRef.id,
            farmId: dados.farmId,
            producerId,
            maquinaId:
              dados.maquinaId,
            maquinaNome:
              dados.maquinaNome,
            operadorId: usuario.uid,
            operadorNome:
              dados.operadorNome,
            dataAbastecimento:
              serverTimestamp(),
            horimetroAtual:
              dados.horimetroAtual,
            litros: dados.litros,
            valorLitro:
              dados.valorLitro,
            valorTotal:
              dados.valorTotal,
            postoCombustivel:
              dados.postoCombustivel ??
              "",
            observacoes:
              dados.observacoes ?? "",
            produtoEstoqueId:
              produtoRef.id,
            produtoEstoqueNome:
              String(
                produto.nome ??
                  "Combustível",
              ),
            horimetroRegistroId:
              horimetroRef.id,
            movimentacaoEstoqueId:
              movimentacaoRef.id,
            createdAt:
              serverTimestamp(),
          },
        );

        transaction.set(
          movimentacaoRef,
          {
            id: movimentacaoRef.id,
            farmId: dados.farmId,
            producerId,
            userId: usuario.uid,
            produtoId: produtoRef.id,
            produtoNome: String(
              produto.nome ??
                "Combustível",
            ),
            unidade: String(
              produto.unidade ??
                "litro",
            ),
            tipo: "saida",
            quantidade: dados.litros,
            motivo: `Abastecimento da máquina ${dados.maquinaNome}`,
            maquinaId:
              dados.maquinaId,
            maquinaNome:
              dados.maquinaNome,
            abastecimentoId:
              abastecimentoRef.id,
            horimetroId:
              horimetroRef.id,
            data: serverTimestamp(),
            createdAt:
              serverTimestamp(),
          },
        );

        return {
          abastecimentoId:
            abastecimentoRef.id,
          horimetroId:
            horimetroRef.id,
          movimentacaoId:
            movimentacaoRef.id,
          saldoAnterior,
          saldoAtual,
        };
      },
    );

    await verificarPlanosDeManutencao(
      dados.farmId,
      dados.maquinaId,
      dados.maquinaNome,
      dados.horimetroAtual,
    );

    return resultado;
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.WRITE,
      "abastecimentos",
    );

    throw error;
  }
}