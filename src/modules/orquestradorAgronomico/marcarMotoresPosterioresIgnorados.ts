import { atualizarEtapaProcessamento } from "./atualizarEtapaProcessamento";
import type {
  NomeEtapaAgronomica,
  ResultadoOrquestradorAgronomico,
} from "./types";

const ETAPAS_POSTERIORES: NomeEtapaAgronomica[] = [
  "motor_estatistico",
  "motor_aprendizagem",
  "motor_conhecimento",
  "motor_recomendacao",
];

export function marcarMotoresPosterioresIgnorados(
  resultado: ResultadoOrquestradorAgronomico,
): ResultadoOrquestradorAgronomico {
  const etapas =
    ETAPAS_POSTERIORES.reduce(
      (
        etapasAtuais,
        etapa,
      ) =>
        atualizarEtapaProcessamento({
          etapas:
            etapasAtuais,

          etapa,

          status:
            "ignorada",

          mensagem:
            "Etapa reservada para o próximo pacote do Orquestrador Agronômico.",
        }),
      resultado.etapas,
    );

  return {
    ...resultado,

    etapas,
  };
}