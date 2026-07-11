import { buscarUEIsDoTalhao } from "./buscarUEIsDoTalhao";
import { calcularCoberturaUEI } from "./calcularCoberturaUEI";
import { criarFaixaOperacional } from "./criarFaixaOperacional";
import { normalizarTrajeto } from "./normalizarTrajeto";
import { ResultadoCoberturaOperacional } from "./typesCobertura";
import { PontoTrajetoEspacial } from "./typesTrajeto";

type CalcularCoberturaOperacionalParams = {
  farmId: string;
  talhaoId: string;

  trajetos: PontoTrajetoEspacial[];

  larguraOperacionalMetros: number;
};

function calcularConfiabilidade(
  trajetos: PontoTrajetoEspacial[],
): number {
  if (trajetos.length === 0) {
    return 0;
  }

  const pontosComBoaPrecisao =
    trajetos.filter(
      (ponto) =>
        ponto.accuracy === undefined ||
        ponto.accuracy <= 20,
    ).length;

  const percentualBoaPrecisao =
    pontosComBoaPrecisao /
    trajetos.length;

  const quantidadePontos =
    trajetos.length >= 10
      ? 1
      : trajetos.length / 10;

  return Number(
    (
      percentualBoaPrecisao * 0.7 +
      quantidadePontos * 0.3
    ).toFixed(2),
  );
}

export async function calcularCoberturaOperacional({
  farmId,
  talhaoId,
  trajetos,
  larguraOperacionalMetros,
}: CalcularCoberturaOperacionalParams): Promise<ResultadoCoberturaOperacional> {
  if (
    !Number.isFinite(larguraOperacionalMetros) ||
    larguraOperacionalMetros <= 0
  ) {
    return {
      ueiIds: [],
      ueis: [],
      coberturas: [],
      larguraOperacionalMetros,
      areaTotalCobertaHa: 0,
      percentualMedioCobertura: 0,
      totalUEIsAtingidas: 0,
      totalPontosTrajeto: 0,
      confiabilidade: 0,
      metodo: "largura_invalida",
      observacoes: [
        "A largura operacional é inválida.",
      ],
    };
  }

  const pontos =
    normalizarTrajeto(trajetos);

  if (pontos.length === 0) {
    return {
      ueiIds: [],
      ueis: [],
      coberturas: [],
      larguraOperacionalMetros,
      areaTotalCobertaHa: 0,
      percentualMedioCobertura: 0,
      totalUEIsAtingidas: 0,
      totalPontosTrajeto: 0,
      confiabilidade: 0,
      metodo: "trajeto_invalido",
      observacoes: [
        "O trajeto não possui pontos válidos.",
      ],
    };
  }

  const faixaOperacional =
    criarFaixaOperacional(
      pontos,
      larguraOperacionalMetros,
    );

  if (!faixaOperacional) {
    return {
      ueiIds: [],
      ueis: [],
      coberturas: [],
      larguraOperacionalMetros,
      areaTotalCobertaHa: 0,
      percentualMedioCobertura: 0,
      totalUEIsAtingidas: 0,
      totalPontosTrajeto: pontos.length,
      confiabilidade: 0,
      metodo: "trajeto_invalido",
      observacoes: [
        "Não foi possível gerar a faixa operacional.",
      ],
    };
  }

  const ueis =
    await buscarUEIsDoTalhao(
      farmId,
      talhaoId,
    );

  if (ueis.length === 0) {
    return {
      ueiIds: [],
      ueis: [],
      coberturas: [],
      larguraOperacionalMetros,
      areaTotalCobertaHa: 0,
      percentualMedioCobertura: 0,
      totalUEIsAtingidas: 0,
      totalPontosTrajeto: pontos.length,
      confiabilidade:
        calcularConfiabilidade(pontos),
      metodo: "nenhuma_uei",
      observacoes: [
        "Nenhuma UEI válida foi encontrada para o talhão.",
      ],
    };
  }

  const coberturas = ueis
    .map((uei) =>
      calcularCoberturaUEI(
        faixaOperacional,
        uei,
      ),
    )
    .filter((cobertura) =>
      cobertura.atingida,
    );

  const idsAtingidos = new Set(
    coberturas.map(
      (cobertura) => cobertura.ueiId,
    ),
  );

  const ueisAtingidas = ueis.filter(
    (uei) => idsAtingidos.has(uei.id),
  );

  const areaTotalCobertaHa =
    coberturas.reduce(
      (soma, cobertura) =>
        soma + cobertura.areaCobertaHa,
      0,
    );

  const percentualMedioCobertura =
    coberturas.length > 0
      ? coberturas.reduce(
          (soma, cobertura) =>
            soma +
            cobertura.percentualCobertura,
          0,
        ) / coberturas.length
      : 0;

  return {
    ueiIds: ueisAtingidas.map(
      (uei) => uei.id,
    ),

    ueis: ueisAtingidas,

    coberturas,

    larguraOperacionalMetros,

    areaTotalCobertaHa: Number(
      areaTotalCobertaHa.toFixed(4),
    ),

    percentualMedioCobertura: Number(
      percentualMedioCobertura.toFixed(2),
    ),

    totalUEIsAtingidas:
      ueisAtingidas.length,

    totalPontosTrajeto:
      pontos.length,

    confiabilidade:
      calcularConfiabilidade(pontos),

    metodo:
      pontos.length === 1
        ? "ponto_unico"
        : coberturas.length > 0
          ? "buffer_trajeto"
          : "nenhuma_uei",

    observacoes:
      coberturas.length > 0
        ? []
        : [
            "A faixa operacional não cobriu nenhuma UEI.",
          ],
  };
}