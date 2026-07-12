import { calcularConfiabilidadeConhecimento } from "./calcularConfiabilidadeConhecimento";
import { calcularEstabilidadeConhecimento } from "./calcularEstabilidadeConhecimento";
import { calcularForcaConhecimento } from "./calcularForcaConhecimento";
import {
  calcularMaturidadeConhecimento,
  definirStatusConhecimento,
} from "./calcularMaturidadeConhecimento";
import type {
  ConhecimentoAgronomico,
} from "./types";

export function atualizarIndicadoresConhecimento(
  conhecimento: ConhecimentoAgronomico,
): ConhecimentoAgronomico {
  const forca =
    calcularForcaConhecimento(
      conhecimento,
    );

  const confiabilidade =
    calcularConfiabilidadeConhecimento(
      conhecimento.evidencias,
    );

  const estabilidade =
    calcularEstabilidadeConhecimento(
      conhecimento,
    );

  const atualizado = {
    ...conhecimento,

    forca,

    confiabilidade,

    estabilidade,

    atualizadoEm:
      new Date().toISOString(),
  };

  return {
    ...atualizado,

    maturidade:
      calcularMaturidadeConhecimento(
        atualizado,
      ),

    status:
      definirStatusConhecimento(
        atualizado,
      ),
  };
}