export type TipoIndiceAgronomico =
  | "solo"
  | "chuva"
  | "operacao"
  | "produtividade"
  | "economia"
  | "geral";

export type ClassificacaoIndiceAgronomico =
  | "critico"
  | "baixo"
  | "medio"
  | "alto"
  | "excelente";

export interface IndiceAgronomico {
  id: string;

  producerId: string;
  farmId: string;
  talhaoId?: string;

  memoriaAgronomicaId?: string;
  cicloAgronomicoId?: string;

  tipo: TipoIndiceAgronomico;

  nome: string;
  descricao?: string;

  valor: number;
  classificacao: ClassificacaoIndiceAgronomico;

  componentes?: Record<string, number>;

  dataCalculo: string;

  createdAt: string;
  updatedAt: string;
  createdBy: string;
}