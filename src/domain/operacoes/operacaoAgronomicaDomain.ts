import { OperacaoAgronomica } from "../../types/operacaoAgronomica";

export function calcularEficienciaAreaOperacao(
  operacao: OperacaoAgronomica
): number | undefined {
  if (!operacao.areaPlanejadaHa || !operacao.areaExecutadaHa) {
    return undefined;
  }

  return (operacao.areaExecutadaHa / operacao.areaPlanejadaHa) * 100;
}

export function identificarAlertasOperacao(
  operacao: OperacaoAgronomica
): string[] {
  const alertas: string[] = [];

  const eficiencia = calcularEficienciaAreaOperacao(operacao);

  if (eficiencia !== undefined && eficiencia < 80) {
    alertas.push("Área executada abaixo de 80% da área planejada.");
  }

  if (
    operacao.velocidadeMediaKmH &&
    operacao.tipo === "pulverizacao" &&
    operacao.velocidadeMediaKmH > 18
  ) {
    alertas.push("Velocidade elevada para pulverização pode comprometer qualidade de aplicação.");
  }

  if (
    operacao.tipo === "plantio" &&
    operacao.velocidadeMediaKmH &&
    operacao.velocidadeMediaKmH > 8
  ) {
    alertas.push("Velocidade elevada no plantio pode comprometer distribuição de sementes.");
  }

  if (operacao.status === "cancelada") {
    alertas.push("Operação cancelada deve ser revisada no planejamento.");
  }

  return alertas;
}