import { AmostraEstatistica } from "./types";

export type GrupoAmostrasEntidade = {
  entidadeId: string;

  amostras: AmostraEstatistica[];
};

export function agruparAmostrasPorEntidade(
  amostras: AmostraEstatistica[],
): GrupoAmostrasEntidade[] {
  const grupos = new Map<
    string,
    AmostraEstatistica[]
  >();

  amostras.forEach((amostra) => {
    const entidadeId =
      amostra.entidadeId ??
      "entidade_nao_identificada";

    const lista =
      grupos.get(entidadeId) ?? [];

    lista.push(amostra);

    grupos.set(
      entidadeId,
      lista,
    );
  });

  return Array.from(
    grupos.entries(),
  ).map(
    ([entidadeId, lista]) => ({
      entidadeId,

      amostras: lista,
    }),
  );
}