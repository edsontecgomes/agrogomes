import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

import { db } from "../../services/firebase";
import { addOfflineSyncItem } from "../../services/offlineSyncQueue";
import {
  shouldFallbackToOffline,
  withWriteTimeout,
} from "../../services/resilientWrite";
import type {
  PontoColetaSolo,
  RegistroColetaSolo,
} from "./types";

const CHAVE_CACHE = "eqtara:coletas-solo:v1";

function lerCache(): RegistroColetaSolo[] {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_CACHE) ?? "[]");
  } catch {
    return [];
  }
}

function salvarCache(registros: RegistroColetaSolo[]) {
  localStorage.setItem(CHAVE_CACHE, JSON.stringify(registros));
}

export async function listarColetasSolo(farmId: string) {
  const locais = lerCache().filter((item) => item.farmId === farmId);
  if (!navigator.onLine) return locais;
  try {
    const snapshot = await getDocs(
      query(collection(db, "coletas_solo"), where("farmId", "==", farmId)),
    );
    const remotos = snapshot.docs.map(
      (documento) => ({ id: documento.id, ...documento.data() }) as RegistroColetaSolo,
    );
    const combinados = new Map(locais.map((item) => [item.id, item]));
    remotos.forEach((item) => combinados.set(item.id, item));
    const resultado = [...combinados.values()];
    salvarCache([
      ...lerCache().filter((item) => item.farmId !== farmId),
      ...resultado,
    ]);
    return resultado;
  } catch {
    return locais;
  }
}

export async function registrarColetaSolo(registro: RegistroColetaSolo) {
  const payload = JSON.parse(JSON.stringify(registro)) as Record<string, unknown>;
  const atualizarLocal = () => {
    const atuais = lerCache().filter((item) => item.id !== registro.id);
    salvarCache([...atuais, registro]);
  };
  if (!navigator.onLine) {
    addOfflineSyncItem({
      collectionName: "coletas_solo",
      documentId: registro.id,
      operation: "create",
      payload,
    });
    atualizarLocal();
    return "offline" as const;
  }
  try {
    await withWriteTimeout(
      setDoc(doc(db, "coletas_solo", registro.id), {
        ...payload,
        createdAt: serverTimestamp(),
      }),
    );
    atualizarLocal();
    return "online" as const;
  } catch (erro) {
    if (!shouldFallbackToOffline(erro)) throw erro;
    addOfflineSyncItem({
      collectionName: "coletas_solo",
      documentId: registro.id,
      operation: "create",
      payload,
    });
    atualizarLocal();
    return "offline" as const;
  }
}

export async function salvarPontosPermanentes(pontos: PontoColetaSolo[]) {
  if (!navigator.onLine) return;
  await Promise.all(
    pontos.map((pontoColeta) =>
      setDoc(
        doc(db, "pontos_coleta_solo", pontoColeta.id),
        { ...pontoColeta, updatedAt: serverTimestamp() },
        { merge: true },
      ),
    ),
  );
}

export async function comporAmostraUEI(params: {
  farmId: string;
  talhaoId: string;
  ueiId: string;
  profundidade: string;
  coletaIds: string[];
  usuarioId: string;
}) {
  const id = `${params.ueiId}__${params.profundidade}__${new Date()
    .toISOString()
    .slice(0, 10)}`;
  const payload = { ...params, id, status: "composta", compostaEm: new Date().toISOString() };
  if (!navigator.onLine) {
    addOfflineSyncItem({
      collectionName: "amostras_compostas_solo",
      documentId: id,
      operation: "create",
      payload,
    });
    return id;
  }
  await setDoc(doc(db, "amostras_compostas_solo", id), {
    ...payload,
    createdAt: serverTimestamp(),
  });
  return id;
}
