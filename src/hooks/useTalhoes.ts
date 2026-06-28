import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../services/firebase";
import { Talhao } from "../types";
import { handleFirestoreError } from "../utils/errorHandling";

export function useTalhoes(farmId: string | undefined) {
  const [talhoes, setTalhoes] = useState<Talhao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!farmId) {
      setTalhoes([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(collection(db, "talhoes"), where("farmId", "==", farmId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((documento) => {
          const d = documento.data();

          let geometria = d.geometria;

          if (typeof geometria === "string") {
            try {
              geometria = JSON.parse(geometria);
            } catch (error) {
              console.error("Error parsing geometry JSON", error);
            }
          }

          let coordenadas = d.coordenadas;

          if (!coordenadas && geometria) {
            if (geometria.geometry && geometria.geometry.coordinates) {
              coordenadas =
                geometria.geometry.coordinates[0]?.map((c: any) => ({
                  lat: c[1],
                  lng: c[0],
                })) || [];
            } else if (geometria.coordinates) {
              coordenadas =
                geometria.coordinates[0]?.map((c: any) => ({
                  lat: c[1],
                  lng: c[0],
                })) || [];
            }
          }

          return {
            id: documento.id,
            ...d,
            geometria,
            coordenadas: coordenadas || [],
            areaHa: d.areaHa !== undefined ? d.areaHa : d.area || 0,
            area: d.area !== undefined ? d.area : d.areaHa || 0,
            createdAt: d.createdAt?.toDate?.() || new Date(),
          } as Talhao;
        });

        const ordenado = data.sort(
          (a, b) =>
            new Date(b.createdAt as any).getTime() -
            new Date(a.createdAt as any).getTime(),
        );

        setTalhoes(ordenado);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, "get" as any, "talhoes");
        setTalhoes([]);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [farmId]);

  return { talhoes, loading };
}