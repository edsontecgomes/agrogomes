import { AmostraEstatistica } from "./types";

export type ParesFatoresEstatisticos = {
  fatorX: string;

  fatorY: string;

  valoresX: number[];

  valoresY: number[];

  entidadeIds: string[];
};

export function criarParesFatores(
  amostras: AmostraEstatistica[],
  fatorX: string,
  fatorY: string,
): ParesFatoresEstatisticos {
  const porEntidade = new Map<
    string,
    Map<string, number[]>
  >();

  amostras.forEach((amostra) => {
    if (
      !amostra.entidadeId ||
      !Number.isFinite(amostra.valor)
    ) {
      return;
    }

    const fatoresEntidade =
      porEntidade.get(
        amostra.entidadeId,
      ) ?? new Map<string, number[]>();

    const valores =
      fatoresEntidade.get(
        amostra.fator,
      ) ?? [];

    valores.push(
      amostra.valor,
    );

    fatoresEntidade.set(
      amostra.fator,
      valores,
    );

    porEntidade.set(
      amostra.entidadeId,
      fatoresEntidade,
    );
  });

  const valoresX: number[] = [];
  const valoresY: number[] = [];
  const entidadeIds: string[] = [];

  porEntidade.forEach(
    (
      fatoresEntidade,
      entidadeId,
    ) => {
      const listaX =
        fatoresEntidade.get(fatorX);

      const listaY =
        fatoresEntidade.get(fatorY);

      if (
        !listaX?.length ||
        !listaY?.length
      ) {
        return;
      }

      const mediaX =
        listaX.reduce(
          (soma, valor) =>
            soma + valor,
          0,
        ) / listaX.length;

      const mediaY =
        listaY.reduce(
          (soma, valor) =>
            soma + valor,
          0,
        ) / listaY.length;

      valoresX.push(mediaX);
      valoresY.push(mediaY);
      entidadeIds.push(entidadeId);
    },
  );

  return {
    fatorX,

    fatorY,

    valoresX,

    valoresY,

    entidadeIds,
  };
}