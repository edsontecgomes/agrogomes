import { IdCientifico } from "./tipos";

export interface RelacaoCientifica {

  origem: IdCientifico;

  destino: IdCientifico;

  tipo: string;

  peso: number;

}