import {
  FonteDadoCientifico,
  IdCientifico,
  TipoEvento,
} from "./tipos";

export interface EventoCientifico {
  id: IdCientifico;

  eventoAgronomicoId?: string;

  tipo: TipoEvento;

  data: Date;

  descricao: string;

  origem: FonteDadoCientifico | string;

  entidadeIds: IdCientifico[];

  producerId?: string;

  farmId?: string;

  talhaoId?: string;

  ueiIds?: string[];

  gdaIds?: string[];

  confiabilidade?: number;

  propriedades?: Record<string, unknown>;
}

export function criarEventoCientifico(params: {
  id: IdCientifico;
  eventoAgronomicoId?: string;
  tipo: TipoEvento;
  data: Date;
  descricao: string;
  origem?: FonteDadoCientifico | string;
  entidadeIds?: IdCientifico[];
  producerId?: string;
  farmId?: string;
  talhaoId?: string;
  ueiIds?: string[];
  gdaIds?: string[];
  confiabilidade?: number;
  propriedades?: Record<string, unknown>;
}): EventoCientifico {
  return {
    id: params.id,
    eventoAgronomicoId: params.eventoAgronomicoId,
    tipo: params.tipo,
    data: params.data,
    descricao: params.descricao,
    origem: params.origem ?? "motor_cientifico",
    entidadeIds: params.entidadeIds ?? [],
    producerId: params.producerId,
    farmId: params.farmId,
    talhaoId: params.talhaoId,
    ueiIds: params.ueiIds,
    gdaIds: params.gdaIds,
    confiabilidade: params.confiabilidade,
    propriedades: params.propriedades,
  };
}