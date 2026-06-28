export type CoordenadaCadastroTalhao = {
  lat: number;
  lng: number;
};

export type TalhaoCadastro = {
  farmId: string;
  nome: string;
  coordenadas: CoordenadaCadastroTalhao[];
  areaHa: number;
  perimetroMetros?: number;
  centroide?: CoordenadaCadastroTalhao;
  bordaduraPercentual: 10 | 15 | 20;
  areaOperacionalHa: number;
  status: "ativo" | "inativo";
};

export function talhaoCadastroValido(talhao: TalhaoCadastro) {
  return Boolean(
    talhao.farmId &&
      talhao.nome &&
      talhao.coordenadas.length >= 3 &&
      talhao.areaHa > 0,
  );
}