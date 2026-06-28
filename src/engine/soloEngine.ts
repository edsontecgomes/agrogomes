import {
  classificarFertilidadeSolo,
  identificarAlertasSolo,
} from "../domain/solo/soloDomain";
import { AnaliseSolo } from "../types/analiseSolo";

export function analisarSolo(analise: AnaliseSolo) {
  return {
    analise,
    classificacaoFertilidade: classificarFertilidadeSolo(analise),
    alertas: identificarAlertasSolo(analise),
    analisadoEm: new Date().toISOString(),
  };
}