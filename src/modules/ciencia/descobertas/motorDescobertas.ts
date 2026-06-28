import { criarDescoberta } from "./descoberta";
import { calcularImpacto } from "./impactoProdutivo";
import { diferencaSignificativa } from "./diferencaSignificativa";

export function gerarDescoberta(

id:string,

titulo:string,

descricao:string,

fator:string,

antes:number,

depois:number

){

const impacto=calcularImpacto(

antes,

depois

);

const descoberta=

criarDescoberta(

id,

titulo,

descricao,

fator

);

return{

descoberta,

impacto,

significativa:

diferencaSignificativa(

impacto.ganhoScHa

)

};

}