import {
  calcularEficienciaAreaOperacao,
  identificarAlertasOperacao,
} from "../domain/operacoes/operacaoAgronomicaDomain";
import { OperacaoAgronomica } from "../types/operacaoAgronomica";

export function analisarOperacaoAgronomica(
  operacao: OperacaoAgronomica
) {
  return {
    operacao,
    eficienciaAreaPercentual: calcularEficienciaAreaOperacao(operacao),
    alertas: identificarAlertasOperacao(operacao),
    analisadoEm: new Date().toISOString(),
  };
}