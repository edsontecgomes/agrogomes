export type PilarUei =
  | "ambiente"
  | "genetica"
  | "manejo"
  | "operacao"
  | "resposta_planta";

export const PILARES_UEI: PilarUei[] = [
  "ambiente",
  "genetica",
  "manejo",
  "operacao",
  "resposta_planta",
];

export function descreverPilarUei(pilar: PilarUei) {
  const descricoes: Record<PilarUei, string> = {
    ambiente: "Condições naturais e estruturais da área.",
    genetica: "Cultura, híbrido, cultivar e tratamento de sementes.",
    manejo: "Decisões agronômicas aplicadas pelo produtor.",
    operacao: "Qualidade e forma de execução das operações.",
    resposta_planta: "Resultado observado na lavoura.",
  };

  return descricoes[pilar];
}