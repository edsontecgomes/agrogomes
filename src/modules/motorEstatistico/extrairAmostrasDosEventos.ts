import { EventoAgronomico } from "../eventosAgronomicos/types";

import { AmostraEstatistica } from "./types";

type CampoNumericoMapeado = {
  fator: string;

  unidade?: string;

  valor: unknown;
};

function criarAmostra(
  evento: EventoAgronomico,
  campo: CampoNumericoMapeado,
  indice: number,
): AmostraEstatistica | null {
  if (
    typeof campo.valor !== "number" ||
    !Number.isFinite(campo.valor)
  ) {
    return null;
  }

  const entidadeId =
    evento.ueiIds?.[0] ??
    evento.talhaoId ??
    evento.farmId;

  return {
    id: [
      evento.id ??
        `${evento.tipo}-${evento.dataEvento}`,
      campo.fator,
      String(indice + 1).padStart(3, "0"),
    ].join("-"),

    entidadeId,

    fator:
      campo.fator,

    valor:
      campo.valor,

    unidade:
      campo.unidade,

    data:
      evento.dataEvento,

    grupo:
      evento.tipo,

    propriedades: {
      eventoAgronomicoId:
        evento.id,

      farmId:
        evento.farmId,

      talhaoId:
        evento.talhaoId,

      ueiIds:
        evento.ueiIds,

      gdaIds:
        evento.gdaIds,

      origem:
        evento.origem,
    },
  };
}

export function extrairAmostrasDosEventos(
  eventos: EventoAgronomico[],
): AmostraEstatistica[] {
  const amostras: AmostraEstatistica[] = [];

  eventos.forEach((evento) => {
    const payload =
      evento.payloadOriginal;

    const cobertura =
      payload.coberturaOperacional as
        | Record<string, unknown>
        | undefined;

    const contextoTemporal =
      payload.contextoTemporal as
        | Record<string, unknown>
        | undefined;

    const qualidade =
      payload.qualidadeCientifica as
        | Record<string, unknown>
        | undefined;

    const campos: CampoNumericoMapeado[] = [
      {
        fator:
          "chuva_volume_mm",

        unidade:
          "mm",

        valor:
          payload.volumeMm,
      },
      {
        fator:
          "sementes_por_metro",

        unidade:
          "sementes_m",

        valor:
          payload.sementesPorMetro,
      },
      {
        fator:
          "largura_operacional_metros",

        unidade:
          "m",

        valor:
          payload.larguraOperacionalMetros,
      },
      {
        fator:
          "area_coberta_ha",

        unidade:
          "ha",

        valor:
          cobertura?.areaTotalCobertaHa,
      },
      {
        fator:
          "percentual_cobertura",

        unidade:
          "%",

        valor:
          cobertura?.percentualMedioCobertura,
      },
      {
        fator:
          "confiabilidade_espacial",

        unidade:
          "indice",

        valor:
          cobertura?.confiabilidade,
      },
      {
        fator:
          "dias_apos_plantio",

        unidade:
          "dias",

        valor:
          contextoTemporal?.diasAposPlantio,
      },
      {
        fator:
          "indice_qualidade_cientifica",

        unidade:
          "%",

        valor:
          qualidade?.indiceQualidadeCientifica,
      },
      {
        fator:
          "produtividade_sc_ha",

        unidade:
          "sc_ha",

        valor:
          payload.produtividadeScHa,
      },
    ];

    campos.forEach(
      (campo, indice) => {
        const amostra =
          criarAmostra(
            evento,
            campo,
            indice,
          );

        if (amostra) {
          amostras.push(
            amostra,
          );
        }
      },
    );
  });

  return amostras;
}