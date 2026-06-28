export type EventoColeta =
  | "chuva"
  | "ordem_servico"
  | "solo"
  | "telemetria";

export interface RegistroColeta {
  hectareId: string;
  tipo: EventoColeta;
  data: Date;
  origem: string;
}

export function registrarEvento(
  hectareId: string,
  tipo: EventoColeta,
  origem: string
): RegistroColeta {
  return {
    hectareId,
    tipo,
    data: new Date(),
    origem,
  };
}