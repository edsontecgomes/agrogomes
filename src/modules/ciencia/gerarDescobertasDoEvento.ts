import { gerarDescoberta } from "./descobertas/motorDescobertas";
import { ComparacaoCientificaEntrada } from "./typesMotorCientifico";

function normalizarId(valor: string): string {
  return valor
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-");
}

export function gerarDescobertasDoEvento(
  eventoId: string,
  comparacoes: ComparacaoCientificaEntrada[],
): Array<ReturnType<typeof gerarDescoberta>> {
  return comparacoes.map(
    (comparacao, indice) => {
      const descobertaId = [
        "DES",
        normalizarId(eventoId),
        normalizarId(comparacao.fator),
        String(indice + 1).padStart(3, "0"),
      ].join("-");

      return gerarDescoberta(
        descobertaId,
        comparacao.titulo ??
          `Variação associada a ${comparacao.fator}`,
        comparacao.descricao ??
          `Foi observada uma variação do valor ${comparacao.antes} para ${comparacao.depois}.`,
        comparacao.fator,
        comparacao.antes,
        comparacao.depois,
      );
    },
  );
}