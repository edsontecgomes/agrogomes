import { RegistroEconomicoAgronomico } from "../../types/economiaAgronomica";

export function calcularValorPorHa(
  valorTotal: number,
  areaReferenciaHa?: number
): number | undefined {
  if (!areaReferenciaHa || areaReferenciaHa <= 0) {
    return undefined;
  }

  return valorTotal / areaReferenciaHa;
}

export function calcularMargemAgronomica(
  receitas: RegistroEconomicoAgronomico[],
  custos: RegistroEconomicoAgronomico[]
): number {
  const totalReceitas = receitas.reduce(
    (total, item) => total + item.valorTotal,
    0
  );

  const totalCustos = custos.reduce(
    (total, item) => total + item.valorTotal,
    0
  );

  return totalReceitas - totalCustos;
}

export function identificarAlertasEconomicos(
  registros: RegistroEconomicoAgronomico[]
): string[] {
  const alertas: string[] = [];

  const custos = registros.filter((item) => item.tipo === "custo");
  const receitas = registros.filter((item) => item.tipo === "receita");

  const totalCustos = custos.reduce(
    (total, item) => total + item.valorTotal,
    0
  );

  const totalReceitas = receitas.reduce(
    (total, item) => total + item.valorTotal,
    0
  );

  if (totalCustos > 0 && totalReceitas > 0 && totalCustos > totalReceitas) {
    alertas.push("Custos superiores às receitas registradas.");
  }

  if (custos.length > 0 && receitas.length === 0) {
    alertas.push("Existem custos registrados sem receita correspondente.");
  }

  return alertas;
}