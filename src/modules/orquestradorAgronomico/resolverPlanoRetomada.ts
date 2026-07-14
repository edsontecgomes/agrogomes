import {
  etapaEstaDepoisOuIgual,
} from "./ordemEtapasAgronomicas";

import type {
  EntradaOrquestradorAgronomico,
  NomeEtapaAgronomica,
} from "./types";

export type PlanoRetomadaAgronomica = {
  etapaInicial:
    NomeEtapaAgronomica;

  reprocessamentoParcialSolicitado:
    boolean;

  deveExecutar: (
    etapa: NomeEtapaAgronomica,
  ) => boolean;
};

export function resolverPlanoRetomada(
  entrada:
    EntradaOrquestradorAgronomico,
): PlanoRetomadaAgronomica {
  const etapaInicial =
    entrada.etapaRetomada ??
    "recepcao";

  const reprocessamentoParcialSolicitado =
    Boolean(
      entrada.etapaRetomada,
    );

  return {
    etapaInicial,

    reprocessamentoParcialSolicitado,

    deveExecutar: (
      etapa:
        NomeEtapaAgronomica,
    ) =>
      etapaEstaDepoisOuIgual(
        etapa,
        etapaInicial,
      ),
  };
}