export type ResultadoNormalizacaoData = {
  dataISO: string;

  timestampMs: number;

  valida: boolean;

  observacoes: string[];
};

export function normalizarDataISO(
  valor?: string | Date | number,
): ResultadoNormalizacaoData {
  const observacoes: string[] = [];

  if (
    valor === undefined ||
    valor === null ||
    valor === ""
  ) {
    observacoes.push(
      "Data ausente. Foi utilizada a data atual.",
    );

    const agora = new Date();

    return {
      dataISO: agora.toISOString(),
      timestampMs: agora.getTime(),
      valida: false,
      observacoes,
    };
  }

  const data =
    valor instanceof Date
      ? valor
      : new Date(valor);

  const timestampMs = data.getTime();

  if (Number.isNaN(timestampMs)) {
    observacoes.push(
      "Data inválida. Foi utilizada a data atual.",
    );

    const agora = new Date();

    return {
      dataISO: agora.toISOString(),
      timestampMs: agora.getTime(),
      valida: false,
      observacoes,
    };
  }

  return {
    dataISO: data.toISOString(),
    timestampMs,
    valida: true,
    observacoes,
  };
}