import { calcularCompatibilidade } from "./calcularCompatibilidade";
import { calcularConfiabilidadeRecomendacao } from "./calcularConfiabilidadeRecomendacao";
import { calcularPontuacaoFinal } from "./calcularPontuacaoFinal";
import { calcularRiscoTotal } from "./calcularRiscoTotal";
import { classificarPrioridadeRecomendacao } from "./classificarPrioridadeRecomendacao";
import { gerarIdRecomendacao } from "./normalizarIdRecomendacao";
import type {
  AlternativaManejo,
  ContextoRecomendacao,
  RecomendacaoAgronomica,
} from "./types";

export function construirRecomendacao(
  alternativa: AlternativaManejo,
  contexto: ContextoRecomendacao,
): RecomendacaoAgronomica {
  const entidadeId =
    contexto.gdaId ??
    contexto.ueiId ??
    contexto.talhaoId ??
    contexto.farmId;

  const conhecimentos =
    contexto.conhecimentos.filter(
      (conhecimento) =>
        alternativa.conhecimentoIds.includes(
          conhecimento.id,
        ),
    );

  const compatibilidade =
    calcularCompatibilidade(
      alternativa.criterios,
    );

  const risco =
    calcularRiscoTotal(
      alternativa.riscos,
    );

  const beneficio =
    alternativa.beneficio
      ?.pontuacaoBeneficio ?? 0;

  const confiabilidade =
    calcularConfiabilidadeRecomendacao(
      conhecimentos,
      compatibilidade,
    );

  const pontuacaoFinal =
    calcularPontuacaoFinal({
      beneficio,

      risco:
        risco.pontuacao,

      compatibilidade,

      confiabilidade,

      possuiImpedimento:
        risco.possuiImpedimento,
    });

  const agora =
    new Date().toISOString();

  const justificativas = [
    `Compatibilidade calculada em ${compatibilidade}%.`,

    `Benefício estimado em ${beneficio} pontos.`,

    `Risco calculado em ${risco.pontuacao} pontos.`,

    `Confiança calculada em ${Number(
      (
        confiabilidade * 100
      ).toFixed(2),
    )}%.`,
  ];

  const limitacoes: string[] = [];

  if (conhecimentos.length === 0) {
    limitacoes.push(
      "Nenhum conhecimento consolidado foi associado à alternativa.",
    );
  }

  if (confiabilidade < 0.6) {
    limitacoes.push(
      "A confiança ainda é insuficiente para uma recomendação definitiva.",
    );
  }

  if (risco.possuiImpedimento) {
    limitacoes.push(
      "Existe uma condição impeditiva; a alternativa deve ser investigada antes da aplicação.",
    );
  }

  return {
    id: gerarIdRecomendacao({
      entidadeId,

      alternativaId:
        alternativa.id,

      safraId:
        contexto.safraId,
    }),

    tipo:
      alternativa.tipo,

    titulo:
      alternativa.titulo,

    descricao:
      alternativa.descricao,

    producerId:
      contexto.producerId,

    farmId:
      contexto.farmId,

    talhaoId:
      contexto.talhaoId,

    ueiId:
      contexto.ueiId,

    gdaId:
      contexto.gdaId,

    safraId:
      contexto.safraId,

    cultura:
      contexto.cultura,

    alternativaId:
      alternativa.id,

    caminho:
      alternativa.caminho,

    status:
      risco.possuiImpedimento
        ? "rascunho"
        : "disponivel",

    prioridade:
      classificarPrioridadeRecomendacao(
        pontuacaoFinal,
        risco.pontuacao,
      ),

    risco:
      risco.nivel,

    pontuacaoBeneficio:
      beneficio,

    pontuacaoRisco:
      risco.pontuacao,

    pontuacaoCompatibilidade:
      compatibilidade,

    pontuacaoFinal,

    confiabilidade,

    beneficio:
      alternativa.beneficio,

    criterios:
      alternativa.criterios,

    riscos:
      alternativa.riscos,

    conhecimentoIds:
      alternativa.conhecimentoIds,

    justificativas,

    limitacoes,

    condicoesParaAplicacao:
      risco.possuiImpedimento
        ? [
            "Resolver as condições impeditivas antes de aplicar a recomendação.",
          ]
        : [
            "Confirmar condições operacionais e agronômicas no momento da execução.",
          ],

    criadoEm:
      agora,

    atualizadoEm:
      agora,

    propriedades:
      alternativa.propriedades,
  };
}