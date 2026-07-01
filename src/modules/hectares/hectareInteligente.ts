export type CoordenadaHectare = {
  lat: number;
  lng: number;
};

export type PoligonoHectare = CoordenadaHectare[];

export type StatusHectare =
  | "ativo"
  | "arquivado"
  | "experimental";

export interface HectareInteligente {

  id: string;

  producerId: string;

  farmId: string;

  talhaoId: string;

  numero: number;

  nome: string;

  areaHa: number;

  geometria: PoligonoHectare;

  centroide: CoordenadaHectare;

  status: StatusHectare;

  origem:
    | "grid"
    | "manual"
    | "drone"
    | "satelite";

  criadoEm: Date;

  atualizadoEm: Date;
}