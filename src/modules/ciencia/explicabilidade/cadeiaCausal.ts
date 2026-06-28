export type EloCausal = {
  origem: string;
  destino: string;
  descricao: string;
};

export function criarCadeiaCausal(
  origem: string,
  destino: string,
  descricao: string,
): EloCausal {
  return {
    origem,
    destino,
    descricao,
  };
}