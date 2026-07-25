import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentReference,
} from "firebase/firestore";

import type {
  LatLng,
  Talhao,
} from "../../../features/map/types/map.types";
import {
  db,
} from "../../../services/firebase";
import {
  pipelineCriacaoUEIs,
} from "../../uei/pipelineCriacaoUEIs";
import {
  montarTalhaoCadastro,
} from "./montarTalhaoCadastro";
import {
  criarPayloadTalhaoFirestore,
} from "./talhaoFirestorePayload";
import {
  validarTalhaoParaSalvar,
} from "./validarSalvarTalhao";

const COLECOES_HISTORICO_TALHAO = [
  "ordens_servico",
  "execucoes_servico",
  "eventos_agronomicos",
  "eventosAgronomicos",
  "operacoesAgronomicas",
  "produtividadesAgronomicas",
  "analisesSolo",
] as const;

const TAMANHO_LOTE_EXCLUSAO =
  400;

function obterCoordenadasTalhao(
  talhao: Talhao,
): LatLng[] {
  if (
    Array.isArray(talhao.coordenadas) &&
    talhao.coordenadas.length >= 3
  ) {
    return talhao.coordenadas;
  }

  if (
    Array.isArray(talhao.polygon) &&
    talhao.polygon.length >= 3
  ) {
    return talhao.polygon;
  }

  if (
    Array.isArray(talhao.pontos) &&
    talhao.pontos.length >= 3
  ) {
    return talhao.pontos;
  }

  return [];
}

function coordenadasSaoIguais(
  atuais: LatLng[],
  novas: LatLng[],
): boolean {
  if (
    atuais.length !==
    novas.length
  ) {
    return false;
  }

  const tolerancia = 1e-9;

  return atuais.every(
    (coordenada, indice) => {
      const nova =
        novas[indice];

      return Boolean(
        nova &&
          Math.abs(
            coordenada.lat -
              nova.lat,
          ) <= tolerancia &&
          Math.abs(
            coordenada.lng -
              nova.lng,
          ) <= tolerancia,
      );
    },
  );
}

async function buscarColecoesComHistorico(
  farmId: string,
  talhaoId: string,
): Promise<string[]> {
  const resultados =
    await Promise.all(
      COLECOES_HISTORICO_TALHAO.map(
        async (nomeColecao) => {
          const snapshot =
            await getDocs(
              query(
                collection(
                  db,
                  nomeColecao,
                ),
                where(
                  "farmId",
                  "==",
                  farmId,
                ),
                where(
                  "talhaoId",
                  "==",
                  talhaoId,
                ),
                limit(1),
              ),
            );

          return snapshot.empty
            ? null
            : nomeColecao;
        },
      ),
    );

  return resultados.filter(
    (
      nomeColecao,
    ): nomeColecao is
      (typeof COLECOES_HISTORICO_TALHAO)[number] =>
      nomeColecao !== null,
  );
}

async function buscarReferenciasEstrutura(
  farmId: string,
  talhaoId: string,
): Promise<{
  ueis: DocumentReference[];
  gdas: DocumentReference[];
  possuiMemoriaAgronomica: boolean;
}> {
  const [
    snapshotUEIs,
    snapshotGDAs,
  ] = await Promise.all([
    getDocs(
      query(
        collection(db, "ueis"),
        where(
          "farmId",
          "==",
          farmId,
        ),
        where(
          "talhaoId",
          "==",
          talhaoId,
        ),
      ),
    ),
    getDocs(
      query(
        collection(db, "gdas"),
        where(
          "farmId",
          "==",
          farmId,
        ),
        where(
          "talhaoId",
          "==",
          talhaoId,
        ),
      ),
    ),
  ]);

  return {
    ueis:
      snapshotUEIs.docs.map(
        (documento) =>
          documento.ref,
      ),
    gdas:
      snapshotGDAs.docs.map(
        (documento) =>
          documento.ref,
      ),
    possuiMemoriaAgronomica:
      snapshotGDAs.docs.some(
        (documento) => {
          const dados =
            documento.data();

          return (
            Number(
              dados.totalEventos ??
                0,
            ) > 0 ||
            Number(
              dados.totalSafras ??
                0,
            ) > 0 ||
            Number(
              dados.indiceMaturidadeCientifica ??
                0,
            ) > 0 ||
            Number(
              dados.indiceConfiabilidade ??
                0,
            ) > 0
          );
        },
      ),
  };
}

