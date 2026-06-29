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
  areaHa?: number;
  polygon: LatLng[];
  createdAt?: Date;
  updatedAt?: Date;
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