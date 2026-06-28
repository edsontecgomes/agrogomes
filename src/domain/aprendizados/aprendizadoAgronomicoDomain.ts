import { AprendizadoAgronomico } from "../../types/aprendizadoAgronomico";
import { RelacaoAgronomica } from "../../types/relacaoAgronomica";

interface CriarAprendizadoPorRelacaoInput {
  relacao: RelacaoAgronomica;
  createdBy: string;
}

function definirConfianca(
  relacao: RelacaoAgronomica
): AprendizadoAgronomico["confianca"] {
  if (relacao.confiancaPercentual >= 90) return "muito_alto";
  if (relacao.confiancaPercentual >= 75) return "alto";
  if (relacao.confiancaPercentual >= 50) return "medio";
  return "baixo";
}

function inferirTipoAprendizado(
  relacao: RelacaoAgronomica
): AprendizadoAgronomico["tipo"] {
  if (relacao.tipo === "variedade_resultado") return "variedade";
  if (relacao.tipo === "chuva_resultado") return "chuva";
  if (relacao.tipo === "solo_resultado") return "solo";
  if (relacao.tipo === "custo_resultado") return "custo";
  if (relacao.tipo === "manejo_resultado") return "manejo";
  if (relacao.tipo === "decisao_resultado") return "manejo";
  return "outro";
}

export function criarAprendizadoAPartirDeRelacao(
  input: CriarAprendizadoPorRelacaoInput
): Omit<AprendizadoAgronomico, "id" | "createdAt" | "updatedAt"> {
  const tipo = inferirTipoAprendizado(input.relacao);
  const confianca = definirConfianca(input.relacao);

  return {
    producerId: input.relacao.producerId,
    farmId: input.relacao.farmId,
    talhaoId: input.relacao.talhaoId,
    memoriaAgronomicaId: input.relacao.memoriaAgronomicaId,
    cicloAgronomicoId: input.relacao.cicloAgronomicoId,
    tipo,
    status: "ativo",
    titulo: `Aprendizado gerado: ${input.relacao.titulo}`,
    descricao:
      input.relacao.descricao ??
      "Aprendizado gerado automaticamente a partir de uma relação agronômica.",
    conclusao: `Impacto ${input.relacao.impacto} com força ${input.relacao.forca}.`,
    relacoesBase: [input.relacao.id],
    decisoesBase: input.relacao.decisaoAgronomicaId
      ? [input.relacao.decisaoAgronomicaId]
      : [],
    resultadosBase: input.relacao.resultadoAgronomicoId
      ? [input.relacao.resultadoAgronomicoId]
      : [],
    confianca,
    confiancaPercentual: input.relacao.confiancaPercentual,
    dados: {
      impacto: input.relacao.impacto,
      forca: input.relacao.forca,
      tipoRelacao: input.relacao.tipo,
    },
    createdBy: input.createdBy,
  };
}