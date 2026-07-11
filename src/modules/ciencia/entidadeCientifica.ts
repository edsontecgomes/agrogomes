import {
  FonteDadoCientifico,
  IdCientifico,
  TipoEntidade,
} from "./tipos";

export interface EntidadeCientifica {
  id: IdCientifico;

  tipo: TipoEntidade;

  nome: string;

  origem?: FonteDadoCientifico;

  propriedades?: Record<string, unknown>;

  criadoEm: Date;

  atualizadoEm?: Date;
}

export function criarEntidadeCientifica(params: {
  id: IdCientifico;
  tipo: TipoEntidade;
  nome: string;
  origem?: FonteDadoCientifico;
  propriedades?: Record<string, unknown>;
  criadoEm?: Date;
}): EntidadeCientifica {
  return {
    id: params.id,
    tipo: params.tipo,
    nome: params.nome,
    origem: params.origem ?? "motor_cientifico",
    propriedades: params.propriedades,
    criadoEm: params.criadoEm ?? new Date(),
  };
}