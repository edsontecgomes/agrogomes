export interface CorrelacaoUEI{

    fator:string;

    peso:number;

}

export function criarCorrelacao(

    fator:string,

    peso:number

):CorrelacaoUEI{

    return{

        fator,

        peso

    }

}