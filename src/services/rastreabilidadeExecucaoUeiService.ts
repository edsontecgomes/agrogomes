import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc
} from 'firebase/firestore';

import { calcularCoberturaOperacional } from '../modules/motorEspacial/calcularCoberturaOperacional';
import { resolverUEIsPorTrajeto } from '../modules/motorEspacial/resolverUEIsPorTrajeto';
import { db } from './firebase';
import {
  ExecucaoServico,
  Location,
  OrdemServico,
  Talhao
} from '../types';

type ProdutoExecucao = NonNullable<
  ExecucaoServico['produtos']
>[number];

export interface MaterialAplicadoUEI {
  produtoId: string;
  nome: string;
  categoria?: string;
  lote?: string;
  dose: number;
  unidade?: string;
  quantidadeEstimada: number;
}

export interface CoberturaExecucaoUEI {
  ueiId: string;
  codigo?: string;
  nome?: string;
  zonaTalhao?: string;
  areaTotalUEIHa: number;
  areaTrabalhadaHa: number;
  percentualCobertura: number;
  materiais: MaterialAplicadoUEI[];
}

export interface RastreabilidadeExecucaoUEI {
  execucao: ExecucaoServico;
  trajetosValidos: Array<Location & { timestamp: number }>;
  ueiIds: string[];
  coberturas: CoberturaExecucaoUEI[];
  areaExecutadaHa: number;
  confiabilidade: number;
  metodo: string;
  observacoes: string[];
  status: 'concluida' | 'sem_cobertura';
}

interface PrepararRastreabilidadeParams {
  execucaoId: string;
  ordem: OrdemServico;
  talhao?: Talhao;
  locationEnd?: Location | null;
}

function normalizarProdutos(
  execucao: ExecucaoServico,
  ordem: OrdemServico
): ProdutoExecucao[] {
  return execucao.produtos && execucao.produtos.length > 0
    ? execucao.produtos
    : ordem.produtos || [];
}

function calcularMateriais(
  produtos: ProdutoExecucao[],
  areaTrabalhadaHa: number,
  tipoOperacao: OrdemServico['tipoOperacao']
): MaterialAplicadoUEI[] {
  const isAreaBased = [
    'Plantio',
    'Pulverizacao',
    'Adubacao'
  ].includes(tipoOperacao);

  return produtos.map(produto => {
    const dose = Number(produto.dose || 0);
    const quantidadeEstimada = isAreaBased
      ? dose * areaTrabalhadaHa
      : dose;

    return {
      produtoId: produto.produtoId,
      nome: produto.nome || 'Insumo',
      ...(produto.categoria
        ? { categoria: produto.categoria }
        : {}),
      ...(produto.lote ? { lote: produto.lote } : {}),
      dose,
      ...(produto.unidade
        ? { unidade: produto.unidade }
        : {}),
      quantidadeEstimada: Number(
        quantidadeEstimada.toFixed(4)
      )
    };
  });
}

function montarTrajetoValido(
  execucao: ExecucaoServico,
  locationEnd?: Location | null
): Array<Location & { timestamp: number }> {
  const pontos = (execucao.path || []).filter(
    ponto =>
      Number.isFinite(ponto.lat) &&
      Number.isFinite(ponto.lng) &&
      (ponto.accuracy === undefined || ponto.accuracy <= 20)
  );

  if (
    locationEnd &&
    Number.isFinite(locationEnd.lat) &&
    Number.isFinite(locationEnd.lng) &&
    (locationEnd.accuracy === undefined ||
      locationEnd.accuracy <= 20)
  ) {
    pontos.push({
      ...locationEnd,
      timestamp: Date.now()
    });
  }

  return pontos;
}

