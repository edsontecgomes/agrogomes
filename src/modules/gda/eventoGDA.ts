export type TipoEventoGDA =
  | "chuva"
  | "plantio"
  | "adubacao"
  | "pulverizacao"
  | "colheita"
  | "solo"
  | "compactacao"
  | "populacao"
  | "telemetria"
  | "observacao";

export type EventoGDA = {
  id: string;
  gdaId: string;
  ueiId: string;
  safraId?: string;
  tipo: TipoEventoGDA;
  data: Date;
  descricao: string;
  origemId?: string;
  payload?: Record<string, unknown>;
};

export function criarEventoGDA(params: Omit<EventoGDA, "id" | "data"> & { data?: Date }): EventoGDA {
  return {
    ...params,
    id: `${params.gdaId}-${params.tipo}-${Date.now()}`,
    data: params.data || new Date(),
  };
}