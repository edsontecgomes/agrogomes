import { PontoTrajeto } from "./execucaoOrdem";

export type TrajetoNaoConfirmado = {
  id: string;
  farmId: string;
  operadorId?: string;
  talhaoId?: string;
  inicio: string;
  fim?: string;
  pontos: PontoTrajeto[];
  ordemSugeridaId?: string;
  status: "pendente" | "imputado" | "descartado";
};

export function trajetoPodeSerImputado(trajeto: TrajetoNaoConfirmado) {
  return trajeto.status === "pendente" && Boolean(trajeto.ordemSugeridaId);
}