export async function prepararRastreabilidadeExecucaoUEI({
  execucaoId,
  ordem,
  talhao,
  locationEnd
}: PrepararRastreabilidadeParams): Promise<RastreabilidadeExecucaoUEI> {
  const snapshot = await getDoc(
    doc(db, 'execucoes_servico', execucaoId)
  );

  if (!snapshot.exists()) {
    throw new Error('Execução não encontrada para rastreabilidade.');
  }

  const execucao = {
    id: snapshot.id,
    ...snapshot.data()
  } as ExecucaoServico;

  const trajetosValidos = montarTrajetoValido(
    execucao,
    locationEnd
  );
  const larguraOperacionalMetros = Number(
    ordem.larguraOperacional || 0
  );
  const produtos = normalizarProdutos(execucao, ordem);

  const resultado = await calcularCoberturaOperacional({
    farmId: execucao.farmId,
    talhaoId: execucao.talhaoId,
    trajetos: trajetosValidos.map(ponto => ({
      lat: ponto.lat,
      lng: ponto.lng,
      accuracy: ponto.accuracy,
      timestamp: new Date(ponto.timestamp).toISOString()
    })),
    larguraOperacionalMetros
  });

  if (
    resultado.coberturas.length === 0 &&
    trajetosValidos.length > 0
  ) {
    const resolucao = await resolverUEIsPorTrajeto({
      farmId: execucao.farmId,
      talhaoId: execucao.talhaoId,
      trajetos: trajetosValidos.map(ponto => ({
        lat: ponto.lat,
        lng: ponto.lng,
        accuracy: ponto.accuracy,
        timestamp: new Date(ponto.timestamp).toISOString()
      }))
    });

    return {
      execucao,
      trajetosValidos,
      ueiIds: resolucao.ueiIds,
      coberturas: resolucao.ueis.map(uei => ({
        ueiId: uei.id,
        ...(uei.codigo ? { codigo: uei.codigo } : {}),
        ...(uei.nome ? { nome: uei.nome } : {}),
        ...(uei.zonaTalhao
          ? { zonaTalhao: uei.zonaTalhao }
          : {}),
        areaTotalUEIHa: uei.areaHa,
        areaTrabalhadaHa: 0,
        percentualCobertura: 0,
        materiais: calcularMateriais(
          produtos,
          0,
          ordem.tipoOperacao
        )
      })),
      areaExecutadaHa: 0,
      confiabilidade: resolucao.confiabilidade,
      metodo: resolucao.metodo,
      observacoes: [
        ...resultado.observacoes,
        ...resolucao.observacoes,
        'As UEIs foram identificadas, mas a área trabalhada não pôde ser calculada.'
      ],
      status: 'sem_cobertura'
    };
  }

  const ueiPorId = new Map(
    resultado.ueis.map(uei => [uei.id, uei])
  );

  const coberturas = resultado.coberturas.map(cobertura => {
    const uei = ueiPorId.get(cobertura.ueiId);

    return {
      ueiId: cobertura.ueiId,
      ...(uei?.codigo ? { codigo: uei.codigo } : {}),
      ...(uei?.nome ? { nome: uei.nome } : {}),
      ...(uei?.zonaTalhao
        ? { zonaTalhao: uei.zonaTalhao }
        : {}),
      areaTotalUEIHa: cobertura.areaTotalUEIHa,
      areaTrabalhadaHa: cobertura.areaCobertaHa,
      percentualCobertura: cobertura.percentualCobertura,
      materiais: calcularMateriais(
        produtos,
        cobertura.areaCobertaHa,
        ordem.tipoOperacao
      )
    };
  });

  return {
    execucao,
    trajetosValidos,
    ueiIds: resultado.ueiIds,
    coberturas,
    areaExecutadaHa: resultado.areaTotalCobertaHa,
    confiabilidade: resultado.confiabilidade,
    metodo: resultado.metodo,
    observacoes: resultado.observacoes,
    status:
      coberturas.length > 0 ? 'concluida' : 'sem_cobertura'
  };
}

interface PersistirRastreabilidadeParams {
  rastreabilidade: RastreabilidadeExecucaoUEI;
  ordem: OrdemServico;
  talhao?: Talhao;
}

function mapearTipoOperacao(
  tipoOperacao: OrdemServico['tipoOperacao']
) {
  switch (tipoOperacao) {
    case 'Plantio':
      return 'plantio';
    case 'Pulverizacao':
      return 'pulverizacao';
    case 'Adubacao':
      return 'adubacao';
    case 'Colheita':
      return 'colheita';
    default:
      return 'outro';
  }
}

function serializarData(data: unknown): string | null {
  if (data instanceof Date) {
    return data.toISOString();
  }

  if (
    data &&
    typeof data === 'object' &&
    'toDate' in data &&
    typeof data.toDate === 'function'
  ) {
    return data.toDate().toISOString();
  }

  if (typeof data === 'string') {
    const parsed = new Date(data);

    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return null;
}

export async function persistirRastreabilidadeExecucaoUEI({
  rastreabilidade,
  ordem,
  talhao
}: PersistirRastreabilidadeParams) {
  const { execucao, coberturas } = rastreabilidade;
  const coberturasValidas = coberturas.filter(
    cobertura => cobertura.areaTrabalhadaHa > 0
  );

  for (
    let indice = 0;
    indice < coberturasValidas.length;
    indice += 20
  ) {
    const grupo = coberturasValidas.slice(
      indice,
      indice + 20
    );

    await Promise.all(
      grupo.map(cobertura =>
        setDoc(
          doc(
            db,
            'operacoesAgronomicas',
            `${execucao.id}_${cobertura.ueiId}`
          ),
          {
            farmId: execucao.farmId,
            producerId:
              talhao?.producerId || execucao.operadorId,
            talhaoId: execucao.talhaoId,
            ueiId: cobertura.ueiId,
            ueiIds: [cobertura.ueiId],
            ordemServicoId: ordem.id,
            execucaoId: execucao.id,
            tipo: mapearTipoOperacao(ordem.tipoOperacao),
            status: 'concluida',
            dataInicio: serializarData(execucao.dataInicio),
            dataFim: new Date().toISOString(),
            areaExecutadaHa: cobertura.areaTrabalhadaHa,
            percentualCobertura:
              cobertura.percentualCobertura,
            zonaTalhao: cobertura.zonaTalhao || null,
            codigoUEI: cobertura.codigo || null,
            larguraOperacionalM:
              ordem.larguraOperacional || 0,
            operadorId: execucao.operadorId,
            maquinaId: execucao.maquinaId || null,
            implementoId: execucao.implementoId || null,
            produtosUtilizados: cobertura.materiais,
            confiabilidadeEspacial:
              rastreabilidade.confiabilidade,
            metodoEspacial: rastreabilidade.metodo,
            createdBy: execucao.operadorId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          },
          { merge: true }
        )
      )
    );
  }

  await updateDoc(
    doc(db, 'execucoes_servico', execucao.id),
    {
      rastreabilidadeStatus: rastreabilidade.status,
      rastreabilidadeConsolidadaAt: serverTimestamp()
    }
  );
}
