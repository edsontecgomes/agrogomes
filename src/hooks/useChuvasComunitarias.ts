import { useEffect, useState } from "react";
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
import { handleFirestoreError, OperationType } from "../utils/errorHandling";

export function useChuvasComunitarias(farmId: string | null) {
  const [chuvasComunitarias, setChuvasComunitarias] = useState<
    ChuvaComunitaria[]
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!farmId || !auth.currentUser) {
      setChuvasComunitarias([]);
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

        setChuvasComunitarias(data);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(
          error,
          OperationType.LIST,
          "chuvas_comunitarias",
        );

        setChuvasComunitarias([]);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [farmId]);

  return { chuvasComunitarias, loading };
}