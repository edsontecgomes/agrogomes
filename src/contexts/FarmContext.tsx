import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../services/firebase";
import {
  cacheFazendas,
  getCachedFazendas,
} from "../services/offlineReferenceStore";
import { Fazenda, Usuario } from "../types";

interface FarmContextType {
  currentFarmId: string | null;
  setCurrentFarmId: (id: string) => void;
  fazendas: Fazenda[];
  loading: boolean;
  activeFarm: Fazenda | null;
  usuario: Usuario | null;
  searchAllFarms: (term: string) => Promise<Fazenda[]>;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

function normalizeFarm(id: string, data: any): Fazenda {
  return {
    id,
    ...data,
    createdAt: (data?.createdAt as Timestamp)?.toDate?.() || new Date(),
  } as Fazenda;
}

function isValidId(id?: string | null) {
  return Boolean(id && typeof id === "string" && id.trim().length > 0);
}

export function FarmProvider({
  usuario,
  children,
}: {
  usuario: Usuario | null;
  children: React.ReactNode;
}) {
  const [currentFarmId, setFarmIdInternal] = useState<string | null>(
    localStorage.getItem("currentFarmId"),
  );
  const [fazendas, setFazendas] = useState<Fazenda[]>([]);
  const [loading, setLoading] = useState(true);

  const searchAllFarms = async (term: string): Promise<Fazenda[]> => {
    const cleanTerm = term.trim();

    if (!cleanTerm || usuario?.role !== "system_admin") return [];

    if (!navigator.onLine) {
      const normalizedTerm =
        cleanTerm.toLocaleLowerCase("pt-BR");

      return getCachedFazendas(usuario.id)
        .filter((farm) =>
          (farm.nome || farm.name || "")
            .toLocaleLowerCase("pt-BR")
            .includes(normalizedTerm),
        )
        .slice(0, 10);
    }

    const q = query(
      collection(db, "fazendas"),
      where("nome", ">=", cleanTerm),
      where("nome", "<=", cleanTerm + "\uf8ff"),
      limit(10),
    );

    const snap = await getDocs(q);
    return snap.docs.map((d) => normalizeFarm(d.id, d.data()));
  };

  useEffect(() => {
    if (!usuario?.id) {
      setFazendas([]);
      setFarmIdInternal(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const cachedFarms =
      getCachedFazendas(usuario.id);

    if (cachedFarms.length > 0) {
      setFazendas(cachedFarms);

      const savedId =
        localStorage.getItem("currentFarmId");
      const savedExists = cachedFarms.some(
        (farm) => farm.id === savedId,
      );
      const fallbackId =
        savedId && savedExists
          ? savedId
          : cachedFarms[0].id;

      setFarmIdInternal(fallbackId);
      localStorage.setItem(
        "currentFarmId",
        fallbackId,
      );
    }

    if (usuario.role !== "admin" && usuario.role !== "produtor" && usuario.role !== "system_admin") {
      const assignedFarmId = usuario.farmId;

      if (!isValidId(assignedFarmId)) {
        setFazendas([]);
        setFarmIdInternal(null);
        setLoading(false);
        return;
      }

      getDoc(doc(db, "fazendas", assignedFarmId as string))
        .then((snap) => {
          if (!snap.exists()) {
            setFazendas([]);
            setFarmIdInternal(null);
            localStorage.removeItem("currentFarmId");
            return;
          }

          const farm = normalizeFarm(snap.id, snap.data());
          setFazendas([farm]);
          setFarmIdInternal(farm.id);
          localStorage.setItem("currentFarmId", farm.id);
          cacheFazendas(usuario.id, [farm]);
        })
        .catch((error) => {
          console.error("Farm context get farm error:", error);

          if (cachedFarms.length === 0) {
            setFazendas([]);
            setFarmIdInternal(null);
          }
        })
        .finally(() => setLoading(false));

      return;
    }

    const farmsQuery =
      usuario.role === "system_admin"
        ? query(collection(db, "fazendas"), limit(20))
        : query(collection(db, "fazendas"), where("producerId", "==", usuario.id));

    const unsubscribe = onSnapshot(
      farmsQuery,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => normalizeFarm(d.id, d.data()));

        if (
          snapshot.metadata.fromCache &&
          docs.length === 0 &&
          cachedFarms.length > 0
        ) {
          setFazendas(cachedFarms);
          setLoading(false);
          return;
        }

        setFazendas(docs);
        cacheFazendas(usuario.id, docs);

        if (docs.length > 0) {
          const savedId = localStorage.getItem("currentFarmId");
          const savedExists = docs.some((farm) => farm.id === savedId);

          const primaryExists =
            usuario.primaryFarmId &&
            docs.some((farm) => farm.id === usuario.primaryFarmId);

          const defaultId =
            savedId && savedExists
              ? savedId
              : primaryExists
                ? usuario.primaryFarmId
                : docs[0].id;

         if (defaultId) {
  setFarmIdInternal(defaultId);
  localStorage.setItem("currentFarmId", defaultId);
} else {
  setFarmIdInternal(null);
  localStorage.removeItem("currentFarmId");
}
        } else {
          setFarmIdInternal(null);
          localStorage.removeItem("currentFarmId");
        }

        setLoading(false);
      },
      (error) => {
        console.error("Farm context snapshot error:", error);

        if (cachedFarms.length === 0) {
          setFazendas([]);
          setFarmIdInternal(null);
        }

        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [usuario?.id, usuario?.role, usuario?.farmId, usuario?.primaryFarmId]);

  const setCurrentFarmId = (id: string) => {
    if (!isValidId(id)) return;

    setFarmIdInternal(id);
    localStorage.setItem("currentFarmId", id);

    if (usuario?.id && navigator.onLine) {
      updateDoc(doc(db, "usuarios", usuario.id), {
        primaryFarmId: id,
      }).catch(console.error);
    }
  };

  const activeFarm = useMemo(
    () => fazendas.find((farm) => farm.id === currentFarmId) || null,
    [fazendas, currentFarmId],
  );

  return (
    <FarmContext.Provider
      value={{
        currentFarmId,
        setCurrentFarmId,
        fazendas,
        loading,
        activeFarm,
        usuario,
        searchAllFarms,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
}

export function useFarm() {
  const context = useContext(FarmContext);

  if (context === undefined) {
    throw new Error("useFarm must be used within a FarmProvider");
  }

  return context;
}
