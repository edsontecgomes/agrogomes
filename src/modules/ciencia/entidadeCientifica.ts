import { IdCientifico, TipoEntidade } from "./tipos";

export interface EntidadeCientifica {

  id: IdCientifico;

  tipo: TipoEntidade;

  nome: string;

  criadoEm: Date;

}