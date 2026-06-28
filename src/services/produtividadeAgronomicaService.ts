import { analisarProdutividadeAgronomica } from "../engine/produtividadeEngine";
import { salvarProdutividadeAgronomica } from "../repositories/produtividadeAgronomicaRepository";
import { ProdutividadeAgronomica } from "../types/produtividadeAgronomica";

type CriarProdutividadeAgronomicaInput = Omit<
  ProdutividadeAgronomica,
  "id" | "createdAt" | "updatedAt"
>;

export async function registrarProdutividadeAgronomica(
  payload: CriarProdutividadeAgronomicaInput
): Promise<string> {
  return salvarProdutividadeAgronomica(payload);
}

export function processarProdutividadeAgronomica(
  produtividade: ProdutividadeAgronomica
) {
  return analisarProdutividadeAgronomica(produtividade);
}