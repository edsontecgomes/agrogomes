export type TipoMemoriaAgronomica =
  | "talhao"
  | "zona"
  | "hectare"
  | "celula";

export type StatusMemoriaAgronomica =
  | "ativa"
  | "inativa"
  | "dividida"
  | "incorporada";

export interface CoordenadaGeografica {
  latitude: number;
  longitude: number;
}

export interface GeometriaAgronomica {
  type: "Polygon" | "MultiPolygon";
  coordinates: number[][][] | number[][][][];
}

export interface MemoriaAgronomica {
  id: string;

  producerId: string;
  farmId: string;
  talhaoId: string;

  tipo: TipoMemoriaAgronomica;

  nome: string;
  descricao?: string;

  areaHa: number;

  geometria?: GeometriaAgronomica;
  centroide?: CoordenadaGeografica;
  altitudeMedia?: number;

  historicoCiclos: string[];

  status: StatusMemoriaAgronomica;

  createdAt: string;
  updatedAt: string;
  createdBy: string;
}