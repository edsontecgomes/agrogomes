import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import {
  db,
} from "../../services/firebase";

import type {
  UEIEspacial,
} from "./types";

import {
  validarUEIEspacial,
} from "./validarUEIEspacial";

export async function buscarUEIsDaFazenda(
  farmId: string,
): Promise<UEIEspacial[]> {
  if (!farmId.trim()) {
    return [];
  }

  const consulta = query(
    collection(db, "ueis"),
    where(
      "farmId",
      "==",
      farmId,
    ),
  );

  const snapshot =
    await getDocs(consulta);

  return snapshot.docs
    .map((documento) => {
      const dados =
        documento.data();

      return {
        id:
          documento.id,

        producerId:
          dados.producerId,

        farmId:
          dados.farmId,

        talhaoId:
          dados.talhaoId,

        codigo:
          dados.codigo,

        nome:
          dados.nome,

        numero:
          dados.numero,

        areaHa:
          Number(
            dados.areaHa ?? 0,
          ),

        geometria:
          Array.isArray(
            dados.geometria,
          )
            ? dados.geometria
            : [],

        centroide:
          dados.centroide,

        origem:
          dados.origem,

        zonaTalhao:
          dados.zonaTalhao,

        status:
          dados.status,
      } as UEIEspacial;
    })
    .filter(
      (uei) =>
        validarUEIEspacial(uei)
          .valida,
    )
    .sort((ueiA, ueiB) => {
      if (
        ueiA.talhaoId !==
        ueiB.talhaoId
      ) {
        return ueiA.talhaoId
          .localeCompare(
            ueiB.talhaoId,
          );
      }

      return (
        Number(ueiA.numero ?? 0) -
        Number(ueiB.numero ?? 0)
      );
    });
}
