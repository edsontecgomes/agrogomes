import {
  calcularChuvaAcumulada,
  calcularDiasSemChuva,
  identificarAlertasChuva,
} from "../domain/chuva/chuvaDomain";
import { ChuvaAgronomica } from "../types/chuvaAgronomica";

export function analisarChuvas(chuvas: ChuvaAgronomica[]) {
  return {
    quantidadeRegistros: chuvas.length,
    chuvaAcumuladaMm: calcularChuvaAcumulada(chuvas),
    diasSemChuva: calcularDiasSemChuva(chuvas),
    alertas: identificarAlertasChuva(chuvas),
    analisadoEm: new Date().toISOString(),
  };
}