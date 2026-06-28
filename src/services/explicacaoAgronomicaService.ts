import {
  gerarExplicacaoAgronomica
} from "../engine/explicabilidadeEngine";

import {
  AprendizadoAgronomico
} from "../types/aprendizadoAgronomico";

import {
  RecomendacaoAgronomica
} from "../types/recomendacaoAgronomica";

export async function explicarRecomendacaoAgronomica(
  recomendacao:RecomendacaoAgronomica,
  aprendizado:AprendizadoAgronomico
){

  return gerarExplicacaoAgronomica(
    recomendacao,
    aprendizado
  );

}