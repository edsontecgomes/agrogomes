export type EventoOperacional =
  | "entrada_talhao"
  | "ordem_sugerida"
  | "inicio_confirmado"
  | "execucao_pausada"
  | "execucao_finalizada"
  | "trajeto_nao_confirmado"
  | "trajeto_imputado";

export type RegistroEventoOperacional = {
  id: string;
  farmId: string;
  tipo: EventoOperacional;
  ordemProgramadaId?: string;
  talhaoId?: string;
  operadorId?: string;
  data: string;
  payload?: Record<string, unknown>;
};

export function criarEventoOperacional(
  id: string,
  farmId: string,
  tipo: EventoOperacional,
  payload?: Record<string, unknown>,
): RegistroEventoOperacional {
  return {
    id,
    farmId,
    tipo,
    data: new Date().toISOString(),
    payload,
  };
}