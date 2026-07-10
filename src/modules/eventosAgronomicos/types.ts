export type TipoEventoAgronomico =
  | "chuva"
  | "plantio"
  | "adubacao"
  | "pulverizacao"
  | "colheita"
  | "manejo"
  | "execucao_ordem"
  | "uso_produto"
  | "observacao"
  | "solo"
  | "telemetria";

export type OrigemEventoAgronomico =
  | "manual"
  | "operador"
  | "sistema"
  | "sensor"
  | "pluviometro"
  | "estacao_meteorologica"
  | "drone"
  | "satelite"
  | "telemetria"
  | "laboratorio"
  | "importacao"
  | "api"
  | "ia";

export type CoordenadaEvento = {
  lat: number;
  lng: number;
  accuracy?: number;
};

export type QualidadeDadoEvento = {
  possuiLocalizacao: boolean;
  possuiTalhao: boolean;
  possuiUEI: boolean;
  possuiResponsavel: boolean;
  confiabilidade: number;
};

export type EventoAgronomico = {
  id?: string;

  producerId: string;
  farmId: string;
  talhaoId?: string;

  ueiIds?: string[];
  gdaIds?: string[];

  tipo: TipoEventoAgronomico;
  origem: OrigemEventoAgronomico;

  dataEvento: string;

  responsavelId?: string;

  localizacao?: CoordenadaEvento;

  qualidadeDado: QualidadeDadoEvento;

  payloadOriginal: Record<string, unknown>;

  createdAt?: unknown;
  updatedAt?: unknown;
};