import { CulturaAgroGomes } from "./culturas";

export type CultivarUei = {
  id?: string;
  nome: string;
  cultura: CulturaAgroGomes;
  empresa?: string;
  ciclo?: string;
  tecnologia?: string;
  populacaoRecomendada?: number;
};

export function cultivarMoveMotor(cultivar: CultivarUei) {
  return Boolean(cultivar.nome && cultivar.cultura);
}