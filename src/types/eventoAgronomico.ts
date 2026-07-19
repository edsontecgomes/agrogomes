export type TipoEventoAgronomico =
  | "criacao_ciclo"
  | "alteracao_ciclo"
  | "criacao_plano_manejo"
  | "alteracao_plano_manejo"
  | "criacao_decisao_agronomica"
  | "alteracao_decisao_agronomica"
  | "criacao_resultado_agronomico"
  | "plantio"
  | "emergencia"
  | "adubacao"
  | "pulverizacao"
  | "monitoramento"
  | "chuva"
  | "solo"
  | "clima"
  | "imagem"
  | "colheita"
  | "produtividade"
  | "custo"
  | "receita"
  | "observacao"
  | "aprendizado";

export type OrigemEventoAgronomico =
  | "manual"
  | "sistema"
  | "sensor"
  | "integracao"
  | "ia";

export type NivelConfiabilidadeEvento =
  | "baixo"
  | "medio"
  | "alto"
  | "validado";

export interface EventoAgronomico {
  id: string;

  producerId: string;
  farmId: string;
  talhaoId: string;

  cicloAgronomicoId: string;
  memoriaAgronomicaId?: string;
  planoManejoId?: string;
  decisaoAgronomicaId?: string;
  resultadoAgronomicoId?: string;
  ordemServicoId?: string;
  execucaoId?: string;

  tipo: TipoEventoAgronomico;
  origem: OrigemEventoAgronomico;

  titulo: string;
  descricao?: string;

  dataEvento: string;

  confiabilidade: NivelConfiabilidadeEvento;

  dados?: Record<string, unknown>;

  createdAt: string;
  updatedAt: string;
  createdBy: string;
}