export type CoordenadaCadastroTalhao = {
  lat: number;
  lng: number;
};

export type TalhaoCadastro = {
  farmId: string;

  nome: string;

  /**
   * Limite físico original desenhado ou importado.
   */
  coordenadas: CoordenadaCadastroTalhao[];

  /**
   * Alias de compatibilidade para o limite seguro
   * de ativação operacional.
   */
  limiteOperacional: CoordenadaCadastroTalhao[];

  /**
   * Limite fixo 20 metros para dentro do talhão.
   * A detecção automática de ordens usa este polígono.
   */
  limiteAtivacaoOperacional:
    CoordenadaCadastroTalhao[];

  /**
   * Limite interno do núcleo produtivo.
   *
   * A faixa entre o limite físico e este limite
   * corresponde à bordadura agronômica de 4%.
   */
  limiteNucleoProdutivo: CoordenadaCadastroTalhao[];

  areaHa: number;

  perimetroMetros?: number;

  centroide?: CoordenadaCadastroTalhao;

  /**
   * Alias legado da bordadura agronômica.
   */
  bordaduraPercentual: 4;

  bordaduraAgronomicaPercentual: 4;

  distanciaSegurancaOperacionalMetros: 20;

  /**
   * Área calculada a partir do polígono operacional,
   * dentro do limite seguro de ativação.
   */
  areaOperacionalHa: number;

  areaAtivacaoOperacionalHa: number;

  areaBordaduraAgronomicaHa: number;

  areaNucleoProdutivoHa: number;

  status: "ativo" | "inativo";
};

function coordenadasValidas(
  coordenadas: CoordenadaCadastroTalhao[],
): boolean {
  return (
    Array.isArray(coordenadas) &&
    coordenadas.length >= 3 &&
    coordenadas.every(
      (coordenada) =>
        Number.isFinite(coordenada.lat) &&
        Number.isFinite(coordenada.lng),
    )
  );
}

export function talhaoCadastroValido(
  talhao: TalhaoCadastro,
): boolean {
  return Boolean(
    talhao.farmId.trim() &&
      talhao.nome.trim() &&
      coordenadasValidas(talhao.coordenadas) &&
      coordenadasValidas(talhao.limiteOperacional) &&
      coordenadasValidas(
        talhao.limiteAtivacaoOperacional,
      ) &&
      coordenadasValidas(talhao.limiteNucleoProdutivo) &&
      Number.isFinite(talhao.areaHa) &&
      talhao.areaHa > 0 &&
      Number.isFinite(talhao.areaOperacionalHa) &&
      talhao.areaOperacionalHa > 0 &&
      talhao.areaOperacionalHa <= talhao.areaHa &&
      Number.isFinite(
        talhao.areaAtivacaoOperacionalHa,
      ) &&
      talhao.areaAtivacaoOperacionalHa > 0 &&
      Number.isFinite(
        talhao.areaBordaduraAgronomicaHa,
      ) &&
      talhao.areaBordaduraAgronomicaHa >= 0 &&
      Number.isFinite(talhao.areaNucleoProdutivoHa) &&
      talhao.areaNucleoProdutivoHa > 0 &&
      talhao.areaNucleoProdutivoHa <=
        talhao.areaHa,
  );
}
