export function criarDataSimulada(
  dataBase: string,
  diasDepois = 0,
  horasDepois = 0,
): string {
  const timestampBase =
    Date.parse(dataBase);

  if (
    Number.isNaN(timestampBase)
  ) {
    throw new Error(
      "A data-base informada para a simulação é inválida.",
    );
  }

  const milissegundosDias =
    diasDepois *
    24 *
    60 *
    60 *
    1000;

  const milissegundosHoras =
    horasDepois *
    60 *
    60 *
    1000;

  return new Date(
    timestampBase +
      milissegundosDias +
      milissegundosHoras,
  ).toISOString();
}