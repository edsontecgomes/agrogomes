export type PrecisaoTemporal =
  | "exata"
  | "dia"
  | "mes"
  | "ano"
  | "estimada"
  | "desconhecida";

export type OrigemTemporal =
  | "evento"
  | "planejamento"
  | "execucao"
  | "sensor"
  | "importacao"
  | "sistema";

export type ContextoTemporal = {
  dataEventoISO: string;

  timestampMs: number;

  ano: number;

  mes: number;

  dia: number;

  hora: number;

  minuto: number;

  diaSemana: number;

  semanaAno: number;

  anoAgricola: string;

  safraId?: string;

  cultura?: string;

  diasAposPlantio?: number;

  diasDesdeEventoAnterior?: number;

  precisao: PrecisaoTemporal;

  origem: OrigemTemporal;

  dataValida: boolean;

  observacoes: string[];
};

export type EventoTemporal = {
  id?: string;

  tipo: string;

  dataEvento: string;

  safraId?: string;

  cultura?: string;

  contextoTemporal?: ContextoTemporal;
};

export type IntervaloTemporal = {
  eventoAnteriorId?: string;

  eventoAtualId?: string;

  tipoEventoAnterior: string;

  tipoEventoAtual: string;

  dataEventoAnterior: string;

  dataEventoAtual: string;

  diferencaDias: number;

  diferencaHoras: number;
};

export type ConfiguracaoAnoAgricola = {
  mesInicio: number;

  diaInicio: number;
};