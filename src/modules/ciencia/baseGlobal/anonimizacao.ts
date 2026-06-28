export type RegistroAnonimizado = {
  idAnonimo: string;
  origemTipo: "hectare" | "fazenda" | "safra" | "descoberta";
  payload: Record<string, unknown>;
};

export function removerIdentificadoresDiretos(
  payload: Record<string, unknown>,
): Record<string, unknown> {
  const proibidos = ["nome", "email", "telefone", "cpf", "cnpj", "endereco"];

  return Object.fromEntries(
    Object.entries(payload).filter(([chave]) => !proibidos.includes(chave)),
  );
}