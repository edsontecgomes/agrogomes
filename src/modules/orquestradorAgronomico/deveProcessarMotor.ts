import type {
  EntradaOrquestradorAgronomico,
} from "./types";

export type MotorOpcional =
  | "estatistica"
  | "aprendizado"
  | "conhecimento"
  | "recomendacao";

export function deveProcessarMotor(
  entrada: EntradaOrquestradorAgronomico,
  motor: MotorOpcional,
): boolean {
  switch (motor) {
    case "estatistica":
      return (
        entrada.processarEstatistica !==
        false
      );

    case "aprendizado":
      return (
        entrada.processarAprendizado !==
        false
      );

    case "conhecimento":
      return (
        entrada.processarConhecimento !==
        false
      );

    case "recomendacao":
      return (
        entrada.processarRecomendacao !==
        false
      );

    default:
      return true;
  }
}