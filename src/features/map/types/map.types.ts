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

  bordaduraPercentual?: 10 | 15 | 20;

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