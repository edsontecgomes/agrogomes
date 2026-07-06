export type CoordenadaGeometrica = {
  lat: number;
  lng: number;
};

export type PoligonoGeometrico = CoordenadaGeometrica[];

export type UEIGeometrica = {
  id: string;
  producerId: string;
  farmId: string;
  talhaoId: string;
  numero: number;
  nome: string;
  areaHa: number;
  geometria: PoligonoGeometrico;
  centroide: CoordenadaGeometrica;
  origem: "grid_geometrico";
  status: "ativa" | "arquivada" | "experimental";
};