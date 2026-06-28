import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "./firebase";

import { MemoriaAgronomicaResumo } from "../types/memoriaAgronomicaResumo";

export async function reconstruirResumoMemoriaAgronomica(
  memoriaAgronomicaId: string
): Promise<MemoriaAgronomicaResumo> {

  const ciclos = await getDocs(
    query(
      collection(db,"ciclosAgronomicos"),
      where("memoriaAgronomicaId","==",memoriaAgronomicaId)
    )
  );

  const decisoes = await getDocs(
    query(
      collection(db,"decisoesAgronomicas"),
      where("memoriaAgronomicaId","==",memoriaAgronomicaId)
    )
  );

  const eventos = await getDocs(
    query(
      collection(db,"eventosAgronomicos"),
      where("memoriaAgronomicaId","==",memoriaAgronomicaId)
    )
  );

  const resultados = await getDocs(
    query(
      collection(db,"resultadosAgronomicos"),
      where("memoriaAgronomicaId","==",memoriaAgronomicaId)
    )
  );

  const culturas = new Set<string>();
  const variedades = new Set<string>();

  ciclos.docs.forEach(doc=>{

    const d:any = doc.data();

    if(d.cultura) culturas.add(d.cultura);

    if(d.variedadeOuHibrido)
      variedades.add(d.variedadeOuHibrido);

  });

  return{

    memoriaAgronomicaId,

    producerId:"",
    farmId:"",
    talhaoId:"",

    quantidadeSafras:ciclos.size,

    quantidadeDecisoes:decisoes.size,

    quantidadeEventos:eventos.size,

    quantidadeResultados:resultados.size,

    culturasCultivadas:[...culturas],

    variedadesUtilizadas:[...variedades],

    ultimaAtualizacao:new Date().toISOString()

  };

}