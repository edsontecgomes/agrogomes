import {
  criarExplicacaoAgronomica
} from "../domain/explicabilidade/explicacaoAgronomicaDomain";

import {
  AprendizadoAgronomico
} from "../types/aprendizadoAgronomico";

import {
  RecomendacaoAgronomica
} from "../types/recomendacaoAgronomica";

export function gerarExplicacaoAgronomica(
  recomendacao:RecomendacaoAgronomica,
  aprendizado:AprendizadoAgronomico
){

  return criarExplicacaoAgronomica(
    recomendacao,
    aprendizado
  );

}