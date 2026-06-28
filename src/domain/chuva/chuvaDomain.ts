import { ChuvaAgronomica } from "../../types/chuvaAgronomica";

export type ClassificacaoChuva =
  | "sem_chuva"
  | "baixa"
  | "adequada"
  | "excessiva";

export function classificarChuvaPorVolume(
  volumeMm: number
): ClassificacaoChuva {
  if (volumeMm <= 0) return "sem_chuva";
  if (volumeMm < 10) return "baixa";
  if (volumeMm <= 60) return "adequada";
  return "excessiva";
}

export function calcularChuvaAcumulada(
  chuvas: ChuvaAgronomica[]
): number {
  return chuvas.reduce((total, chuva) => total + chuva.volumeMm, 0);
}

export function calcularDiasSemChuva(
  chuvas: ChuvaAgronomica[],
  dataReferencia: string = new Date().toISOString()
): number {
  if (chuvas.length === 0) return 999;

  const chuvasOrdenadas = [...chuvas].sort(
    (a, b) =>
      new Date(b.dataChuva).getTime() -
      new Date(a.dataChuva).getTime()
  );

  const ultimaChuva = new Date(chuvasOrdenadas[0].dataChuva).getTime();
  const referencia = new Date(dataReferencia).getTime();

  const diffMs = referencia - ultimaChuva;

  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function identificarAlertasChuva(
  chuvas: ChuvaAgronomica[]
): string[] {
  const alertas: string[] = [];
  const acumulado = calcularChuvaAcumulada(chuvas);
  const diasSemChuva = calcularDiasSemChuva(chuvas);

  if (diasSemChuva >= 10) {
    alertas.push("Período prolongado sem chuva.");
  }

  if (acumulado > 150) {
    alertas.push("Chuva acumulada elevada pode indicar risco de encharcamento.");
  }

  if (acumulado < 20 && chuvas.length > 0) {
    alertas.push("Chuva acumulada baixa para suporte ao desenvolvimento inicial.");
  }

  return alertas;
}