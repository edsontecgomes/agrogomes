import {
  addDoc,
  collection,
} from "firebase/firestore";

import type {
  Talhao,
} from "../../../features/map/types/map.types";

import {
  db,
} from "../../../services/firebase";

import type {
  TalhaoCadastro,
} from "./talhaoCadastro";

import {
  criarPayloadTalhaoFirestore,
} from "./talhaoFirestorePayload";

export async function salvarTalhaoCadastro(
  talhao: TalhaoCadastro,
  producerId: string,
): Promise<Talhao> {
  const payload =
    criarPayloadTalhaoFirestore(
      talhao,
      producerId,
    );

  const ref = await addDoc(
    collection(db, "talhoes"),
    payload,
  );

  return {
    id:
      ref.id,

    producerId:
      payload.producerId,

    farmId:
      payload.farmId,

    nome:
      payload.nome,

    coordenadas:
      payload.coordenadas,

    pontos:
      payload.pontos,

    limiteOperacional:
      payload.limiteOperacional,

    limiteAtivacaoOperacional:
      payload.limiteAtivacaoOperacional,

    limiteNucleoProdutivo:
      payload.limiteNucleoProdutivo,

    areaHa:
      payload.areaHa,

    area:
      payload.areaHa,

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

    createdAt:
      payload.createdAt,

    updatedAt:
      payload.updatedAt,
  };
}
