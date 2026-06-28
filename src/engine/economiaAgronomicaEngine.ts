import {
  calcularMargemAgronomica,
  identificarAlertasEconomicos,
} from "../domain/economia/economiaAgronomicaDomain";
import { RegistroEconomicoAgronomico } from "../types/economiaAgronomica";

export function analisarEconomiaAgronomica(
  registros: RegistroEconomicoAgronomico[]
) {
  const custos = registros.filter((item) => item.tipo === "custo");
  const receitas = registros.filter((item) => item.tipo === "receita");

  return {
    quantidadeRegistros: registros.length,
    custoTotal: custos.reduce((total, item) => total + item.valorTotal, 0),
    receitaTotal: receitas.reduce((total, item) => total + item.valorTotal, 0),
    margem: calcularMargemAgronomica(receitas, custos),
    alertas: identificarAlertasEconomicos(registros),
    analisadoEm: new Date().toISOString(),
  };
}