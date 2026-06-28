import { avaliarContextoAgronomico } from "../domain/contexto/contextoAgronomicoDomain";
import { ContextoAgronomico } from "../types/contextoAgronomico";

export function analisarContextoAtual(
    contexto:ContextoAgronomico
){

    return{

        ...contexto,

        alertas:
            avaliarContextoAgronomico(contexto)

    };

}