export type HipoteseAgronomica = {
  id: string;
  titulo: string;
  descricao: string;
  fatorPrincipal: string;
  confiabilidade: number;
};

export function criarHipoteseAgronomica(
  id: string,
  titulo: string,
  descricao: string,
  fatorPrincipal: string,
  confiabilidade = 0,
): HipoteseAgronomica {
  return {
    id,
    titulo,
    descricao,
    fatorPrincipal,
    confiabilidade,
  };
}