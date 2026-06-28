import { OrdemProgramada, ordemProgramadaPodeExecutar } from "../ordemProgramada/ordemProgramada";

export type SugestaoOrdemPorGeofence = {
  ordem: OrdemProgramada;
  mensagem: string;
};

export function sugerirOrdemPorTalhao(
  talhaoId: string,
  ordens: OrdemProgramada[],
): SugestaoOrdemPorGeofence | null {
  const ordem = ordens.find(
    (item) => item.talhaoId === talhaoId && ordemProgramadaPodeExecutar(item),
  );

  if (!ordem) return null;

  return {
    ordem,
    mensagem: `Ordem programada encontrada para este talhão: ${ordem.tipoOperacao}.`,
  };
}