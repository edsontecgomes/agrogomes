export type CoordenadaUEI = {
  lat: number;
  lng: number;
};

export interface UEI {

  id: string;

  producerId: string;

  farmId: string;

  talhaoId: string;

  numero: number;

  nome: string;

  areaHa: number;

  geometria: CoordenadaUEI[];

  centroide: CoordenadaUEI;

  origem:

    | "grid"

    | "manual"

    | "drone"

    | "satelite";

  status:

    | "ativa"

    | "arquivada"

    | "experimental";

  criadoEm: Date;

  atualizadoEm: Date;
}