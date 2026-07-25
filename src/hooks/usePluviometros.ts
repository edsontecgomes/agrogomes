import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { db, auth } from "../services/firebase";
import {
  getOfflineSyncQueue,
  OFFLINE_SYNC_QUEUE_EVENT,
} from "../services/offlineSyncQueue";
import type {
  Location,
  Pluviometro,
} from "../types";
import {
  handleFirestoreError,
  OperationType,
} from "../utils/errorHandling";

function isLocation(
  value: unknown,
): value is Location {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const location = value as Record<
    string,
    unknown
  >;

  return (
    typeof location.lat === "number" &&
    Number.isFinite(location.lat) &&
    typeof location.lng === "number" &&
    Number.isFinite(location.lng)
  );
}

function carregarPluviometrosLocais(
  farmId: string | null,
): Pluviometro[] {
  if (!farmId) return [];

  return getOfflineSyncQueue()
    .filter(
      (item) =>
        item.collectionName === "pluviometros" &&
        item.operation === "create" &&
        item.payload.farmId === farmId &&
        Boolean(item.documentId),
    )
    .flatMap((item) => {
      const nome = item.payload.nome;
      const location = item.payload.location;

      if (
        typeof nome !== "string" ||
        !isLocation(location) ||
        !item.documentId
      ) {
        return [];
      }

      return [
        {
          id: item.documentId,
          nome,
          location,
          farmId,
        },
      ];
    });
}

export function usePluviometros(
  farmId: string | null,
) {
  const [
    pluviometrosRemotos,
    setPluviometrosRemotos,
  ] = useState<Pluviometro[]>([]);

  const [
    pluviometrosLocais,
    setPluviometrosLocais,
  ] = useState<Pluviometro[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function refreshLocais() {
      setPluviometrosLocais(
        carregarPluviometrosLocais(farmId),
      );
    }

    refreshLocais();

    window.addEventListener(
      OFFLINE_SYNC_QUEUE_EVENT,
      refreshLocais,
    );

    window.addEventListener(
      "storage",
      refreshLocais,
    );

    return () => {
      window.removeEventListener(
        OFFLINE_SYNC_QUEUE_EVENT,
        refreshLocais,
      );

      window.removeEventListener(
        "storage",
        refreshLocais,
      );
    };
  }, [farmId]);

  useEffect(() => {
    if (!farmId || !auth.currentUser) {
      setPluviometrosRemotos([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const pluviometrosQuery = query(
      collection(db, "pluviometros"),
      where("farmId", "==", farmId),
    );

    const unsubscribe = onSnapshot(
      pluviometrosQuery,
      (snapshot) => {
        const data = snapshot.docs.map(
          (snapshotDoc) => ({
            id: snapshotDoc.id,
            ...snapshotDoc.data(),
          }),
        ) as Pluviometro[];

        setPluviometrosRemotos(data);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(
          error,
          OperationType.LIST,
          "pluviometros",
        );

        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [farmId]);

  const pluviometros = useMemo(() => {
    const porId = new Map<
      string,
      Pluviometro
    >();

    for (const pluviometro of [
      ...pluviometrosLocais,
      ...pluviometrosRemotos,
    ]) {
      porId.set(
        pluviometro.id,
        pluviometro,
      );
    }

    return Array.from(porId.values());
  }, [
    pluviometrosLocais,
    pluviometrosRemotos,
  ]);

  return {
    pluviometros,
    loading,
  };
}
