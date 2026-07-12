import { ResumoEstatistico } from "./types";

export function calcularConfiabilidadeAmostra(
  resumo: ResumoEstatistico,
): number {
  if (resumo.quantidade === 0) {
    return 0;
  }

  const fatorQuantidade =
    resumo.quantidade >= 30
      ? 1
      : resumo.quantidade / 30;

  const fatorVariabilidade =
    resumo.coeficienteVariacao <= 10
      ? 1
      : resumo.coeficienteVariacao <= 20
        ? 0.9
        : resumo.coeficienteVariacao <= 30
          ? 0.75
          : resumo.coeficienteVariacao <= 50
            ? 0.5
            : 0.25;

  return Number(
    (
      fatorQuantidade * 0.6 +
      fatorVariabilidade * 0.4
    ).toFixed(2),
  );
}