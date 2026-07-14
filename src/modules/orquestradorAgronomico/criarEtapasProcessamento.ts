import type {
  NomeEtapaAgronomica,
  RegistroEtapaAgronomica,
} from "./types";

const ORDEM_ETAPAS: NomeEtapaAgronomica[] = [
  "recepcao",
  "validacao",
  "idempotencia",
  "registro_evento",
  "contexto_agronomico",
  "timeline",
  "motor_cientifico",
  "motor_estatistico",
  "motor_aprendizagem",
  "motor_conhecimento",
  "motor_recomendacao",
  "auditoria",
  "finalizacao",
];

export function criarEtapasProcessamento(): RegistroEtapaAgronomica[] {
  return ORDEM_ETAPAS.map(
    (etapa) => ({
      etapa,

      status: "pendente",
    }),
  );
}