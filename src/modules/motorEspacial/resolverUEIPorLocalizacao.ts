import { buscarUEIsDoTalhao } from "./buscarUEIsDoTalhao";
import { localizarUEIsPorPonto } from "./localizarUEIsPorPonto";
import {
  CoordenadaEspacial,
  ResultadoResolucaoUEI,
} from "./types";

type ResolverUEIPorLocalizacaoParams = {
  farmId: string;
  talhaoId: string;
  localizacao?: CoordenadaEspacial;
};

function calcularConfiabilidadeGPS(
  localizacao: CoordenadaEspacial,
): number {
  if (localizacao.accuracy === undefined) {
    return 0.85;
  }

  if (localizacao.accuracy <= 5) {
    return 1;
  }

  if (localizacao.accuracy <= 10) {
    return 0.95;
  }

  if (localizacao.accuracy <= 20) {
    return 0.85;
  }

  if (localizacao.accuracy <= 30) {
    return 0.7;
  }

  return 0.5;
}

export async function resolverUEIPorLocalizacao({
  farmId,
  talhaoId,
  localizacao,
}: ResolverUEIPorLocalizacaoParams): Promise<ResultadoResolucaoUEI> {
  if (!localizacao) {
    return {
      ueiIds: [],
      ueis: [],
      metodo: "sem_localizacao",
      confiabilidade: 0,
      observacoes: [
        "Não foi possível resolver UEI porque a localização não foi informada.",
      ],
    };
  }

  const ueisDoTalhao = await buscarUEIsDoTalhao(
    farmId,
    talhaoId,
  );

  if (ueisDoTalhao.length === 0) {
    return {
      ueiIds: [],
      ueis: [],
      metodo: "nenhuma_uei",
      confiabilidade: 0,
      observacoes: [
        "Nenhuma UEI geográfica válida foi encontrada para o talhão.",
      ],
    };
  }

  const ueisEncontradas = localizarUEIsPorPonto(
    localizacao,
    ueisDoTalhao,
  );

  if (ueisEncontradas.length === 0) {
    return {
      ueiIds: [],
      ueis: [],
      metodo: "nenhuma_uei",
      confiabilidade: calcularConfiabilidadeGPS(localizacao),
      observacoes: [
        "A localização não pertence a nenhuma UEI cadastrada no talhão.",
      ],
    };
  }

  const observacoes: string[] = [];

  if (ueisEncontradas.length > 1) {
    observacoes.push(
      "O ponto foi localizado no limite compartilhado por mais de uma UEI.",
    );
  }

  if (
    localizacao.accuracy !== undefined &&
    localizacao.accuracy > 20
  ) {
    observacoes.push(
      "A precisão GPS é superior a 20 metros e pode afetar a resolução espacial.",
    );
  }

  return {
    ueiIds: ueisEncontradas.map((uei) => uei.id),
    ueis: ueisEncontradas,
    metodo: "ponto_no_poligono",
    confiabilidade: calcularConfiabilidadeGPS(localizacao),
    observacoes,
  };
}