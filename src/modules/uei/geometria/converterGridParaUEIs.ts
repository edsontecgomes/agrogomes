import { CelulaGridGeografico } from "../../geometria/grid";

export type UEIGeometrica = {
  /**
   * Identificador oficial e determinístico da UEI.
   *
   * Exemplo:
   * TALHAO-001-UEI-00001
   */
  id: string;

  /**
   * Mantido temporariamente para compatibilidade com
   * componentes que ainda utilizam o nome ueiId.
   *
   * id e ueiId sempre terão o mesmo valor.
   */
  ueiId: string;

  codigo: string;

  producerId: string;

  farmId: string;

  talhaoId: string;

  numero: number;

  nome: string;

  areaHa: number;

  centroide: CelulaGridGeografico["centroide"];

  geometria: CelulaGridGeografico["geometria"];

  origem: "grid_geografico";

  status: "ativa";

  criadoEm: Date;

  atualizadoEm: Date;
};

export type ConverterGridParaUEIsParams = {
  producerId: string;

  farmId: string;

  talhaoId: string;

  nomeTalhao: string;

  grid: CelulaGridGeografico[];
};

function validarParametros(
  params: ConverterGridParaUEIsParams,
): void {
  if (!params.producerId) {
    throw new Error(
      "Não foi possível converter o grid: producerId não informado.",
    );
  }

  if (!params.farmId) {
    throw new Error(
      "Não foi possível converter o grid: farmId não informado.",
    );
  }

  if (!params.talhaoId) {
    throw new Error(
      "Não foi possível converter o grid: talhaoId não informado.",
    );
  }

  if (!params.nomeTalhao.trim()) {
    throw new Error(
      "Não foi possível converter o grid: nome do talhão não informado.",
    );
  }
}

function validarCelulaGrid(
  celula: CelulaGridGeografico,
): void {
  if (!celula.id) {
    throw new Error(
      "Foi encontrada uma célula geográfica sem ID.",
    );
  }

  if (
    !Number.isFinite(celula.areaHa) ||
    celula.areaHa <= 0
  ) {
    throw new Error(
      `A célula ${celula.id} possui área inválida.`,
    );
  }

  if (
    !celula.geometria ||
    celula.geometria.length < 3
  ) {
    throw new Error(
      `A célula ${celula.id} não possui geometria válida.`,
    );
  }

  if (
    !Number.isFinite(celula.centroide.lat) ||
    !Number.isFinite(celula.centroide.lng)
  ) {
    throw new Error(
      `A célula ${celula.id} possui centroide inválido.`,
    );
  }
}

export function converterGridParaUEIs(
  params: ConverterGridParaUEIsParams,
): UEIGeometrica[] {
  validarParametros(params);

  const agora = new Date();

  return params.grid.map((celula) => {
    validarCelulaGrid(celula);

    return {
      id: celula.id,

      /**
       * Compatibilidade temporária.
       * Será removida quando todos os consumidores
       * utilizarem exclusivamente o campo id.
       */
      ueiId: celula.id,

      codigo: celula.id,

      producerId: params.producerId,

      farmId: params.farmId,

      talhaoId: params.talhaoId,

      numero: celula.numero,

      nome: `${params.nomeTalhao} - UEI ${celula.numero}`,

      areaHa: celula.areaHa,

      centroide: celula.centroide,

      geometria: celula.geometria,

      origem: "grid_geografico",

      status: "ativa",

      criadoEm: agora,

      atualizadoEm: agora,
    };
  });
}