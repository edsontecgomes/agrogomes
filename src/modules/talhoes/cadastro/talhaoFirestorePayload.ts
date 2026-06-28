import { serverTimestamp } from "firebase/firestore";
import { TalhaoCadastro } from "./talhaoCadastro";

export function criarPayloadTalhaoFirestore(
  talhao: TalhaoCadastro,
  producerId?: string,
) {
  return {
    ...talhao,
    producerId: producerId || null,
    configuracaoGeometria: {
      bordaduraPercentual: talhao.bordaduraPercentual,
      areaOperacionalHa: talhao.areaOperacionalHa,
      perimetroMetros: talhao.perimetroMetros || 0,
      centroide: talhao.centroide || null,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}