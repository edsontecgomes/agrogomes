import { ProdutividadeAgronomica } from "../../types/produtividadeAgronomica";

export type ClassificacaoProdutividade =
  | "baixa"
  | "media"
  | "alta"
  | "excelente";

export function classificarProdutividade(
  produtividade: ProdutividadeAgronomica
): ClassificacaoProdutividade {
  const valor = produtividade.produtividadeMedia;

  if (valor < 50) return "baixa";
  if (valor < 80) return "media";
  if (valor < 100) return "alta";

  return "excelente";
}

export function calcularAmplitudeProdutiva(
  produtividade: ProdutividadeAgronomica
): number | undefined {
  if (
    produtividade.produtividadeMaxima === undefined ||
    produtividade.produtividadeMinima === undefined
  ) {
    return undefined;
  }

  return produtividade.produtividadeMaxima - produtividade.produtividadeMinima;
}

export function identificarAlertasProdutividade(
  produtividade: ProdutividadeAgronomica
): string[] {
  const alertas: string[] = [];

  const amplitude = calcularAmplitudeProdutiva(produtividade);

  if (amplitude !== undefined && amplitude > 40) {
    alertas.push("Alta variabilidade produtiva dentro da área.");
  }

  if (produtividade.produtividadeMedia < 50) {
    alertas.push("Produtividade média abaixo do potencial esperado.");
  }

  if (
    produtividade.dadosMapa?.possuiMapa &&
    produtividade.dadosMapa.zonasProdutivas &&
    produtividade.dadosMapa.zonasProdutivas > 1
  ) {
    alertas.push("Área possui zonas produtivas distintas para análise.");
  }

  return alertas;
}