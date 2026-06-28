export type TipoRelacaoAgronomica =
  | "decisao_resultado"
  | "evento_resultado"
  | "ambiente_resultado"
  | "manejo_resultado"
  | "variedade_resultado"
  | "chuva_resultado"
  | "solo_resultado"
  | "custo_resultado";

export type DirecaoImpactoAgronomico =
  | "positivo"
  | "negativo"
  | "neutro"
  | "inconclusivo";

export type NivelForcaRelacaoAgronomica =
  | "fraca"
  | "moderada"
  | "forte"
  | "muito_forte";

export interface RelacaoAgronomica {
  id: string;

  producerId: string;
  farmId: string;
  talhaoId: string;

  memoriaAgronomicaId?: string;
  cicloAgronomicoId: string;
  decisaoAgronomicaId?: string;
  eventoAgronomicoId?: string;
  resultadoAgronomicoId?: string;

  tipo: TipoRelacaoAgronomica;

  titulo: string;
  descricao?: string;

  impacto: DirecaoImpactoAgronomico;
  forca: NivelForcaRelacaoAgronomica;

  confiancaPercentual: number;

  evidencias: string[];

  dados?: Record<string, unknown>;

  createdAt: string;
  updatedAt: string;
  createdBy: string;
}