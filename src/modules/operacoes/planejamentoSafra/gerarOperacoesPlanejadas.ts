import { OperacaoPlanejada } from "./typesOperacoes";

export function gerarOperacoesPlanejadas(
  planejamentoId: string,
): OperacaoPlanejada[] {
  return [
    {
      id: `${planejamentoId}-01`,
      planejamentoId,
      ordem: 1,
      tipo: "plantio",
      nome: "Plantio",
    },
    {
      id: `${planejamentoId}-02`,
      planejamentoId,
      ordem: 2,
      tipo: "adubacao",
      nome: "Adubação",
    },
    {
      id: `${planejamentoId}-03`,
      planejamentoId,
      ordem: 3,
      tipo: "pulverizacao",
      nome: "Pulverização",
    },
    {
      id: `${planejamentoId}-04`,
      planejamentoId,
      ordem: 4,
      tipo: "colheita",
      nome: "Colheita",
    },
  ];
}