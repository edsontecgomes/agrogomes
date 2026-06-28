export type StatusCicloAgronomico =
  | "planejamento"
  | "em_andamento"
  | "concluido"
  | "perda_parcial"
  | "perda_total"
  | "cancelado";

export type TipoOcupacaoAgricola =
  | "producao_comercial"
  | "producao_sementes"
  | "cobertura_vegetal"
  | "integracao_lavoura_pecuaria"
  | "area_experimental"
  | "pousio";

export type UnidadeProdutividade =
  | "sc_ha"
  | "kg_ha"
  | "ton_ha"
  | "arroba_ha";

export interface ObjetivoProdutivo {
  valor: number;
  unidade: UnidadeProdutividade;
}

export interface ObjetivoEconomico {
  tipo?: "lucro" | "margem" | "reducao_custo" | "aumento_produtividade";
  valorEsperado?: number;
  moeda?: "BRL" | "USD";
}

export interface CicloAgronomico {
  id: string;

  producerId: string;
  farmId: string;
  talhaoId: string;
  memoriaAgronomicaId?: string;

  safra: string;
  tipoOcupacao: TipoOcupacaoAgricola;

  cultura?: string;
  variedadeOuHibrido?: string;

  objetivoProdutivo: ObjetivoProdutivo;
  objetivoEconomico?: ObjetivoEconomico;

  hipoteseTecnica?: string;
  observacoesIniciais?: string;

  dataPrevistaPlantio?: string;
  dataPrevistaEmergencia?: string;
  dataPrevistaColheita?: string;

  dataRealPlantio?: string;
  dataRealEmergencia?: string;
  dataRealColheita?: string;

  status: StatusCicloAgronomico;
  ativo: boolean;

  createdAt: string;
  updatedAt: string;
  createdBy: string;

  encerradoEm?: string;
  encerradoPor?: string;
  motivoEncerramento?: string;
}