export type OrigemProdutividadeAgronomica =
  | "manual"
  | "colheitadeira"
  | "mapa_produtividade"
  | "estimativa"
  | "integracao";

export type UnidadeProdutividadeAgronomica =
  | "sc_ha"
  | "kg_ha"
  | "ton_ha";

export type ConfiabilidadeProdutividadeAgronomica =
  | "baixa"
  | "media"
  | "alta"
  | "validada";

export interface ProdutividadeAgronomica {
  id: string;

  producerId: string;
  farmId: string;
  talhaoId: string;

  memoriaAgronomicaId?: string;
  cicloAgronomicoId?: string;
  resultadoAgronomicoId?: string;

  cultura?: string;
  variedadeOuHibrido?: string;

  dataColheita?: string;

  produtividadeMedia: number;
  produtividadeMinima?: number;
  produtividadeMaxima?: number;

  unidade: UnidadeProdutividadeAgronomica;

  areaColhidaHa?: number;
  producaoTotal?: number;

  origem: OrigemProdutividadeAgronomica;
  confiabilidade: ConfiabilidadeProdutividadeAgronomica;

  observacoes?: string;

  dadosMapa?: {
    possuiMapa: boolean;
    arquivoUrl?: string;
    zonasProdutivas?: number;
  };

  createdAt: string;
  updatedAt: string;
  createdBy: string;
}