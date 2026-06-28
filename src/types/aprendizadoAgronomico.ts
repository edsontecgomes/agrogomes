export type TipoAprendizadoAgronomico =
  | "variedade"
  | "adubacao"
  | "plantio"
  | "chuva"
  | "solo"
  | "manejo"
  | "custo"
  | "produtividade"
  | "sanidade"
  | "outro";

export type StatusAprendizadoAgronomico =
  | "rascunho"
  | "ativo"
  | "validado"
  | "descartado";

export type NivelConfiancaAprendizado =
  | "baixo"
  | "medio"
  | "alto"
  | "muito_alto";

export interface AprendizadoAgronomico {
  id: string;

  producerId: string;
  farmId: string;
  talhaoId?: string;

  memoriaAgronomicaId?: string;
  cicloAgronomicoId?: string;

  tipo: TipoAprendizadoAgronomico;
  status: StatusAprendizadoAgronomico;

  titulo: string;
  descricao: string;

  conclusao?: string;

  relacoesBase: string[];
  decisoesBase: string[];
  resultadosBase: string[];

  confianca: NivelConfiancaAprendizado;
  confiancaPercentual: number;

  aplicavelEm?: {
    culturas?: string[];
    variedades?: string[];
    tiposSolo?: string[];
    faixasChuvaMm?: string;
    faixasProdutividade?: string;
  };

  dados?: Record<string, unknown>;

  createdAt: string;
  updatedAt: string;
  createdBy: string;
}