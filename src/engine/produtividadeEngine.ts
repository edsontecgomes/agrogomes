import {
  calcularAmplitudeProdutiva,
  classificarProdutividade,
  identificarAlertasProdutividade,
} from "../domain/produtividade/produtividadeDomain";
import { ProdutividadeAgronomica } from "../types/produtividadeAgronomica";

export function analisarProdutividadeAgronomica(
  produtividade: ProdutividadeAgronomica
) {
  return {
    produtividade,
    classificacao: classificarProdutividade(produtividade),
    amplitudeProdutiva: calcularAmplitudeProdutiva(produtividade),
    alertas: identificarAlertasProdutividade(produtividade),
    analisadoEm: new Date().toISOString(),
  };
}