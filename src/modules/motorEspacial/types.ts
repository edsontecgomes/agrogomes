export type CoordenadaEspacial = {
  lat: number;
  lng: number;
  accuracy?: number;
};

export type PoligonoEspacial = CoordenadaEspacial[];

export type UEIEspacial = {
  id: string;
  producerId?: string;
  farmId: string;
  talhaoId: string;

  codigo?: string;
  nome?: string;
  numero?: number;

  areaHa: number;

  geometria: PoligonoEspacial;
  centroide?: CoordenadaEspacial;

  origem?: string;
  zonaTalhao?:
    | "faixa_avaliacao_bordadura"
    | "nucleo_produtivo";
  status?: string;
};

export type ResultadoResolucaoUEI = {
  ueiIds: string[];
  ueis: UEIEspacial[];

  metodo:
    | "ponto_no_poligono"
    | "talhao_completo"
    | "sem_localizacao"
    | "nenhuma_uei";

  confiabilidade: number;

  observacoes: string[];
};
