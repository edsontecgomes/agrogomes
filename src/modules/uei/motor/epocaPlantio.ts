import { CulturaAgroGomes } from "./culturas";

export type RegistroPlantioUei = {
  ueiId: string;
  safra: string;
  cultura: CulturaAgroGomes;
  cultivar: string;
  dataPlantio: string;
  populacao?: number;
};

export function extrairMesPlantio(dataPlantio: string) {
  return new Date(dataPlantio).getMonth() + 1;
}