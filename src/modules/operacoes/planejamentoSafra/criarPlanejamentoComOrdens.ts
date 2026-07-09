import { gerarOrdensProgramadas } from "../ordemProgramada/gerarOrdensProgramadas";
import { salvarOrdensProgramadas } from "../ordemProgramada/salvarOrdensProgramadas";
import { gerarOperacoesPlanejadas } from "./gerarOperacoesPlanejadas";
import { salvarPlanejamentoSafra } from "./salvarPlanejamentoSafra";
import { PlanejamentoSafra } from "./types";

export async function criarPlanejamentoComOrdens(
  planejamento: Omit<PlanejamentoSafra, "id" | "createdAt" | "updatedAt">,
) {
  const safra = await salvarPlanejamentoSafra(planejamento);

  const operacoes = gerarOperacoesPlanejadas(safra.id);

  const ordens = gerarOrdensProgramadas(safra.talhaoId, operacoes);

  await salvarOrdensProgramadas(ordens);

  return {
    safra,
    operacoes,
    ordens,
  };
}