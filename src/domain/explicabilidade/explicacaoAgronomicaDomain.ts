import {
  AprendizadoAgronomico
} from "../../types/aprendizadoAgronomico";

import {
  RecomendacaoAgronomica
} from "../../types/recomendacaoAgronomica";

import {
  ExplicacaoAgronomica,
  EvidenciaAgronomica
} from "../../types/explicacaoAgronomica";

export function criarExplicacaoAgronomica(
  recomendacao: RecomendacaoAgronomica,
  aprendizado: AprendizadoAgronomico
): Omit<ExplicacaoAgronomica, "id"> {

  const evidencias:EvidenciaAgronomica[]=[];

  aprendizado.relacoesBase.forEach(relacao=>{

    evidencias.push({

      tipo:"relacao",

      id:relacao,

      descricao:"Relação agronômica utilizada",

      peso:10

    });

  });

  return{

    recomendacaoAgronomicaId:
      recomendacao.id,

    memoriaAgronomicaId:
      recomendacao.memoriaAgronomicaId,

    titulo:
      recomendacao.titulo,

    resumo:
      recomendacao.descricao,

    justificativaTecnica:
      recomendacao.justificativa,

    evidencias,

    confiancaPercentual:
      recomendacao.confiancaPercentual,

    nivel:
      recomendacao.confiancaPercentual>=90
      ?"cientifico"
      :recomendacao.confiancaPercentual>=75
      ?"alto"
      :recomendacao.confiancaPercentual>=50
      ?"medio"
      :"baixo",

    riscos:[
      recomendacao.riscoNaoExecutar ??
      "Nenhum risco informado."
    ],

    beneficios:[
      recomendacao.beneficioEsperado ??
      "Benefício não informado."
    ],

    criadoEm:new Date().toISOString()

  };

}