async function excluirReferencias(
  referencias: DocumentReference[],
): Promise<void> {
  for (
    let inicio = 0;
    inicio < referencias.length;
    inicio += TAMANHO_LOTE_EXCLUSAO
  ) {
    const lote =
      referencias.slice(
        inicio,
        inicio +
          TAMANHO_LOTE_EXCLUSAO,
      );
    const batch =
      writeBatch(db);

    lote.forEach(
      (referencia) => {
        batch.delete(referencia);
      },
    );

    await batch.commit();
  }
}

function montarTalhaoAtualizado(
  talhaoAtual: Talhao,
  nome: string,
  coordenadas: LatLng[],
  areaHa: number,
  payload: ReturnType<
    typeof criarPayloadTalhaoFirestore
  >,
): Talhao {
  return {
    ...talhaoAtual,
    producerId:
      payload.producerId,
    farmId:
      payload.farmId,
    nome:
      nome.trim(),
    coordenadas,
    pontos: coordenadas,
    limiteOperacional:
      payload.limiteOperacional,
    limiteAtivacaoOperacional:
      payload.limiteAtivacaoOperacional,
    limiteNucleoProdutivo:
      payload.limiteNucleoProdutivo,
    areaHa,
    area: areaHa,
    areaOperacionalHa:
      payload.areaOperacionalHa,
    bordaduraPercentual:
      payload.bordaduraPercentual,
    bordaduraAgronomicaPercentual:
      payload.bordaduraAgronomicaPercentual,
    distanciaSegurancaOperacionalMetros:
      payload.distanciaSegurancaOperacionalMetros,
    areaAtivacaoOperacionalHa:
      payload.areaAtivacaoOperacionalHa,
    areaBordaduraAgronomicaHa:
      payload.areaBordaduraAgronomicaHa,
    areaNucleoProdutivoHa:
      payload.areaNucleoProdutivoHa,
    perimetroMetros:
      payload.perimetroMetros,
    centroide:
      payload.centroide ??
      undefined,
    status:
      payload.status,
    updatedAt: new Date(),
  };
}

export type AtualizarTalhaoComEstruturaParams = {
  talhaoAtual: Talhao;
  producerId: string;
  farmId: string;
  nome: string;
  coordenadas: LatLng[];
  areaHa: number;
};

