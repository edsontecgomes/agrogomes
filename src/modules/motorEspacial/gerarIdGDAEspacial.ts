export function gerarIdGDAEspacial(
  ueiId: string,
): string {
  const idNormalizado = ueiId.trim();

  if (!idNormalizado) {
    throw new Error(
      "Não foi possível gerar o ID do GDA: ueiId ausente.",
    );
  }

  return `GDA-${idNormalizado}`;
}