import type {
  OrdemServico,
} from "../types";

type ProdutoOrdem = NonNullable<
  OrdemServico["produtos"]
>[number];

export interface ItemConsumoReconciliacao {
  movimentoId: string;
  produtoId: string;
  produtoNome: string;
  origemEstoque:
    | "produtos"
    | "estoque";
  quantidade: number;
  dose: number;
  unidade?: string;
  categoria?: string;
  lote?: string;
}

function arredondarQuantidade(
  quantidade: number,
) {
  return Number(
    quantidade.toFixed(6),
  );
}

export function isOperacaoBaseadaEmArea(
  tipoOperacao:
    OrdemServico["tipoOperacao"],
) {
  return [
    "Plantio",
    "Pulverizacao",
    "Adubacao",
  ].includes(tipoOperacao);
}

export function montarItensConsumoReconciliacao(
  execucaoId: string,
  produtos: ProdutoOrdem[],
  tipoOperacao:
    OrdemServico["tipoOperacao"],
  areaExecutadaHa: number,
): ItemConsumoReconciliacao[] {
  const baseadaEmArea =
    isOperacaoBaseadaEmArea(
      tipoOperacao,
    );

  if (
    baseadaEmArea &&
    areaExecutadaHa <= 0
  ) {
    return [];
  }

  return produtos.flatMap(
    (produto, indice) => {
      const dose = Number(
        produto.dose || 0,
      );
      const quantidade =
        arredondarQuantidade(
          baseadaEmArea
            ? dose * areaExecutadaHa
            : dose,
        );

      if (
        !Number.isFinite(quantidade) ||
        quantidade <= 0
      ) {
        return [];
      }

      return [
        {
          movimentoId:
            `${execucaoId}_consumo_${String(
              indice + 1,
            ).padStart(3, "0")}`,
          produtoId:
            produto.produtoId,
          produtoNome:
            produto.nome || "Insumo",
          origemEstoque:
            produto.origemEstoque ||
            "estoque",
          quantidade,
          dose,
          ...(produto.unidade
            ? {
                unidade:
                  produto.unidade,
              }
            : {}),
          ...(produto.categoria
            ? {
                categoria:
                  produto.categoria,
              }
            : {}),
          ...(produto.lote
            ? {
                lote: produto.lote,
              }
            : {}),
        },
      ];
    },
  );
}
