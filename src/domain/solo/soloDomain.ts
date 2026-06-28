import { AnaliseSolo } from "../../types/analiseSolo";

export type ClassificacaoFertilidadeSolo =
  | "baixa"
  | "media"
  | "alta"
  | "restritiva";

export function classificarFertilidadeSolo(
  analise: AnaliseSolo
): ClassificacaoFertilidadeSolo {
  if (analise.phCaCl2 && analise.phCaCl2 < 4.8) {
    return "restritiva";
  }

  if (analise.saturacaoBases && analise.saturacaoBases < 40) {
    return "baixa";
  }

  if (analise.materiaOrganica && analise.materiaOrganica >= 4) {
    return "alta";
  }

  return "media";
}

export function identificarAlertasSolo(analise: AnaliseSolo): string[] {
  const alertas: string[] = [];

  if (analise.phCaCl2 && analise.phCaCl2 < 4.8) {
    alertas.push("pH baixo pode limitar o desenvolvimento radicular.");
  }

  if (analise.aluminio && analise.aluminio > 0.5) {
    alertas.push("Alumínio elevado pode indicar toxidez no perfil.");
  }

  if (analise.compactacao && analise.compactacao > 70) {
    alertas.push("Compactação elevada pode limitar infiltração e raízes.");
  }

  if (analise.potassio && analise.potassio < 0.15) {
    alertas.push("Potássio baixo pode limitar produtividade.");
  }

  return alertas;
}