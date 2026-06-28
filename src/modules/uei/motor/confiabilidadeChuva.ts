import { MOTOR_CIENTIFICO_CONFIG } from "./config";

export function calcularConfiabilidadeChuva(distanciaMetros: number) {
  const raio = MOTOR_CIENTIFICO_CONFIG.raioConfiabilidadeChuvaMetros;

  if (distanciaMetros <= raio) return 1;

  if (distanciaMetros <= raio * 2) return 0.7;

  if (distanciaMetros <= raio * 4) return 0.4;

  return 0.15;
}

export function classificarConfiabilidadeChuva(distanciaMetros: number) {
  const score = calcularConfiabilidadeChuva(distanciaMetros);

  if (score >= 0.9) return "alta";
  if (score >= 0.6) return "media";
  if (score >= 0.3) return "baixa";

  return "muito_baixa";
}