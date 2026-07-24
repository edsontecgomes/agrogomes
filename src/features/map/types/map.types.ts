export type LatLng = {
  lat: number;
  lng: number;
};

export type HectareStatus =
  | "desconhecido"
  | "baixo"
  | "medio"
  | "alto"
  | "excelente";

export type Talhao = {
  id: string;

  producerId: string;

  farmId: string;

  nome: string;

  /**
   * Contrato oficial atual do cadastro.
   */
  coordenadas: LatLng[];

  /**
   * Polígono operacional interno, quando já gerado.
   */
  limiteOperacional?: LatLng[];

  /**
   * Limite utilizado pelo geofence para detectar entrada
   * segura do operador, 20 metros dentro do talhão.
   */
  limiteAtivacaoOperacional?: LatLng[];

  /**
   * Limite do núcleo produtivo após a bordadura
   * agronômica de 4%.
   */
  limiteNucleoProdutivo?: LatLng[];

  /**
   * Compatibilidade com componentes do mapa científico.
   */
  polygon?: LatLng[];

  /**
   * Compatibilidade temporária com registros antigos.
   */
  pontos?: LatLng[];

  areaHa?: number;

  /**
   * Campo legado ainda utilizado por algumas telas.
   */
  area?: number;

  areaOperacionalHa?: number;

  /**
   * Novos cadastros usam 4%. Os demais valores
   * permanecem apenas para leitura de registros legados.
   */
  bordaduraPercentual?: 4 | 10 | 15 | 20;

  bordaduraAgronomicaPercentual?: 4;

  distanciaSegurancaOperacionalMetros?: 20;

  areaAtivacaoOperacionalHa?: number;

  areaBordaduraAgronomicaHa?: number;

  areaNucleoProdutivoHa?: number;

  perimetroMetros?: number;

  centroide?: LatLng;

  cor?: string;

  /**
   * Alguns registros antigos armazenam GeoJSON serializado.
   */
  geometria?: unknown;

  status?: "ativo" | "inativo";

  createdAt?: unknown;

  updatedAt?: unknown;
};

export type HectareCell = {
  id: string;

  producerId: string;

  farmId: string;

  talhaoId: string;

  hectareIndex: number;

  areaHa: number;

  center: LatLng;

  polygon: LatLng[];

  iqh: number;

  status: HectareStatus;
};
