import { FinalizacaoOrdem } from "./finalizacaoOrdem";
import { gerarBaixaEstoqueDaFinalizacao } from "./baixaEstoqueFinalizacao";
import { gerarUsosTalhaoDaFinalizacao } from "./usoTalhaoFinalizacao";
import { gerarCadernoTecnicoDaFinalizacao } from "./cadernoFinalizacao";

export function processarFinalizacaoOrdem(finalizacao: FinalizacaoOrdem) {
  return {
    finalizacao,
    movimentosEstoque: gerarBaixaEstoqueDaFinalizacao(finalizacao),
    usosTalhao: gerarUsosTalhaoDaFinalizacao(finalizacao),
    registroCadernoTecnico: gerarCadernoTecnicoDaFinalizacao(finalizacao),
  };
}