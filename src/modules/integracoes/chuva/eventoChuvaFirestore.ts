export type EventoChuvaFirestore = {
  id: string;
  farmId: string;
  pluviometroId?: string;
  pluviometroNome?: string;
  volumeMm: number;
  data: string;
  responsavelId?: string;
  responsavelNome?: string;
  lat?: number;
  lng?: number;
};