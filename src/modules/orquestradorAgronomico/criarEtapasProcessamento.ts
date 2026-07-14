import {
  ORDEM_ETAPAS_AGRONOMICAS,
} from "./ordemEtapasAgronomicas";

import type {
  NomeEtapaAgronomica,
  ObrigatoriedadeEtapa,
  RegistroEtapaAgronomica,
} from "./types";

function definirObrigatoriedade(
  etapa: NomeEtapaAgronomica,
): ObrigatoriedadeEtapa {
  const obrigatorias:
    NomeEtapaAgronomica[] = [
      "recepcao",
      "validacao",
      "idempotencia",
      "contexto_agronomico",
      "registro_evento",
      "timeline",
      "auditoria",
      "finalizacao",
    ];

  return obrigatorias.includes(etapa)
    ? "obrigatoria"
    : "opcional";
}

export function criarEtapasProcessamento(): RegistroEtapaAgronomica[] {
  return ORDEM_ETAPAS_AGRONOMICAS.map(
    (etapa) => ({
      etapa,

      status:
        "pendente",

      obrigatoriedade:
        definirObrigatoriedade(
          etapa,
        ),

      tentativas:
        0,
    }),
  );
}