import { ContextoAgronomico } from "../../types/contextoAgronomico";

export function avaliarContextoAgronomico(
    contexto: ContextoAgronomico
): string[] {

    const alertas:string[]=[];

    if(contexto.diasSemChuva>=10){

        alertas.push(
            "Estresse hídrico provável."
        );

    }

    if(
        contexto.produtividadeEsperada &&
        contexto.produtividadeAtual &&
        contexto.produtividadeAtual<
        contexto.produtividadeEsperada*0.80
    ){

        alertas.push(
            "Produtividade abaixo da curva esperada."
        );

    }

    if(
        contexto.estadio==="plantio" &&
        contexto.chuvaAcumuladaMm<20
    ){

        alertas.push(
            "Plantio realizado com baixa disponibilidade hídrica."
        );

    }

    return alertas;

}