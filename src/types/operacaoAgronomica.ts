export type TipoOperacaoAgronomica =
  | "plantio"
  | "adubacao"
  | "pulverizacao"
  | "colheita"
  | "monitoramento"
  | "preparo_solo"
  | "correcao_solo"
  | "irrigacao"
  | "outro";

export type StatusOperacaoAgronomica =
  | "planejada"
  | "em_execucao"
  | "pausada"
  | "concluida"
  | "cancelada";

export interface OperacaoAgronomica {
  id: string;

  producerId: string;
  farmId: string;
  talhaoId: string;

  memoriaAgronomicaId?: string;
  cicloAgronomicoId?: string;
  planoManejoId?: string;
  decisaoAgronomicaId?: string;
  ordemServicoId?: string;
  execucaoId?: string;

  tipo: TipoOperacaoAgronomica;
  status: StatusOperacaoAgronomica;

  dataInicio?: string;
  dataFim?: string;

  areaPlanejadaHa?: number;
  areaExecutadaHa?: number;

  operadorId?: string;
  maquinaId?: string;
  implementoId?: string;

  velocidadeMediaKmH?: number;
  larguraOperacionalM?: number;
  distanciaPercorridaKm?: number;

  produtosUtilizados?: {
    produtoId?: string;
    nome: string;
    dose?: number;
    unidade?: string;
  }[];

  observacoes?: string;

  createdAt: string;
  updatedAt: string;
  createdBy: string;
}