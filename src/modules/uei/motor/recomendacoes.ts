export interface RecomendacaoUEI{

    titulo:string;

    descricao:string;

    prioridade:number;

}

export function criarRecomendacao(

titulo:string,

descricao:string,

prioridade:number

):RecomendacaoUEI{

return{

titulo,

descricao,

prioridade

}

}