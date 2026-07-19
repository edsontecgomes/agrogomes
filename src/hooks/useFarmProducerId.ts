import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import {
  useEffect,
  useState,
} from "react";

import { db } from "../services/firebase";

import {
  handleFirestoreError,
} from "../utils/errorHandling";

export type ResultadoFarmProducerId = {
  producerId: string | null;

  loading: boolean;

  erro: string | null;
};

function normalizarProducerId(
  valor: unknown,
): string | null {
  if (
    typeof valor !== "string" ||
    !valor.trim()
  ) {
    return null;
  }

  return valor.trim();
}

/**
 * Resolve o produtor proprietário diretamente
 * pelo documento oficial da fazenda.
 *
 * Essa estratégia evita usar auth.currentUser.uid
 * incorretamente quando o usuário for gerente,
 * colaborador ou system_admin.
 */
export function useFarmProducerId(
  farmId: string | null | undefined,
): ResultadoFarmProducerId {
  const [producerId, setProducerId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [erro, setErro] =
    useState<string | null>(null);

  useEffect(() => {
    if (!farmId?.trim()) {
      setProducerId(null);
      setErro(
        "Não foi possível identificar o produtor: farmId não informado.",
      );
      setLoading(false);

      return;
    }

    setLoading(true);
    setErro(null);

    const fazendaRef = doc(
      db,
      "fazendas",
      farmId,
    );

    const unsubscribe = onSnapshot(
      fazendaRef,

      (snapshot) => {
        if (!snapshot.exists()) {
          setProducerId(null);

          setErro(
            "A fazenda informada não foi encontrada.",
          );

          setLoading(false);

          return;
        }

        const data = snapshot.data();

        const produtorResolvido =
          normalizarProducerId(
            data.producerId,
          );

        if (!produtorResolvido) {
          setProducerId(null);

          setErro(
            "A fazenda não possui producerId vinculado.",
          );

          setLoading(false);

          return;
        }

        setProducerId(produtorResolvido);
        setErro(null);
        setLoading(false);
      },

      (error) => {
        handleFirestoreError(
          error,
          "get" as any,
          "fazendas",
        );

        setProducerId(null);

        setErro(
          "Não foi possível carregar o produtor responsável pela fazenda.",
        );

        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [farmId]);

  return {
    producerId,

    loading,

    erro,
  };
}