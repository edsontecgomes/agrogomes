export type GeneticaUei = {
  cultura: "milho" | "soja" | "algodao";
  cultivar?: string;
  empresa?: string;
  ciclo?: string;
  tratamentoSementes?: string[];
};

export function geneticaTemBaseMinima(genetica: GeneticaUei) {
  return Boolean(genetica.cultura && genetica.cultivar);
}