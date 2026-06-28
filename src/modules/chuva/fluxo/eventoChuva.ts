export type EventoChuva = {
  id: string;
  farmId: string;
  pluviometroId?: string;
  pluviometroNome?: string;
  volumeMm: number;
  responsavelId: string;
  responsavelNome?: string;
  lat?: number;
  lng?: number;
  data: string;
};

export function criarEventoChuva(
  params: Omit<EventoChuva, "data"> & { data?: string },
): EventoChuva {
  return {
    ...params,
    data: params.data || new Date().toISOString(),
  };
}