export type PadraoAgronomico = {
  id: string;
  descricao: string;
  numeroHectares: number;
  numeroSafras: number;
};

export function padraoTemForca(
  padrao: PadraoAgronomico,
) {
  return (
    padrao.numeroHectares >= 20 &&
    padrao.numeroSafras >= 3
  );
}