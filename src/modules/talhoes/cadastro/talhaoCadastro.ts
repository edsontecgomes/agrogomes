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
   * Limite interno utilizado pelas operações,
   * pela geração do grid e pelas UEIs.
   */
  limiteOperacional: CoordenadaCadastroTalhao[];

  areaHa: number;

  perimetroMetros?: number;

  centroide?: CoordenadaCadastroTalhao;

  bordaduraPercentual: 10 | 15 | 20;

  /**
   * Área calculada a partir do polígono operacional,
   * após a aplicação espacial da bordadura.
   */
  areaOperacionalHa: number;

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
      Number.isFinite(talhao.areaHa) &&
      talhao.areaHa > 0 &&
      Number.isFinite(talhao.areaOperacionalHa) &&
      talhao.areaOperacionalHa > 0 &&
      talhao.areaOperacionalHa <= talhao.areaHa,
  );
}