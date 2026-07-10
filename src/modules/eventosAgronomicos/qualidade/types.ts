export type FatorQualidadeEvento = {
  nome: string;
  peso: number;
  atingido: boolean;
  observacao?: string;
};

export type ResultadoQualidadeEvento = {
  indiceQualidadeCientifica: number;
  fatores: FatorQualidadeEvento[];
};