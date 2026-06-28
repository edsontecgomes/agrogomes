import { IdCientifico } from "../tipos";

export type EvidenciaHipotese = {
  id: IdCientifico;
  hipoteseId: IdCientifico;
  entidadeId: IdCientifico;
  descricao: string;
  impactoEstimadoScHa?: number;
  peso: number;
  criadaEm: Date;
};

export function criarEvidenciaHipotese(
  id: IdCientifico,
  hipoteseId: IdCientifico,
  entidadeId: IdCientifico,
  descricao: string,
  peso = 1,
): EvidenciaHipotese {
  return {
    id,
    hipoteseId,
    entidadeId,
    descricao,
    peso,
    criadaEm: new Date(),
  };
}