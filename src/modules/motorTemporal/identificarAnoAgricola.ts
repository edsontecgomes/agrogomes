import { ConfiguracaoAnoAgricola } from "./types";

const CONFIGURACAO_PADRAO: ConfiguracaoAnoAgricola = {
  mesInicio: 7,
  diaInicio: 1,
};

export function identificarAnoAgricola(
  data: Date,
  configuracao: ConfiguracaoAnoAgricola =
    CONFIGURACAO_PADRAO,
): string {
  const ano = data.getUTCFullYear();

  const mes = data.getUTCMonth() + 1;

  const dia = data.getUTCDate();

  const iniciouNovoAnoAgricola =
    mes > configuracao.mesInicio ||
    (
      mes === configuracao.mesInicio &&
      dia >= configuracao.diaInicio
    );

  const anoInicial =
    iniciouNovoAnoAgricola
      ? ano
      : ano - 1;

  const anoFinal =
    anoInicial + 1;

  return `${anoInicial}/${anoFinal}`;
}