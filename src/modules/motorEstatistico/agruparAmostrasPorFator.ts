import { AmostraEstatistica } from "./types";

export type GrupoAmostrasFator = {
  fator: string;

  unidade?: string;

  amostras: AmostraEstatistica[];

  valores: number[];
};

export function agruparAmostrasPorFator(
  amostras: AmostraEstatistica[],
): GrupoAmostrasFator[] {
  const grupos = new Map<
    string,
    AmostraEstatistica[]
  >();

  amostras.forEach((amostra) => {
    if (
      !amostra.fator ||
      !Number.isFinite(amostra.valor)
    ) {
      return;
    }

    const lista =
      grupos.get(amostra.fator) ?? [];

    lista.push(amostra);

    grupos.set(
      amostra.fator,
      lista,
    );
  });

  return Array.from(
    grupos.entries(),
  ).map(([fator, lista]) => ({
    fator,

    unidade:
      lista.find(
        (amostra) =>
          Boolean(amostra.unidade),
      )?.unidade,

    amostras: lista,

    valores: lista.map(
      (amostra) => amostra.valor,
    ),
  }));
}