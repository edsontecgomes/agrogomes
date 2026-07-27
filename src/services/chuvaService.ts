import {
  collection,
  doc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

import { db } from "./firebase";
import {
  addOfflineSyncItem,
} from "./offlineSyncQueue";
import {
  shouldFallbackToOffline,
  withWriteTimeout,
} from "./resilientWrite";
import type { Location } from "../types";

type OrigemChuva =
  | "manual"
  | "fab";

interface RegistrarChuvaInput {
  mm: number;
  location: Location;
  userId: string;
  farmId: string;
  pluviometroId: string;
  source: OrigemChuva;
  timestampMs?: number;
}

export interface RegistrarChuvaResultado {
  chuvaComunitariaId: string;
  registroPessoalId: string;
  salvoOffline: boolean;
}

function validarInput(
  input: RegistrarChuvaInput,
) {
  if (
    !Number.isFinite(input.mm) ||
    input.mm <= 0
  ) {
    throw new Error(
      "O volume de chuva deve ser maior que zero.",
    );
  }

  if (!input.userId) {
    throw new Error(
      "Usuário não autenticado.",
    );
  }

  if (!input.farmId) {
    throw new Error(
      "Fazenda não identificada.",
    );
  }

  if (!input.pluviometroId) {
    throw new Error(
      "Selecione um pluviômetro.",
    );
  }

  if (
    !Number.isFinite(
      input.location.lat,
    ) ||
    !Number.isFinite(
      input.location.lng,
    )
  ) {
    throw new Error(
      "Localização do pluviômetro inválida.",
    );
  }

  const timestampMs =
    Number.isFinite(input.timestampMs)
      ? Number(input.timestampMs)
      : Date.now();

  const dataRegistro = new Date(
    timestampMs,
  );

  return {
    mm: input.mm,
    location: input.location,
    userId: input.userId,
    farmId: input.farmId,
    pluviometroId:
      input.pluviometroId,
    source: input.source,
    timestampMs,
    month:
      dataRegistro.getMonth() + 1,
    year: dataRegistro.getFullYear(),
  };
}

function adicionarNaFila(params: {
  chuvaComunitariaId: string;
  registroPessoalId: string;
  payload: ReturnType<
    typeof validarInput
  >;
}) {
  const {
    month,
    year,
    ...corePayload
  } = params.payload;

  addOfflineSyncItem({
    collectionName:
      "chuvas_comunitarias",
    documentId:
      params.chuvaComunitariaId,
    operation: "create",
    payload: corePayload,
  });

  addOfflineSyncItem({
    collectionName:
      "registros_pessoais",
    documentId:
      params.registroPessoalId,
    operation: "create",
    payload: {
      ...corePayload,
      month,
      year,
    },
  });
}

export async function registrarChuvaResiliente(
  input: RegistrarChuvaInput,
): Promise<RegistrarChuvaResultado> {
  const payload = validarInput(input);

  const chuvaComunitariaRef = doc(
    collection(
      db,
      "chuvas_comunitarias",
    ),
  );

  const registroPessoalRef = doc(
    collection(
      db,
      "registros_pessoais",
    ),
  );

  const ids = {
    chuvaComunitariaId:
      chuvaComunitariaRef.id,
    registroPessoalId:
      registroPessoalRef.id,
  };

  if (!navigator.onLine) {
    adicionarNaFila({
      ...ids,
      payload,
    });

    return {
      ...ids,
      salvoOffline: true,
    };
  }

  const {
    timestampMs,
    month,
    year,
    ...corePayload
  } = payload;

  const batch = writeBatch(db);

  batch.set(
    chuvaComunitariaRef,
    {
      ...corePayload,
      timestamp: new Date(timestampMs),
      createdAt: serverTimestamp(),
    },
  );

  batch.set(
    registroPessoalRef,
    {
      ...corePayload,
      timestamp: new Date(timestampMs),
      month,
      year,
      createdAt: serverTimestamp(),
    },
  );

  try {
    await withWriteTimeout(
      batch.commit(),
    );

    return {
      ...ids,
      salvoOffline: false,
    };
  } catch (error) {
    if (
      !shouldFallbackToOffline(
        error,
      )
    ) {
      throw error;
    }

    // As referências são determinísticas. Se o commit online
    // terminar depois do timeout, a sincronização apenas grava
    // novamente os mesmos documentos, sem duplicar a chuva.
    adicionarNaFila({
      ...ids,
      payload,
    });

    return {
      ...ids,
      salvoOffline: true,
    };
  }
}
