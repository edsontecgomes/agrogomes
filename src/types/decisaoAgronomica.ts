export type TipoDecisaoAgronomica =
  | "plantio"
  | "variedade"
  | "adubacao"
  | "correcao_solo"
  | "pulverizacao"
  | "controle_pragas"
  | "controle_doencas"
  | "controle_plantas_daninhas"
  | "irrigacao"
  | "colheita"
  | "manejo_solo"
  | "experimento"
  | "outro";

export type StatusDecisaoAgronomica =
  | "proposta"
  | "aprovada"
  | "executada"
  | "avaliada"
  | "cancelada";

export type NivelRiscoDecisaoAgronomica =
  | "baixo"
  | "medio"
  | "alto";

export interface DecisaoAgronomica {
  id: string;

  producerId: string;
  farmId: string;
  talhaoId: string;

  memoriaAgronomicaId?: string;
  cicloAgronomicoId: string;
  planoManejoId?: string;
  etapaPlanoManejoId?: string;

  tipo: TipoDecisaoAgronomica;
  status: StatusDecisaoAgronomica;

  titulo: string;
  justificativaTecnica: string;

  objetivoEsperado?: string;
  hipoteseAgronomica?: string;

  risco?: NivelRiscoDecisaoAgronomica;

  indicadoresEsperados?: {
    produtividadeEsperadaScHa?: number;
    reducaoCustoEsperadaPercentual?: number;
    melhoriaSanitariaEsperada?: string;
    melhoriaSoloEsperada?: string;
  };

  eventosRelacionados: string[];
  resultadosRelacionados: string[];

  createdAt: string;
  updatedAt: string;
  createdBy: string;
}