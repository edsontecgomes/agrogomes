export type ResultadoComparacaoUei = {
  ueiA: string;
  ueiB: string;
  similaridadePercentual: number;
  fatoresSemelhantes: string[];
  fatoresDiferentes: string[];
};

export function compararUeisBasico(
  ueiA: string,
  ueiB: string,
  fatoresSemelhantes: string[] = [],
  fatoresDiferentes: string[] = [],
): ResultadoComparacaoUei {
  const total = fatoresSemelhantes.length + fatoresDiferentes.length;
  const similaridadePercentual = total === 0 ? 0 : (fatoresSemelhantes.length / total) * 100;

  return {
    ueiA,
    ueiB,
    similaridadePercentual,
    fatoresSemelhantes,
    fatoresDiferentes,
  };
}