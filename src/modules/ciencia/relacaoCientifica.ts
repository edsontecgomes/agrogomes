import {
  FonteDadoCientifico,
  IdCientifico,
  TipoRelacaoCientifica,
} from "./tipos";

export interface RelacaoCientifica {
  id?: IdCientifico;

  origem: IdCientifico;

  destino: IdCientifico;

  tipo: TipoRelacaoCientifica | string;

  peso: number;

  confiabilidade?: number;

  fonte?: FonteDadoCientifico;

  propriedades?: Record<string, unknown>;

  criadaEm?: Date;
}

export function criarRelacaoCientifica(params: {
  id?: IdCientifico;
  origem: IdCientifico;
  destino: IdCientifico;
  tipo: TipoRelacaoCientifica | string;
  peso?: number;
  confiabilidade?: number;
  fonte?: FonteDadoCientifico;
  propriedades?: Record<string, unknown>;
}): RelacaoCientifica {
  return {
    id:
      params.id ??
      `${params.origem}-${params.tipo}-${params.destino}`,
    origem: params.origem,
    destino: params.destino,
    tipo: params.tipo,
    peso: params.peso ?? 1,
    confiabilidade: params.confiabilidade,
    fonte: params.fonte ?? "motor_cientifico",
    propriedades: params.propriedades,
    criadaEm: new Date(),
  };
}