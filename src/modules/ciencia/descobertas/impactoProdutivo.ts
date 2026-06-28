export type ImpactoProdutivo = {
  ganhoScHa: number;
  percentual: number;
};

export function calcularImpacto(
  antes: number,
  depois: number,
): ImpactoProdutivo {

  const ganho = depois - antes;

  return {

    ganhoScHa: ganho,

    percentual:
      antes === 0
        ? 0
        : (ganho / antes) * 100,

  };

}