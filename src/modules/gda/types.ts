export type GDAStatus = "ativo" | "arquivado";

export type GDA = {
  id: string;
  ueiId: string;
  farmId: string;
  talhaoId: string;
  status: GDAStatus;
  indiceMaturidadeCientifica: number;
  indiceConfiabilidade: number;
  totalEventos: number;
  totalSafras: number;
  createdAt?: unknown;
  updatedAt?: unknown;
};