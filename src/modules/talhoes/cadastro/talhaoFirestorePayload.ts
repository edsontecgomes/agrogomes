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
     * Compatibilidade com documentos e
     * consumidores anteriores. Neste fluxo,
     * representa o limite seguro de ativação.
     */
    limiteOperacional:
      talhao.limiteOperacional,

    /**
     * Limite fixo de segurança, 20 metros
     * para dentro do limite físico.
     */
    limiteAtivacaoOperacional:
      talhao.limiteAtivacaoOperacional,

    /**
     * Limite interno da bordadura
     * agronômica de 4%.
     */
    limiteNucleoProdutivo:
      talhao.limiteNucleoProdutivo,

    areaHa:
      talhao.areaHa,

    areaOperacionalHa:
      talhao.areaOperacionalHa,

    bordaduraPercentual:
      talhao.bordaduraPercentual,

    bordaduraAgronomicaPercentual:
      talhao.bordaduraAgronomicaPercentual,

    distanciaSegurancaOperacionalMetros:
      talhao.distanciaSegurancaOperacionalMetros,

    areaAtivacaoOperacionalHa:
      talhao.areaAtivacaoOperacionalHa,

    areaBordaduraAgronomicaHa:
      talhao.areaBordaduraAgronomicaHa,

    areaNucleoProdutivoHa:
      talhao.areaNucleoProdutivoHa,

    perimetroMetros:
      talhao.perimetroMetros ?? 0,

    centroide:
      talhao.centroide ?? null,

    configuracaoGeometria: {
      bordaduraPercentual:
        talhao.bordaduraPercentual,

      bordaduraAgronomicaPercentual:
        talhao.bordaduraAgronomicaPercentual,

      distanciaSegurancaOperacionalMetros:
        talhao.distanciaSegurancaOperacionalMetros,

      areaOperacionalHa:
        talhao.areaOperacionalHa,

      areaAtivacaoOperacionalHa:
        talhao.areaAtivacaoOperacionalHa,

      areaBordaduraAgronomicaHa:
        talhao.areaBordaduraAgronomicaHa,

      areaNucleoProdutivoHa:
        talhao.areaNucleoProdutivoHa,

      perimetroMetros:
        talhao.perimetroMetros ?? 0,

      centroide:
        talhao.centroide ?? null,

      limiteOperacional:
        talhao.limiteOperacional,

      limiteAtivacaoOperacional:
        talhao.limiteAtivacaoOperacional,

      limiteNucleoProdutivo:
        talhao.limiteNucleoProdutivo,
    },

    status:
      talhao.status ?? "ativo",

    createdAt:
      serverTimestamp(),

    updatedAt:
      serverTimestamp(),
  };
}
