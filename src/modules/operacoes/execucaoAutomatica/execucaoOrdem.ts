export type StatusExecucaoOrdem =
  | "aguardando_confirmacao"
  | "em_execucao"
  | "pausada"
  | "finalizada"
  | "nao_confirmada";

export type PontoTrajeto = {
  lat: number;
  lng: number;
  timestamp: string;
  precisao?: number;
};

export type ExecucaoOrdem = {
  id: string;
  ordemProgramadaId: string;
  operadorId?: string;
  status: StatusExecucaoOrdem;
  inicio?: string;
  fim?: string;
  trajetos: PontoTrajeto[];
};

export function execucaoEstaAtiva(execucao: ExecucaoOrdem) {
  return execucao.status === "em_execucao" || execucao.status === "pausada";
}