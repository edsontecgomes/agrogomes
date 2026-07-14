import type {
  NomeEtapaAgronomica,
} from "./types";

export const ORDEM_ETAPAS_AGRONOMICAS: NomeEtapaAgronomica[] = [
  "recepcao",
  "validacao",
  "idempotencia",
  "contexto_agronomico",
  "registro_evento",
  "timeline",
  "motor_cientifico",
  "motor_estatistico",
  "motor_aprendizagem",
  "motor_conhecimento",
  "motor_recomendacao",
  "auditoria",
  "finalizacao",
];

export function obterIndiceEtapa(
  etapa: NomeEtapaAgronomica,
): number {
  return ORDEM_ETAPAS_AGRONOMICAS.indexOf(
    etapa,
  );
}

export function etapaEstaDepoisOuIgual(
  etapa: NomeEtapaAgronomica,
  referencia: NomeEtapaAgronomica,
): boolean {
  return (
    obterIndiceEtapa(etapa) >=
    obterIndiceEtapa(referencia)
  );
}

export function obterDependenciaEtapa(
  etapa: NomeEtapaAgronomica,
): NomeEtapaAgronomica | undefined {
  switch (etapa) {
    case "motor_aprendizagem":
      return "motor_cientifico";

    case "motor_conhecimento":
      return "motor_aprendizagem";

    case "motor_recomendacao":
      return "motor_conhecimento";

    default:
      return undefined;
  }
}