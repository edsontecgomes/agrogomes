import { analisarContextoAtual } from "../engine/contextoAgronomicoEngine";
import { ContextoAgronomico } from "../types/contextoAgronomico";

export async function obterContextoAgronomico(
    contexto:ContextoAgronomico
){

    return analisarContextoAtual(contexto);

}