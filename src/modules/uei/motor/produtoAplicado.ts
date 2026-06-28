export type ProdutoAplicadoUei = {
  produtoId?: string;
  nome: string;
  categoria: "fungicida" | "herbicida" | "inseticida" | "fertilizante" | "semente" | "outro";
  dose?: number;
  unidade?: string;
};

export function produtoMoveMotor(produto: ProdutoAplicadoUei) {
  return Boolean(produto.nome && produto.categoria);
}