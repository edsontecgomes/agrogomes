type CalcularPontuacaoParams = {
  beneficio: number;

  risco: number;

  compatibilidade: number;

  confiabilidade: number;

  possuiImpedimento: boolean;
};

export function calcularPontuacaoFinal({
  beneficio,
  risco,
  compatibilidade,
  confiabilidade,
  possuiImpedimento,
}: CalcularPontuacaoParams): number {
  if (possuiImpedimento) {
    return 0;
  }

  const pontuacao =
    beneficio * 0.35 +
    compatibilidade * 0.3 +
    confiabilidade *
      100 *
      0.25 +
    (
      100 -
      risco
    ) *
      0.1;

  return Number(
    Math.max(
      0,
      Math.min(
        100,
        pontuacao,
      ),
    ).toFixed(2),
  );
}