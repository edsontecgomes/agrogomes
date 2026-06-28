export type DescobertaGlobal = {
  id: string;
  titulo: string;
  descricao: string;
  numeroHectares: number;
  numeroFazendas: number;
  numeroSafras: number;
  ganhoMedioScHa?: number;
  confiabilidade: number;
};

export function descobertaGlobalForte(descoberta: DescobertaGlobal) {
  return (
    descoberta.numeroHectares >= 100 &&
    descoberta.numeroFazendas >= 3 &&
    descoberta.confiabilidade >= 70
  );
}