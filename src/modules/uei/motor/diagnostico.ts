export type DiagnosticoUei = {
  ueiId: string;
  pontosFortes: string[];
  pontosAtencao: string[];
  confiabilidade: number;
};

export function criarDiagnosticoInicial(ueiId: string): DiagnosticoUei {
  return {
    ueiId,
    pontosFortes: [],
    pontosAtencao: [],
    confiabilidade: 0,
  };
}