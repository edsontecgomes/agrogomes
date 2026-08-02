export type CoordenadaCartografica = {
  lat: number;
  lng: number;
};

export type FazendaCartografica = {
  id: string;
  nome: string;
  municipio?: string;
  estado?: string;
  centroide?: CoordenadaCartografica;
};

export type TalhaoCartografico = {
  id: string;
  farmId: string;
  nome: string;
  areaHa: number;
  coordenadas: CoordenadaCartografica[];
  centroide?: CoordenadaCartografica;
};

export type UEICartografica = {
  id: string;
  farmId: string;
  talhaoId: string;
  codigo: string;
  areaHa: number;
  geometria: CoordenadaCartografica[];
  centroide?: CoordenadaCartografica;
  zonaTalhao?:
    | "faixa_avaliacao_bordadura"
    | "nucleo_produtivo";
};

export type CartografiaGlobal = {
  fazendas: FazendaCartografica[];
  talhoes: TalhaoCartografico[];
  ueis: UEICartografica[];
};
