import { criarRegistroCadernoTecnico } from "../../operacoes/estoqueOperacional/cadernoTecnico";
import { FinalizacaoOrdem } from "./finalizacaoOrdem";

export function gerarCadernoTecnicoDaFinalizacao(finalizacao: FinalizacaoOrdem) {
  return criarRegistroCadernoTecnico({
    id: `CADERNO-ORDEM-${finalizacao.ordemProgramadaId}`,
    farmId: finalizacao.farmId,
    talhaoId: finalizacao.talhaoId,
    safra: finalizacao.safra,
    tipoEvento: finalizacao.tipoOperacao,
    data: finalizacao.dataFinalizacao,
    descricao: `Ordem finalizada: ${finalizacao.tipoOperacao}`,
    origemId: finalizacao.ordemProgramadaId,
    produtos: finalizacao.itensConsumidos.map((item) => item.produtoNome),
  });
}