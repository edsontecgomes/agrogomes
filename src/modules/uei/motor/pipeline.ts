export interface EventoMotor {

  hectareId: string;

  tipo:
    | "chuva"
    | "ordem_servico"
    | "compactacao"
    | "populacao"
    | "solo"
    | "produtividade";

  payload: unknown;

  data: Date;

}

export function criarEventoMotor(
  hectareId: string,
  tipo: EventoMotor["tipo"],
  payload: unknown
): EventoMotor {

  return {

    hectareId,

    tipo,

    payload,

    data: new Date(),

  };

}