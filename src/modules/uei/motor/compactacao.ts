export type RegistroCompactacao = {
  ueiId: string;
  data: string;
  profundidadeCm: number;
  resistenciaMpa: number;
};

export function classificarCompactacao(resistenciaMpa: number) {
  if (resistenciaMpa < 1.5) return "baixa";
  if (resistenciaMpa < 2.5) return "moderada";
  if (resistenciaMpa < 3.5) return "alta";

  return "critica";
}