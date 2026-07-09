export type TipoOperacaoPlanejada =
  | "plantio"
  | "adubacao"
  | "pulverizacao"
  | "colheita"
  | "dessecacao"
  | "cobertura"
  | "outro";

export interface OperacaoPlanejada {
  id: string;

  planejamentoId: string;

  ordem: number;

  tipo: TipoOperacaoPlanejada;

  nome: string;

  dataPrevista?: string;

  observacoes?: string;
}