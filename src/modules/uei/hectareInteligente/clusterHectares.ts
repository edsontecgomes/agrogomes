export type ClusterHectares = {
  id: string;
  nome: string;
  hectareIds: string[];
  criterio: string;
};

export function criarClusterHectares(
  id: string,
  nome: string,
  hectareIds: string[],
  criterio: string,
): ClusterHectares {
  return {
    id,
    nome,
    hectareIds,
    criterio,
  };
}