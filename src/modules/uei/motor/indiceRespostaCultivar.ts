export function calcularIndiceRespostaCultivar(
  produtividadeCultivar: number,
  mediaAmbiente: number,
) {
  if (!mediaAmbiente) return 0;

  return ((produtividadeCultivar - mediaAmbiente) / mediaAmbiente) * 100;
}

export function classificarRespostaCultivar(indice: number) {
  if (indice >= 10) return "resposta_alta";
  if (indice >= 3) return "resposta_positiva";
  if (indice > -3) return "resposta_neutra";
  if (indice > -10) return "resposta_negativa";

  return "resposta_baixa";
}