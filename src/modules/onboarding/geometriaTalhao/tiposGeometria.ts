export type CoordenadaTalhao = {
  lat: number;
  lng: number;
};

export type PoligonoTalhao = {
  pontos: CoordenadaTalhao[];
};

export type TalhaoGeometria = {
  talhaoId: string;
  nome: string;
  limiteReal: PoligonoTalhao;
  areaOperacional?: PoligonoTalhao;
  areaTotalHa?: number;
  areaOperacionalHa?: number;
};