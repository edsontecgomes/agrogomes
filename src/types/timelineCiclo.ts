import { TipoEventoAgronomico } from "./eventoAgronomico";

export type CategoriaTimelineCiclo =
  | "estrutura"
  | "planejamento"
  | "execucao"
  | "ambiente"
  | "resultado"
  | "inteligencia";

export interface ItemTimelineCiclo {
  id: string;

  eventoAgronomicoId: string;

  cicloAgronomicoId: string;
  memoriaAgronomicaId?: string;
  talhaoId: string;

  categoria: CategoriaTimelineCiclo;
  tipoEvento: TipoEventoAgronomico;

  titulo: string;
  descricao?: string;

  dataEvento: string;

  destaque: boolean;

  createdAt: string;
}