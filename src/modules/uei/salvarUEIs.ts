import { salvarUEIComGDA } from "./salvarUEIComGDA";
import { Uei } from "./types";

export type ResultadoPersistenciaUEI = {
  ueiId: string;
  gdaId: string;
};

const TAMANHO_LOTE = 20;

function dividirEmLotes<T>(
  itens: T[],
  tamanho: number,
): T[][] {
  const lotes: T[][] = [];

  for (
    let indice = 0;
    indice < itens.length;
    indice += tamanho
  ) {
    lotes.push(
      itens.slice(
        indice,
        indice + tamanho,
      ),
    );
  }

  return lotes;
}

function validarUEI(
  uei: Uei,
): void {
  if (!uei.id) {
    throw new Error(
      "Foi encontrada uma UEI sem identificador.",
    );
  }

  if (!uei.producerId) {
    throw new Error(
      `A UEI ${uei.id} não possui producerId.`,
    );
  }

  if (!uei.farmId) {
    throw new Error(
      `A UEI ${uei.id} não possui farmId.`,
    );
  }

  if (!uei.talhaoId) {
    throw new Error(
      `A UEI ${uei.id} não possui talhaoId.`,
    );
  }

  if (!uei.codigo) {
    throw new Error(
      `A UEI ${uei.id} não possui código.`,
    );
  }

  if (
    !Number.isFinite(uei.areaHa) ||
    uei.areaHa <= 0
  ) {
    throw new Error(
      `A UEI ${uei.id} possui área inválida.`,
    );
  }

  if (
    !uei.geometria ||
    uei.geometria.length < 3
  ) {
    throw new Error(
      `A UEI ${uei.id} não possui geometria válida.`,
    );
  }

  if (
    !uei.centroide ||
    !Number.isFinite(uei.centroide.lat) ||
    !Number.isFinite(uei.centroide.lng)
  ) {
    throw new Error(
      `A UEI ${uei.id} não possui centroide válido.`,
    );
  }
}

export async function salvarUEIs(
  lista: Uei[],
): Promise<ResultadoPersistenciaUEI[]> {
  if (!lista.length) {
    return [];
  }

  lista.forEach(validarUEI);

  const resultados: ResultadoPersistenciaUEI[] = [];

  const lotes = dividirEmLotes(
    lista,
    TAMANHO_LOTE,
  );

  for (const lote of lotes) {
    const resultadosLote = await Promise.all(
      lote.map((uei) =>
        salvarUEIComGDA(uei),
      ),
    );

    resultados.push(
      ...resultadosLote,
    );
  }

  return resultados;
}