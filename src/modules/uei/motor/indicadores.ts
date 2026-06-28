export interface IndicadoresUEI{

    confiabilidade:number;

    produtividade:number;

    potencial:number;

}

export function indicadoresVazios():IndicadoresUEI{

    return{

        confiabilidade:0,

        produtividade:0,

        potencial:0

    }

}