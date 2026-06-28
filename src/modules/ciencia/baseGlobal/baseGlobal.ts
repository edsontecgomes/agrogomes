export type BaseGlobalConhecimento = {
  id: string;
  nome: string;
  descricao: string;
  anonimizacaoObrigatoria: boolean;
  ativa: boolean;
};

export function criarBaseGlobalConhecimento(): BaseGlobalConhecimento {
  return {
    id: "base-global-agrogomes",
    nome: "Base Global de Conhecimento AgroGomes",
    descricao:
      "Base preparada para consolidar descobertas agronômicas validadas, com dados anonimizados e autorizados.",
    anonimizacaoObrigatoria: true,
    ativa: false,
  };
}