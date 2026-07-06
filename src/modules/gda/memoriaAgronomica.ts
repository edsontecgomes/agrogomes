export type MemoriaAgronomicaGDA = {
  id: string;
  gdaId: string;
  ueiId: string;
  farmId: string;
  talhaoId: string;
  totalSafras: number;
  totalEventos: number;
  ultimaAtualizacao: Date;
};

export function criarMemoriaAgronomicaGDA(params: {
  gdaId: string;
  ueiId: string;
  farmId: string;
  talhaoId: string;
}): MemoriaAgronomicaGDA {
  return {
    id: `MEM-${params.gdaId}`,
    gdaId: params.gdaId,
    ueiId: params.ueiId,
    farmId: params.farmId,
    talhaoId: params.talhaoId,
    totalSafras: 0,
    totalEventos: 0,
    ultimaAtualizacao: new Date(),
  };
}