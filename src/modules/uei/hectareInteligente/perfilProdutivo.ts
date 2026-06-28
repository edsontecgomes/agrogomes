import { SafraHectareInteligente } from "./historicoSafras";

export type PerfilProdutivoHectare = {
  hectareId: string;
  produtividadeMediaScHa: number;
  melhorSafra?: string;
  piorSafra?: string;
  numeroSafras: number;
};

export function gerarPerfilProdutivoHectare(
  hectareId: string,
  safras: SafraHectareInteligente[],
): PerfilProdutivoHectare {
  const comProdutividade = safras.filter(
    (safra) => safra.produtividadeScHa !== undefined,
  );

  if (!comProdutividade.length) {
    return {
      hectareId,
      produtividadeMediaScHa: 0,
      numeroSafras: 0,
    };
  }

  const media =
    comProdutividade.reduce(
      (total, safra) => total + (safra.produtividadeScHa || 0),
      0,
    ) / comProdutividade.length;

  const ordenadas = [...comProdutividade].sort(
    (a, b) => (b.produtividadeScHa || 0) - (a.produtividadeScHa || 0),
  );

  return {
    hectareId,
    produtividadeMediaScHa: media,
    melhorSafra: ordenadas[0]?.safra,
    piorSafra: ordenadas[ordenadas.length - 1]?.safra,
    numeroSafras: comProdutividade.length,
  };
}