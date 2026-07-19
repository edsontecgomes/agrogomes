import { serverTimestamp } from "firebase/firestore";
import { TalhaoCadastro } from "./talhaoCadastro";

export function criarPayloadTalhaoFirestore(
  talhao: TalhaoCadastro,
  producerId?: string,
) {
  return {
    farmId: talhao.farmId,

    producerId: producerId ?? null,

    nome: talhao.nome,

    /**
     * Limite original do talhão.
     */
    coordenadas: talhao.coordenadas,

    /**
     * Compatibilidade temporária.
     */
    pontos: talhao.coordenadas,

    /**
     * Novo contrato oficial.
     * Será utilizado pelo Grid,
     * UEIs e Motor Científico.
     */
    limiteOperacional:
      talhao.limiteOperacional,

    areaHa: talhao.areaHa,

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