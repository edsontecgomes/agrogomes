export type RegistroProdutividade = {
  ueiId: string;
  safra: string;
  produtividadeScHa: number;
  umidade?: number;
  origem: "colheitadeira" | "manual" | "estimado";
  data: string;
};

export function classificarProdutividade(produtividadeScHa: number) {
  if (produtividadeScHa >= 180) return "alta";
  if (produtividadeScHa >= 130) return "media";
  if (produtividadeScHa >= 80) return "baixa";

  return "critica";
}