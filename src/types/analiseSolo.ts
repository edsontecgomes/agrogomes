export type CamadaSolo =
  | "0_10"
  | "10_20"
  | "20_30"
  | "0_20"
  | "0_30";

export type TexturaSolo =
  | "arenoso"
  | "medio"
  | "argiloso"
  | "muito_argiloso";

export interface AnaliseSolo {
  id: string;

  producerId: string;
  farmId: string;
  talhaoId: string;

  memoriaAgronomicaId?: string;
  cicloAgronomicoId?: string;

  dataColeta: string;
  laboratorio?: string;
  camada: CamadaSolo;

  textura?: TexturaSolo;
  argilaPercentual?: number;
  areiaPercentual?: number;
  siltePercentual?: number;

  phCaCl2?: number;
  materiaOrganica?: number;
  fosforo?: number;
  potassio?: number;
  calcio?: number;
  magnesio?: number;
  aluminio?: number;
  ctc?: number;
  saturacaoBases?: number;
  enxofre?: number;
  boro?: number;
  zinco?: number;
  cobre?: number;
  manganes?: number;
  ferro?: number;

  compactacao?: number;

  observacoes?: string;

  createdAt: string;
  updatedAt: string;
  createdBy: string;
}