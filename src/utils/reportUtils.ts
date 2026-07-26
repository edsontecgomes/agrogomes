import {
  ExecucaoServico,
  SegmentoExecucao
} from '../types';
import {
  avaliarPontoGPS,
  PontoGPS
} from './geoUtils';

interface MetricasPontos {
  distanciaMetros: number;
  velocidadesKmH: number[];
}

function obterTimestamp(
  valor: unknown
): number | null {
  if (valor instanceof Date) {
    return valor.getTime();
  }

  if (
    valor &&
    typeof valor === 'object' &&
    'toDate' in valor &&
    typeof (
      valor as {
        toDate?: unknown;
      }
    ).toDate === 'function'
  ) {
    return (
      valor as {
        toDate: () => Date;
      }
    )
      .toDate()
      .getTime();
  }

  return null;
}

function calcularMetricasPontos(
  pontos: PontoGPS[]
): MetricasPontos {
  let distanciaMetros = 0;
  const velocidadesKmH: number[] = [];

  for (
    let indice = 1;
    indice < pontos.length;
    indice += 1
  ) {
    const pontoAnterior =
      pontos[indice - 1];

    const pontoAtual = pontos[indice];

    const avaliacao = avaliarPontoGPS(
      pontoAtual,
      pontoAnterior
    );

    if (
      !avaliacao.valido ||
      !avaliacao.emMovimento
    ) {
      continue;
    }

    distanciaMetros +=
      avaliacao.distanciaMetros;

    velocidadesKmH.push(
      avaliacao.velocidadeKmH
    );
  }

  return {
    distanciaMetros,
    velocidadesKmH
  };
}

/**
 * Usa o percentil 90 para impedir que uma única oscilação do GPS seja
 * apresentada como velocidade máxima da operação.
 */
function calcularVelocidadeMaximaRobusta(
  velocidadesKmH: number[]
): number {
  const velocidadesValidas =
    velocidadesKmH
      .filter(
        (velocidade) =>
          Number.isFinite(velocidade) &&
          velocidade >= 0
      )
      .sort((a, b) => a - b);

  if (velocidadesValidas.length === 0) {
    return 0;
  }

  const indicePercentil90 = Math.floor(
    (velocidadesValidas.length - 1) * 0.9
  );

  return velocidadesValidas[
    indicePercentil90
  ];
}

function obterDuracaoTotalSegundos(
  execucao: ExecucaoServico,
  pontos: PontoGPS[]
): number {
  const inicioExecucao =
    obterTimestamp(execucao.dataInicio) ??
    pontos[0]?.timestamp;

  const fimExecucao =
    obterTimestamp(execucao.dataFim) ??
    pontos[pontos.length - 1]?.timestamp;

  if (
    !Number.isFinite(inicioExecucao) ||
    !Number.isFinite(fimExecucao) ||
    fimExecucao < inicioExecucao
  ) {
    return 0;
  }

  return (
    (fimExecucao - inicioExecucao) /
    1000
  );
}

/**
 * Calcula o tempo total em segundos em que a máquina estava operando.
 */
export function calcularTempoOperando(
  segmentos: SegmentoExecucao[]
): number {
  return segmentos.reduce(
    (total, segmento) => {
      const duracaoSegmento =
        (segmento.fimTimestamp -
          segmento.inicioTimestamp) /
        1000;

      if (
        !Number.isFinite(duracaoSegmento) ||
        duracaoSegmento <= 0
      ) {
        return total;
      }

      return total + duracaoSegmento;
    },
    0
  );
}

/**
 * Calcula o tempo total em segundos em que a máquina estava parada.
 */
export function calcularTempoParado(
  execucao: ExecucaoServico,
  tempoOperando: number
): number {
  const pontos =
    (execucao.path || []) as PontoGPS[];

  const duracaoTotal =
    obterDuracaoTotalSegundos(
      execucao,
      pontos
    );

  return Math.max(
    0,
    duracaoTotal - tempoOperando
  );
}

/**
 * Calcula a área operacional estimada em hectares.
 */
export function calcularAreaEstimada(
  segmentos: SegmentoExecucao[],
  larguraPadrao: number
): number {
  const distanciaOperacional =
    segmentos.reduce(
      (distanciaTotal, segmento) => {
        const metricas =
          calcularMetricasPontos(
            segmento.pontos as PontoGPS[]
          );

        return (
          distanciaTotal +
          metricas.distanciaMetros
        );
      },
      0
    );

  return (
    (distanciaOperacional *
      Math.max(0, larguraPadrao)) /
    10000
  );
}

/**
 * Calcula métricas detalhadas de uma execução.
 */
export function gerarResumoExecucao(
  execucao: ExecucaoServico,
  segmentos: SegmentoExecucao[],
  larguraPadrao = 0
) {
  const pontos =
    (execucao.path || []) as PontoGPS[];

  if (pontos.length === 0) return null;

  const metricasTrajeto =
    calcularMetricasPontos(pontos);

  const metricasSegmentos =
    segmentos.reduce<MetricasPontos>(
      (acumulado, segmento) => {
        const metricas =
          calcularMetricasPontos(
            segmento.pontos as PontoGPS[]
          );

        return {
          distanciaMetros:
            acumulado.distanciaMetros +
            metricas.distanciaMetros,
          velocidadesKmH: [
            ...acumulado.velocidadesKmH,
            ...metricas.velocidadesKmH
          ]
        };
      },
      {
        distanciaMetros: 0,
        velocidadesKmH: []
      }
    );

  const duracaoTotal =
    obterDuracaoTotalSegundos(
      execucao,
      pontos
    );

  const tempoOperando = Math.min(
    duracaoTotal,
    calcularTempoOperando(segmentos)
  );

  const tempoParado = Math.max(
    0,
    duracaoTotal - tempoOperando
  );

  const distanciaOperacional =
    metricasSegmentos.distanciaMetros;

  const velocidadeMedia =
    tempoOperando > 0
      ? (distanciaOperacional /
          tempoOperando) *
        3.6
      : duracaoTotal > 0
        ? (metricasTrajeto.distanciaMetros /
            duracaoTotal) *
          3.6
        : 0;

  const velocidadesParaMaxima =
    metricasSegmentos.velocidadesKmH
      .length > 0
      ? metricasSegmentos.velocidadesKmH
      : metricasTrajeto.velocidadesKmH;

  return {
    distanciaTotal:
      metricasTrajeto.distanciaMetros,
    distanciaOperacional,
    velocidadeMedia,
    velocidadeMax:
      calcularVelocidadeMaximaRobusta(
        velocidadesParaMaxima
      ),
    tempoOperando,
    tempoParado,
    duracaoTotal,
    areaEstimada: calcularAreaEstimada(
      segmentos,
      larguraPadrao
    ),
    totalSegmentos: segmentos.length
  };
}

export function formatarDuracao(
  segundos: number
): string {
  const horas = Math.floor(
    segundos / 3600
  );

  const minutos = Math.floor(
    (segundos % 3600) / 60
  );

  const segundosRestantes = Math.floor(
    segundos % 60
  );

  if (horas > 0) {
    return `${horas}h ${minutos}min`;
  }

  if (minutos > 0) {
    return `${minutos}min ${segundosRestantes}s`;
  }

  return `${segundosRestantes}s`;
}
