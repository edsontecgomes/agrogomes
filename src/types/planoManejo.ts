export type StatusPlanoManejo =
  | "rascunho"
  | "ativo"
  | "revisado"
  | "concluido"
  | "cancelado";

export type TipoEtapaManejo =
  | "preparo_area"
  | "correcao_solo"
  | "plantio"
  | "adubacao_base"
  | "adubacao_cobertura"
  | "tratamento_sementes"
  | "herbicida"
  | "fungicida"
  | "inseticida"
  | "monitoramento"
  | "irrigacao"
  | "colheita"
  | "outro";

export type PrioridadeEtapaManejo = "baixa" | "media" | "alta" | "critica";

export interface EtapaPlanoManejo {
  id: string;
  tipo: TipoEtapaManejo;
  nome: string;
  descricao?: string;

  dataPrevista?: string;
  janelaInicio?: string;
  janelaFim?: string;

  prioridade: PrioridadeEtapaManejo;

  objetivoAgronomico?: string;
  observacoesTecnicas?: string;

  status: "pendente" | "programada" | "em_execucao" | "concluida" | "cancelada";
}

export interface PlanoManejo {
  id: string;

  producerId: string;
  farmId: string;
  talhaoId: string;

  cicloAgronomicoId: string;
  memoriaAgronomicaId?: string;

  nome: string;
  descricao?: string;

  safra: string;
  cultura?: string;
  variedadeOuHibrido?: string;

  objetivoGeral?: string;
  hipoteseTecnica?: string;

  etapas: EtapaPlanoManejo[];

  status: StatusPlanoManejo;

  createdAt: string;
  updatedAt: string;
  createdBy: string;
}