export type OrigemChuvaAgronomica =
  | "manual"
  | "pluviometro"
  | "sensor"
  | "integracao"
  | "estimativa";

export type ConfiabilidadeChuvaAgronomica =
  | "baixa"
  | "media"
  | "alta"
  | "validada";

export interface ChuvaAgronomica {
  id: string;

  producerId: string;
  farmId: string;
  talhaoId?: string;

  memoriaAgronomicaId?: string;
  cicloAgronomicoId?: string;
  pluviometroId?: string;

  dataChuva: string;

  volumeMm: number;

  origem: OrigemChuvaAgronomica;
  confiabilidade: ConfiabilidadeChuvaAgronomica;

  latitude?: number;
  longitude?: number;

  observacoes?: string;

  createdAt: string;
  updatedAt: string;
  createdBy: string;
}