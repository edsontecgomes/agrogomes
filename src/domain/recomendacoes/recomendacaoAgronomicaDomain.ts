import { AprendizadoAgronomico } from "../../types/aprendizadoAgronomico";
import { RecomendacaoAgronomica } from "../../types/recomendacaoAgronomica";

interface CriarRecomendacaoPorAprendizadoInput {
  aprendizado: AprendizadoAgronomico;
  createdBy: string;
}

function definirPrioridade(
  aprendizado: AprendizadoAgronomico
): RecomendacaoAgronomica["prioridade"] {
  if (aprendizado.confiancaPercentual >= 90) return "alta";
  if (aprendizado.confiancaPercentual >= 75) return "media";
  return "baixa";
}

function montarAcaoRecomendada(aprendizado: AprendizadoAgronomico): string {
  if (aprendizado.tipo === "variedade") {
    return "Considerar repetir ou ajustar a escolha da variedade conforme o histórico observado.";
  }

  if (aprendizado.tipo === "adubacao") {
    return "Avaliar a estratégia de adubação com base na resposta produtiva observada.";
  }

  if (aprendizado.tipo === "plantio") {
    return "Comparar a janela de plantio utilizada com os resultados obtidos.";
  }

  if (aprendizado.tipo === "chuva") {
    return "Relacionar a disponibilidade hídrica com a produtividade antes de repetir a estratégia.";
  }

  if (aprendizado.tipo === "solo") {
    return "Avaliar se o ambiente de solo favoreceu ou limitou a resposta da lavoura.";
  }

  return "Utilizar este aprendizado como referência técnica para decisões futuras.";
}

export function criarRecomendacaoAPartirDeAprendizado(
  input: CriarRecomendacaoPorAprendizadoInput
): Omit<RecomendacaoAgronomica, "id" | "createdAt" | "updatedAt"> {
  return {
    producerId: input.aprendizado.producerId,
    farmId: input.aprendizado.farmId,
    talhaoId: input.aprendizado.talhaoId,
    memoriaAgronomicaId: input.aprendizado.memoriaAgronomicaId,
    cicloAgronomicoId: input.aprendizado.cicloAgronomicoId,
    tipo: input.aprendizado.tipo,
    status: "ativa",
    prioridade: definirPrioridade(input.aprendizado),
    titulo: `Recomendação: ${input.aprendizado.titulo}`,
    descricao: input.aprendizado.descricao,
    justificativa:
      input.aprendizado.conclusao ??
      "Recomendação gerada a partir de aprendizado agronômico registrado.",
    acaoRecomendada: montarAcaoRecomendada(input.aprendizado),
    beneficioEsperado:
      "Aumentar a qualidade da tomada de decisão com base no histórico da Memória Agronômica.",
    riscoNaoExecutar:
      "Repetir decisões sem considerar o histórico técnico e produtivo da área.",
    aprendizadosBase: [input.aprendizado.id],
    relacoesBase: input.aprendizado.relacoesBase,
    evidencias: [
      ...input.aprendizado.relacoesBase,
      ...input.aprendizado.decisoesBase,
      ...input.aprendizado.resultadosBase,
    ],
    confiancaPercentual: input.aprendizado.confiancaPercentual,
    aplicavelEm: input.aprendizado.aplicavelEm,
    dados: {
      tipoAprendizado: input.aprendizado.tipo,
      confiancaAprendizado: input.aprendizado.confianca,
    },
    createdBy: input.createdBy,
  };
}