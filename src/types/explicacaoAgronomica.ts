export type NivelExplicabilidade =
  | "baixo"
  | "medio"
  | "alto"
  | "cientifico";

export interface EvidenciaAgronomica {
  tipo:
    | "decisao"
    | "evento"
    | "resultado"
    | "relacao"
    | "aprendizado";

  id: string;

  descricao: string;

  peso: number;
}

export interface ExplicacaoAgronomica {

  id: string;

  recomendacaoAgronomicaId: string;

  memoriaAgronomicaId?: string;

  titulo: string;

  resumo: string;

  justificativaTecnica: string;

  evidencias: EvidenciaAgronomica[];

  confiancaPercentual: number;

  nivel: NivelExplicabilidade;

  riscos: string[];

  beneficios: string[];

  observacoes?: string;

  criadoEm: string;

}