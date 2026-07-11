import { EventoAgronomico } from "../eventosAgronomicos/types";

import { FatorCientificoExtraido } from "./typesMotorCientifico";

type PayloadContexto = {
  cultura?: unknown;
  safraId?: unknown;
  confiabilidadeContexto?: unknown;
  confiabilidadeEspacial?: unknown;
};

type PayloadQualidade = {
  indiceQualidadeCientifica?: unknown;
};

function adicionarFator(
  fatores: FatorCientificoExtraido[],
  fator: FatorCientificoExtraido,
): void {
  if (
    fator.valor === undefined ||
    fator.valor === null ||
    fator.valor === ""
  ) {
    return;
  }

  const existente = fatores.some(
    (item) =>
      item.chave === fator.chave &&
      item.valor === fator.valor,
  );

  if (!existente) {
    fatores.push(fator);
  }
}

export function extrairFatoresCientificosDoEvento(
  evento: EventoAgronomico,
): FatorCientificoExtraido[] {
  const fatores: FatorCientificoExtraido[] = [];

  const payload = evento.payloadOriginal;

  const contexto =
    payload.contexto as PayloadContexto | undefined;

  const qualidade =
    payload.qualidadeCientifica as
      | PayloadQualidade
      | undefined;

  adicionarFator(fatores, {
    chave: "tipo_evento",
    valor: evento.tipo,
    descricao: `Evento agronômico do tipo ${evento.tipo}.`,
    peso: 1,
    origem: "evento",
  });

  adicionarFator(fatores, {
    chave: "origem_evento",
    valor: evento.origem,
    descricao: `Dado originado por ${evento.origem}.`,
    peso: 0.8,
    origem: "evento",
  });

  adicionarFator(fatores, {
    chave: "cultura",
    valor: contexto?.cultura,
    descricao: `Cultura identificada: ${String(
      contexto?.cultura ?? "",
    )}.`,
    peso: 1,
    origem: "contexto",
  });

  adicionarFator(fatores, {
    chave: "safra",
    valor: contexto?.safraId,
    descricao: `Safra identificada: ${String(
      contexto?.safraId ?? "",
    )}.`,
    peso: 1,
    origem: "contexto",
  });

  adicionarFator(fatores, {
    chave: "confiabilidade_contexto",
    valor: contexto?.confiabilidadeContexto,
    descricao:
      "Confiabilidade da resolução do contexto agronômico.",
    peso: 0.9,
    origem: "qualidade",
  });

  adicionarFator(fatores, {
    chave: "confiabilidade_espacial",
    valor: contexto?.confiabilidadeEspacial,
    descricao:
      "Confiabilidade da resolução espacial do evento.",
    peso: 0.9,
    origem: "qualidade",
  });

  adicionarFator(fatores, {
    chave: "indice_qualidade_cientifica",
    valor:
      qualidade?.indiceQualidadeCientifica,
    descricao:
      "Índice de Qualidade Científica do evento.",
    peso: 1,
    origem: "qualidade",
  });

  adicionarFator(fatores, {
    chave: "volume_chuva_mm",
    valor: payload.volumeMm,
    descricao: `Volume de chuva registrado: ${String(
      payload.volumeMm ?? "",
    )} mm.`,
    peso: 1,
    origem: "clima",
  });

  adicionarFator(fatores, {
    chave: "tipo_operacao",
    valor: payload.tipoOperacao,
    descricao: `Tipo de operação: ${String(
      payload.tipoOperacao ?? "",
    )}.`,
    peso: 1,
    origem: "operacao",
  });

  adicionarFator(fatores, {
    chave: "cultivar",
    valor: payload.cultivar,
    descricao: `Cultivar utilizada: ${String(
      payload.cultivar ?? "",
    )}.`,
    peso: 1,
    origem: "operacao",
  });

  adicionarFator(fatores, {
    chave: "lote_semente",
    valor: payload.loteSemente,
    descricao: `Lote de semente: ${String(
      payload.loteSemente ?? "",
    )}.`,
    peso: 0.9,
    origem: "operacao",
  });

  adicionarFator(fatores, {
    chave: "sementes_por_metro",
    valor: payload.sementesPorMetro,
    descricao: `Sementes por metro: ${String(
      payload.sementesPorMetro ?? "",
    )}.`,
    peso: 1,
    origem: "operacao",
  });

  adicionarFator(fatores, {
    chave: "implemento",
    valor: payload.implementoPlanejado,
    descricao: `Implemento utilizado: ${String(
      payload.implementoPlanejado ?? "",
    )}.`,
    peso: 0.8,
    origem: "operacao",
  });

  adicionarFator(fatores, {
    chave: "largura_operacional_metros",
    valor: payload.larguraOperacionalMetros,
    descricao: `Largura operacional: ${String(
      payload.larguraOperacionalMetros ?? "",
    )} metros.`,
    peso: 0.9,
    origem: "operacao",
  });

  return fatores;
}