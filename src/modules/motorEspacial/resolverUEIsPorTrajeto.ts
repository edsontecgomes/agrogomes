import { buscarUEIsDoTalhao } from "./buscarUEIsDoTalhao";
import { normalizarTrajeto } from "./normalizarTrajeto";
import { trajetoIntersectaUEI } from "./trajetoIntersectaUEI";
import {
  PontoTrajetoEspacial,
  ResultadoResolucaoTrajeto,
} from "./typesTrajeto";

type ResolverUEIsPorTrajetoParams = {
  farmId: string;
  talhaoId: string;
  trajetos: PontoTrajetoEspacial[];
};

function calcularConfiabilidadeTrajeto(
  totalRecebidos: number,
  pontosValidos: PontoTrajetoEspacial[],
): number {
  if (
    totalRecebidos === 0 ||
    pontosValidos.length === 0
  ) {
    return 0;
  }

  const percentualValido =
    pontosValidos.length / totalRecebidos;

  const pontosComPrecisaoBoa =
    pontosValidos.filter(
      (ponto) =>
        ponto.accuracy === undefined ||
        ponto.accuracy <= 20,
    ).length;

  const percentualPrecisao =
    pontosComPrecisaoBoa /
    pontosValidos.length;

  const confiabilidade =
    percentualValido * 0.5 +
    percentualPrecisao * 0.5;

  return Number(
    Math.min(1, confiabilidade).toFixed(2),
  );
}

export async function resolverUEIsPorTrajeto({
  farmId,
  talhaoId,
  trajetos,
}: ResolverUEIsPorTrajetoParams): Promise<ResultadoResolucaoTrajeto> {
  const totalPontosRecebidos =
    Array.isArray(trajetos)
      ? trajetos.length
      : 0;

  const pontosValidos =
    normalizarTrajeto(trajetos);

  if (pontosValidos.length === 0) {
    return {
      ueiIds: [],
      ueis: [],
      totalPontosRecebidos,
      totalPontosValidos: 0,
      totalUEIsPercorridas: 0,
      metodo: "trajeto_invalido",
      confiabilidade: 0,
      observacoes: [
        "O trajeto não possui pontos GPS válidos.",
      ],
    };
  }

  const ueisDoTalhao =
    await buscarUEIsDoTalhao(
      farmId,
      talhaoId,
    );

  if (ueisDoTalhao.length === 0) {
    return {
      ueiIds: [],
      ueis: [],
      totalPontosRecebidos,
      totalPontosValidos:
        pontosValidos.length,
      totalUEIsPercorridas: 0,
      metodo: "nenhuma_uei",
      confiabilidade:
        calcularConfiabilidadeTrajeto(
          totalPontosRecebidos,
          pontosValidos,
        ),
      observacoes: [
        "Nenhuma UEI geográfica válida foi encontrada para o talhão.",
      ],
    };
  }

  const ueisPercorridas =
    ueisDoTalhao.filter((uei) =>
      trajetoIntersectaUEI(
        pontosValidos,
        uei,
      ),
    );

  const observacoes: string[] = [];

  if (pontosValidos.length === 1) {
    observacoes.push(
      "A resolução foi realizada com apenas um ponto GPS.",
    );
  }

  const pontosComPrecisaoBaixa =
    pontosValidos.filter(
      (ponto) =>
        ponto.accuracy !== undefined &&
        ponto.accuracy > 20,
    ).length;

  if (pontosComPrecisaoBaixa > 0) {
    observacoes.push(
      `${pontosComPrecisaoBaixa} ponto(s) possuem precisão GPS superior a 20 metros.`,
    );
  }

  if (ueisPercorridas.length === 0) {
    observacoes.push(
      "O trajeto não intersectou nenhuma UEI cadastrada.",
    );
  }

  return {
    ueiIds: ueisPercorridas.map(
      (uei) => uei.id,
    ),

    ueis: ueisPercorridas,

    totalPontosRecebidos,

    totalPontosValidos:
      pontosValidos.length,

    totalUEIsPercorridas:
      ueisPercorridas.length,

    metodo:
      pontosValidos.length === 1
        ? "ponto_unico"
        : ueisPercorridas.length > 0
          ? "intersecao_trajeto"
          : "nenhuma_uei",

    confiabilidade:
      calcularConfiabilidadeTrajeto(
        totalPontosRecebidos,
        pontosValidos,
      ),

    observacoes,
  };
}