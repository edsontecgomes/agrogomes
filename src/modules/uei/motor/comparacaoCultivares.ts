export type ResultadoCultivar = {
  cultivar: string;
  produtividadeMediaScHa: number;
  numeroUeis: number;
};

export function ordenarCultivaresPorProdutividade(resultados: ResultadoCultivar[]) {
  return [...resultados].sort(
    (a, b) => b.produtividadeMediaScHa - a.produtividadeMediaScHa,
  );
}