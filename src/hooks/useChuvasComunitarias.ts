import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { ChuvaComunitaria } from "../types";
import {
  getOfflineSyncQueue,
  OFFLINE_SYNC_QUEUE_EVENT,
} from "../services/offlineSyncQueue";
import { handleFirestoreError, OperationType } from "../utils/errorHandling";

export function useChuvasComunitarias(farmId: string | null) {
  const [chuvasRemotas, setChuvasRemotas] = useState<
    ChuvaComunitaria[]
  >([]);
  const [chuvasLocais, setChuvasLocais] = useState<
    ChuvaComunitaria[]
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function refreshLocais() {
      if (!farmId) {
        setChuvasLocais([]);
        return;
      }

      const locais =
        getOfflineSyncQueue()
          .filter(
            (item) =>
              item.collectionName ===
                "chuvas_comunitarias" &&
              item.operation ===
                "create" &&
              item.payload.farmId ===
                farmId &&
              Boolean(item.documentId),
          )
          .flatMap((item) => {
            const {
              mm,
              location,
              timestampMs,
              userId,
              pluviometroId,
              source,
            } = item.payload;

            if (
              typeof mm !== "number" ||
              typeof timestampMs !==
                "number" ||
              typeof userId !== "string" ||
              typeof pluviometroId !==
                "string" ||
              typeof location !==
                "object" ||
              location === null ||
              !item.documentId
            ) {
              return [];
            }

            return [
              {
                id: item.documentId,
                mm,
                location,
                timestamp: new Date(
                  timestampMs,
                ),
                createdAt: new Date(
                  item.createdAt,
                ),
                userId,
                farmId,
                pluviometroId,
                source:
                  typeof source ===
                  "string"
                    ? source
                    : "manual",
              } as unknown as ChuvaComunitaria,
            ];
          });

      setChuvasLocais(locais);
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
      setChuvasRemotas([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, "chuvas_comunitarias"),
      where("farmId", "==", farmId),
      orderBy("timestamp", "desc"),
      limit(100),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((documento) => {
          const docData = documento.data();

          return {
            id: documento.id,
            ...docData,
            timestamp: docData.timestamp?.toDate
              ? docData.timestamp.toDate()
              : new Date(),
            createdAt: docData.createdAt?.toDate
              ? docData.createdAt.toDate()
              : new Date(),
          };
        }) as ChuvaComunitaria[];

        setChuvasRemotas(data);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(
          error,
          OperationType.LIST,
          "chuvas_comunitarias",
        );

        setChuvasRemotas([]);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [farmId]);

  const chuvasComunitarias =
    useMemo(() => {
      const porId = new Map<
        string,
        ChuvaComunitaria
      >();

      for (const chuva of [
        ...chuvasLocais,
        ...chuvasRemotas,
      ]) {
        porId.set(chuva.id, chuva);
      }

      return Array.from(
        porId.values(),
      ).sort(
        (a, b) =>
          b.timestamp.getTime() -
          a.timestamp.getTime(),
      );
    }, [
      chuvasLocais,
      chuvasRemotas,
    ]);

  return { chuvasComunitarias, loading };
}
