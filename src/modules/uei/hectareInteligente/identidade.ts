export type IdentidadeHectareInteligente = {
  hectareId: string;
  codigo: string;
  farmId: string;
  talhaoId: string;
  numeroHectare: number;
  areaHa: number;
};

export function criarCodigoHectareInteligente(
  farmId: string,
  talhaoId: string,
  numeroHectare: number,
) {
  const seq = String(numeroHectare).padStart(5, "0");
  return `${farmId}-${talhaoId}-HI-${seq}`;
}