import { IdCientifico, NivelConfiabilidade } from "../tipos";

export type StatusHipotese =
  | "rascunho"
  | "em_observacao"
  | "validada"
  | "rejeitada";

export type HipoteseCientifica = {
  id: IdCientifico;
  titulo: string;
  descricao: string;
  fatorPrincipal: string;
  status: StatusHipotese;
  confiabilidade: NivelConfiabilidade;
  criadaEm: Date;
};

export function criarHipoteseCientifica(
  id: IdCientifico,
  titulo: string,
  descricao: string,
  fatorPrincipal: string,
): HipoteseCientifica {
  return {
    id,
    titulo,
    descricao,
    fatorPrincipal,
    status: "rascunho",
    confiabilidade: "baixo",
    criadaEm: new Date(),
  };
}