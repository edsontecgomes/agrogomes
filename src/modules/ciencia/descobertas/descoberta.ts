import { IdCientifico, NivelConfiabilidade } from "../tipos";

export type DescobertaCientifica = {
  id: IdCientifico;
  titulo: string;
  descricao: string;
  fatorPrincipal: string;
  impactoScHa?: number;
  confiabilidade: NivelConfiabilidade;
  criadaEm: Date;
};

export function criarDescoberta(
  id: IdCientifico,
  titulo: string,
  descricao: string,
  fatorPrincipal: string,
): DescobertaCientifica {
  return {
    id,
    titulo,
    descricao,
    fatorPrincipal,
    confiabilidade: "baixo",
    criadaEm: new Date(),
  };
}