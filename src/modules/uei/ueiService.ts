import { UeiFaseDados } from "./types";

export const UEI_FASE_ATUAL: UeiFaseDados = {
  chuvas: true,
  ordensServico: true,
  solo: false,
  telemetria: false,
};

export function gerarCodigoUei(talhaoId: string, numero: number) {
  const sequencia = String(numero).padStart(4, "0");
  return `${talhaoId}-UEI-${sequencia}`;
}

export function descreverFaseUei() {
  return "Nesta fase, o AgroGomes irá priorizar chuvas e ordens de serviço para formar o histórico de manejo por hectare.";
}