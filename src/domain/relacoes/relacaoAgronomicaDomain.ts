import { DecisaoAgronomica } from "../../types/decisaoAgronomica";
import { ResultadoAgronomico } from "../../types/resultadoAgronomico";
import { RelacaoAgronomica } from "../../types/relacaoAgronomica";

interface CriarRelacaoDecisaoResultadoInput {
  decisao: DecisaoAgronomica;
  resultado: ResultadoAgronomico;
  createdBy: string;
}

function calcularImpactoPorResultado(
  resultado: ResultadoAgronomico
): RelacaoAgronomica["impacto"] {
  if (resultado.tipo === "produtividade" && typeof resultado.valor === "number") {
    if (resultado.valor >= 80) return "positivo";
    if (resultado.valor < 50) return "negativo";
    return "neutro";
  }

  if (resultado.tipo === "margem" && typeof resultado.valor === "number") {
    if (resultado.valor > 0) return "positivo";
    if (resultado.valor < 0) return "negativo";
    return "neutro";
  }

  return "inconclusivo";
}

function calcularForcaRelacao(
  resultado: ResultadoAgronomico
): RelacaoAgronomica["forca"] {
  if (resultado.confiabilidade === "validado") return "muito_forte";
  if (resultado.confiabilidade === "alto") return "forte";
  if (resultado.confiabilidade === "medio") return "moderada";
  return "fraca";
}

function calcularConfiancaPercentual(
  resultado: ResultadoAgronomico
): number {
  if (resultado.confiabilidade === "validado") return 95;
  if (resultado.confiabilidade === "alto") return 80;
  if (resultado.confiabilidade === "medio") return 60;
  return 35;
}

export function criarRelacaoDecisaoResultado(
  input: CriarRelacaoDecisaoResultadoInput
): Omit<RelacaoAgronomica, "id" | "createdAt" | "updatedAt"> {
  const impacto = calcularImpactoPorResultado(input.resultado);
  const forca = calcularForcaRelacao(input.resultado);

  return {
    producerId: input.decisao.producerId,
    farmId: input.decisao.farmId,
    talhaoId: input.decisao.talhaoId,
    memoriaAgronomicaId: input.decisao.memoriaAgronomicaId,
    cicloAgronomicoId: input.decisao.cicloAgronomicoId,
    decisaoAgronomicaId: input.decisao.id,
    resultadoAgronomicoId: input.resultado.id,
    tipo: "decisao_resultado",
    titulo: `Relação entre decisão e resultado`,
    descricao: `A decisão "${input.decisao.titulo}" foi relacionada ao resultado "${input.resultado.titulo}".`,
    impacto,
    forca,
    confiancaPercentual: calcularConfiancaPercentual(input.resultado),
    evidencias: [input.decisao.id, input.resultado.id],
    dados: {
      tipoDecisao: input.decisao.tipo,
      tipoResultado: input.resultado.tipo,
      valorResultado: input.resultado.valor ?? null,
      unidadeResultado: input.resultado.unidade ?? "",
    },
    createdBy: input.createdBy,
  };
}