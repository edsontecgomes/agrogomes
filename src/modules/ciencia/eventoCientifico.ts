import { IdCientifico, TipoEvento } from "./tipos";

export interface EventoCientifico {

  id: IdCientifico;

  tipo: TipoEvento;

  data: Date;

  descricao: string;

  origem: string;

}