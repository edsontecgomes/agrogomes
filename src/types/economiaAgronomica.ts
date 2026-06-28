export type TipoRegistroEconomicoAgronomico =
  | "custo"
  | "receita"
  | "margem"
  | "investimento"
  | "economia"
  | "outro";

export type OrigemRegistroEconomicoAgronomico =
  | "manual"
  | "estoque"
  | "ordem_servico"
  | "integracao"
  | "estimativa";

export interface RegistroEconomicoAgronomico {
  id: string;

  producerId: string;
  farmId: string;
  talhaoId?: string;

  memoriaAgronomicaId?: string;
  cicloAgronomicoId?: string;
  decisaoAgronomicaId?: string;
  operacaoAgronomicaId?: string;
  resultadoAgronomicoId?: string;

  tipo: TipoRegistroEconomicoAgronomico;
  origem: OrigemRegistroEconomicoAgronomico;

  titulo: string;
  descricao?: string;

  valorTotal: number;
  valorPorHa?: number;
  moeda: "BRL" | "USD";

  areaReferenciaHa?: number;

  dataRegistro: string;

  categoria?: string;
  subcategoria?: string;

  observacoes?: string;

  createdAt: string;
  updatedAt: string;
  createdBy: string;
}