export async function atualizarTalhaoComEstrutura({
  talhaoAtual,
  producerId,
  farmId,
  nome,
  coordenadas,
  areaHa,
}: AtualizarTalhaoComEstruturaParams) {
  if (
    talhaoAtual.farmId !==
    farmId
  ) {
    throw new Error(
      "O talhão selecionado não pertence à fazenda ativa.",
    );
  }

  const talhaoMontado =
    montarTalhaoCadastro({
      farmId,
      nome,
      coordenadas,
      areaHa,
    });
  const validacao =
    validarTalhaoParaSalvar(
      talhaoMontado,
    );

  if (!validacao.valido) {
    throw new Error(
      validacao.mensagens.join(
        " ",
      ),
    );
  }

  const geometriaAlterada =
    !coordenadasSaoIguais(
      obterCoordenadasTalhao(
        talhaoAtual,
      ),
      coordenadas,
    );

  if (geometriaAlterada) {
    const colecoesComHistorico =
      await buscarColecoesComHistorico(
        farmId,
        talhaoAtual.id,
      );

    if (
      colecoesComHistorico.length >
      0
    ) {
      throw new Error(
        "O limite não pode ser alterado porque o talhão já possui histórico operacional ou agronômico. O nome ainda pode ser corrigido sem mover os vértices.",
      );
    }
  }

  const estruturaAnterior =
    await buscarReferenciasEstrutura(
      farmId,
      talhaoAtual.id,
    );

  if (
    geometriaAlterada &&
    estruturaAnterior
      .possuiMemoriaAgronomica
  ) {
    throw new Error(
      "O limite não pode ser alterado porque os GDAs deste talhão já possuem Memória Agronômica. O nome ainda pode ser corrigido sem mover os vértices.",
    );
  }

  const payloadCompleto =
    criarPayloadTalhaoFirestore(
      talhaoMontado,
      producerId,
    );
  const {
    createdAt:
      _createdAtIgnorado,
    ...payloadAtualizacao
  } = payloadCompleto;

  await updateDoc(
    doc(
      db,
      "talhoes",
      talhaoAtual.id,
    ),
    {
      ...payloadAtualizacao,
      updatedAt:
        serverTimestamp(),
    },
  );

  const resultadoUEIs =
    await pipelineCriacaoUEIs({
      producerId,
      farmId,
      talhaoId:
        talhaoAtual.id,
      nomeTalhao: nome.trim(),
      coordenadasTalhao:
        talhaoMontado.coordenadas,
      limiteNucleoProdutivo:
        talhaoMontado.limiteNucleoProdutivo,
      areaAlvoHa: 1,
      areaMinimaHa: 0.2,
    });

  const idsUEIsAtuais =
    new Set(
      resultadoUEIs.ueis.map(
        (uei) => uei.id,
      ),
    );
  const referenciasObsoletas = [
    ...estruturaAnterior.ueis.filter(
      (referencia) =>
        !idsUEIsAtuais.has(
          referencia.id,
        ),
    ),
    ...estruturaAnterior.gdas.filter(
      (referencia) => {
        const ueiId =
          referencia.id.startsWith(
            "GDA-",
          )
            ? referencia.id.slice(4)
            : "";

        return (
          !ueiId ||
          !idsUEIsAtuais.has(
            ueiId,
          )
        );
      },
    ),
  ];

  await excluirReferencias(
    referenciasObsoletas,
  );

  return {
    talhao:
      montarTalhaoAtualizado(
        talhaoAtual,
        nome,
        coordenadas,
        areaHa,
        payloadCompleto,
      ),
    totalUEIs:
      resultadoUEIs.totalUEIs,
    totalGDAs:
      resultadoUEIs.totalGDAs,
  };
}

export type ExcluirTalhaoComEstruturaParams = {
  talhao: Talhao;
  farmId: string;
};

export async function excluirTalhaoComEstrutura({
  talhao,
  farmId,
}: ExcluirTalhaoComEstruturaParams): Promise<void> {
  if (talhao.farmId !== farmId) {
    throw new Error(
      "O talhão selecionado não pertence à fazenda ativa.",
    );
  }

  const colecoesComHistorico =
    await buscarColecoesComHistorico(
      farmId,
      talhao.id,
    );

  if (
    colecoesComHistorico.length > 0
  ) {
    throw new Error(
      "Este talhão não pode ser excluído porque já possui histórico operacional ou agronômico. Essa proteção evita apagar a Memória Agronômica da área.",
    );
  }

  const estrutura =
    await buscarReferenciasEstrutura(
      farmId,
      talhao.id,
    );

  if (
    estrutura.possuiMemoriaAgronomica
  ) {
    throw new Error(
      "Este talhão não pode ser excluído porque seus GDAs já possuem Memória Agronômica.",
    );
  }

  await excluirReferencias([
    ...estrutura.gdas,
    ...estrutura.ueis,
  ]);

  await excluirReferencias([
    doc(
      db,
      "talhoes",
      talhao.id,
    ),
  ]);
}
