export type TipoResultadoAgronomico =
  | "produtividade"
  | "qualidade"
  | "custo"
  | "receita"
  | "margem"
  | "eficiencia_operacional"
  | "sanidade"
  | "solo"
  | "estande"
  | "outro";

export type UnidadeResultadoAgronomico =
  | "sc_ha"
  | "kg_ha"
  | "ton_ha"
  | "reais_ha"
  | "percentual"
  | "plantas_metro"
  | "nota"
  | "texto";

export type NivelConfiabilidadeResultado =
  | "baixo"
  | "medio"
  | "alto"
  | "validado";

export interface ResultadoAgronomico {
  id: string;

  producerId: string;
  farmId: string;
  talhaoId: string;

  memoriaAgronomicaId?: string;
  cicloAgronomicoId: string;
  planoManejoId?: string;
  decisaoAgronomicaId?: string;
  eventoAgronomicoId?: string;
  ordemServicoId?: string;
  execucaoId?: string;

  tipo: TipoResultadoAgronomico;

  titulo: string;
  descricao?: string;

  valor?: number;
  unidade?: UnidadeResultadoAgronomico;

  dados?: Record<string, unknown>;

  dataResultado: string;

  confiabilidade: NivelConfiabilidadeResultado;

  createdAt: string;
  updatedAt: string;
  createdBy: string;
}