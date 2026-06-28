export type ManejoUei = {
  dataPlantio?: string;
  populacaoPlantasHa?: number;
  adubacaoKgHa?: number;
  formulacaoAdubo?: string;
  parcelasAdubacao?: number;
  produtosAplicados?: string[];
};

export function manejoTemBaseMinima(manejo: ManejoUei) {
  return Boolean(
    manejo.dataPlantio ||
      manejo.populacaoPlantasHa ||
      manejo.adubacaoKgHa ||
      manejo.produtosAplicados?.length,
  );
}