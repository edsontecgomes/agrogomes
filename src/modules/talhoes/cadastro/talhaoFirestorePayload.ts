import {
  serverTimestamp,
} from "firebase/firestore";

import {
  TalhaoCadastro,
} from "./talhaoCadastro";

export function criarPayloadTalhaoFirestore(
  talhao: TalhaoCadastro,
  producerId: string,
) {
  const producerIdNormalizado =
    producerId.trim();

  if (!producerIdNormalizado) {
    throw new Error(
      "Não foi possível criar o talhão: producerId não informado.",
    );
  }

  return {
    farmId: talhao.farmId,

    producerId:
      producerIdNormalizado,

    nome: talhao.nome,

    /**
     * Limite físico original.
     */
    coordenadas:
      talhao.coordenadas,

    /**
     * Compatibilidade temporária.
     */
    pontos:
      talhao.coordenadas,

    /**
     * Limite interno utilizado pelas
     * UEIs e pelo motor científico.
     */
    limiteOperacional:
      talhao.limiteOperacional,

    areaHa:
      talhao.areaHa,

    areaOperacionalHa:
      talhao.areaOperacionalHa,

    bordaduraPercentual:
      talhao.bordaduraPercentual,

    perimetroMetros:
      talhao.perimetroMetros ?? 0,

    centroide:
      talhao.centroide ?? null,

    configuracaoGeometria: {
      bordaduraPercentual:
        talhao.bordaduraPercentual,

      areaOperacionalHa:
        talhao.areaOperacionalHa,

      perimetroMetros:
        talhao.perimetroMetros ?? 0,

      centroide:
        talhao.centroide ?? null,

      limiteOperacional:
        talhao.limiteOperacional,
    },

    status:
      talhao.status ?? "ativo",

    createdAt:
      serverTimestamp(),

    updatedAt:
      serverTimestamp(),
  };
}