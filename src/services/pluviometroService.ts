import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "./firebase";
import { addOfflineSyncItem } from "./offlineSyncQueue";
import type { Location, Pluviometro } from "../types";

interface CriarPluviometroInput {
  nome: string;
  location: Location;
  farmId: string;
}

interface CriarPluviometroResultado {
  pluviometro: Pluviometro;
  salvoOffline: boolean;
}

function validarInput(input: CriarPluviometroInput) {
  const nome = input.nome.trim();

  if (!nome) {
    throw new Error("Informe o nome do pluviômetro.");
  }

  if (!input.farmId) {
    throw new Error("Fazenda não identificada.");
  }

  if (
    !Number.isFinite(input.location.lat) ||
    !Number.isFinite(input.location.lng)
  ) {
    throw new Error("Localização do pluviômetro inválida.");
  }

  return {
    nome,
    farmId: input.farmId,
    location: {
      lat: input.location.lat,
      lng: input.location.lng,
      accuracy: input.location.accuracy,
      altitude: input.location.altitude,
    },
  };
}

function adicionarNaFila(
  documentId: string,
  payload: Record<string, unknown>,
) {
  addOfflineSyncItem({
    collectionName: "pluviometros",
    documentId,
    operation: "create",
    payload,
  });
}

export async function criarPluviometroResiliente(
  input: CriarPluviometroInput,
): Promise<CriarPluviometroResultado> {
  const payload = validarInput(input);
  const pluviometroRef = doc(collection(db, "pluviometros"));

  const pluviometro: Pluviometro = {
    id: pluviometroRef.id,
    nome: payload.nome,
    farmId: payload.farmId,
    location: payload.location,
  };

  if (!navigator.onLine) {
    adicionarNaFila(pluviometroRef.id, payload);

    return {
      pluviometro,
      salvoOffline: true,
    };
  }

  try {
    await setDoc(pluviometroRef, {
      ...payload,
      createdAt: serverTimestamp(),
    });

    return {
      pluviometro,
      salvoOffline: false,
    };
  } catch (error) {
    if (!navigator.onLine) {
      adicionarNaFila(pluviometroRef.id, payload);

      return {
        pluviometro,
        salvoOffline: true,
      };
    }

    throw error;
  }
}
