import { EventoAgronomico } from "../eventosAgronomicos/types";

import { adaptarEventoAgronomico } from "./adaptarEventoAgronomico";
import { criarEvidenciasDoEvento } from "./criarEvidenciasDoEvento";
import { executarMotorCientificoEvento } from "./executarMotorCientificoEvento";
import { extrairComparacoesCientificas } from "./extrairComparacoesCientificas";
import { extrairFatoresCientificosDoEvento } from "./extrairFatoresCientificosDoEvento";
import { gerarDescobertasDoEvento } from "./gerarDescobertasDoEvento";
import { gerarExplicacaoDoEvento } from "./gerarExplicacaoDoEvento";
import { gerarHipotesesDoEvento } from "./gerarHipotesesDoEvento";
import { ResultadoMotorCientificoCompleto } from "./typesMotorCientifico";

export function processarEventoNoMotorCientifico(
  evento: EventoAgronomico,
): ResultadoMotorCientificoCompleto {
  const resultadoBase =
    executarMotorCientificoEvento(evento);

  const eventoCientifico =
    adaptarEventoAgronomico(evento);

  const fatores =
    extrairFatoresCientificosDoEvento(
      evento,
    );

  const evidencias =
    criarEvidenciasDoEvento(
      evento,
      fatores,
    );

  const hipoteses =
    gerarHipotesesDoEvento(
      fatores,
      evidencias,
    );

  const comparacoes =
    extrairComparacoesCientificas(
      evento,
    );

  const eventoId =
    evento.id ??
    `${evento.tipo}-${Date.parse(evento.dataEvento)}`;

  const descobertas =
    gerarDescobertasDoEvento(
      eventoId,
      comparacoes,
    );

  const explicacao =
    gerarExplicacaoDoEvento(evento);

  return {
    eventoAgronomicoId:
      evento.id,

    eventoCientifico,

    grafo:
      resultadoBase.grafo,

    fatores,

    evidencias,

    hipoteses,

    descobertas,

    explicacao,

    totalEntidades:
      resultadoBase.totalEntidades,

    totalRelacoes:
      resultadoBase.totalRelacoes,

    totalEvidencias:
      evidencias.length,

    totalHipoteses:
      hipoteses.length,

    totalDescobertas:
      descobertas.length,

    processadoEm:
      new Date(),
  };
}