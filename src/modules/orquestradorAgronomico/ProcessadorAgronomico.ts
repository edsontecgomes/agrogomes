import { adicionarAlertasResultado } from "./adicionarAlertaResultado";
import { adicionarErroResultado } from "./adicionarErroResultado";
import { adicionarRegistroResultado } from "./adicionarRegistroResultado";
import { atualizarEtapaProcessamento } from "./atualizarEtapaProcessamento";
import { concluirEtapasPipelineBase } from "./concluirEtapasPipelineBase";
import { criarRegistroProcessamento } from "./criarRegistroProcessamento";
import { criarResultadoDeRegistroExistente } from "./criarResultadoDeRegistroExistente";
import { criarResultadoInicial } from "./criarResultadoInicial";
import { deveProcessarMotor } from "./deveProcessarMotor";
import { executarMotorAprendizagemOrquestrado } from "./executarMotorAprendizagemOrquestrado";
import { executarMotorCientificoOrquestrado } from "./executarMotorCientificoOrquestrado";
import { executarMotorConhecimentoOrquestrado } from "./executarMotorConhecimentoOrquestrado";
import { executarMotorEstatisticoOrquestrado } from "./executarMotorEstatisticoOrquestrado";
import { executarMotorRecomendacaoOrquestrado } from "./executarMotorRecomendacaoOrquestrado";
import { executarPipelineBaseEvento } from "./executarPipelineBaseEvento";
import { extrairContextoMotores } from "./extrairContextoMotores";
import { finalizarRegistroIdempotencia } from "./finalizarRegistroIdempotencia";
import { finalizarResultadoProcessamento } from "./finalizarResultadoProcessamento";
import { gerarChaveIdempotencia } from "./gerarChaveIdempotencia";
import { gerarIdProcessamento } from "./gerarIdProcessamento";
import { marcarEtapaIgnorada } from "./marcarEtapaIgnorada";
import { normalizarErroProcessamento } from "./normalizarErroProcessamento";
import { reservarChaveIdempotencia } from "./reservarChaveIdempotencia";
import { salvarAuditoriaSemInterromper } from "./salvarAuditoriaProcessamento";
import { validarEntradaOrquestrador } from "./validarEntradaOrquestrador";

import type {
  EntradaOrquestradorAgronomico,
  NomeEtapaAgronomica,
  ResultadoOrquestradorAgronomico,
} from "./types";

export class ProcessadorAgronomico {
  async processar(
    entrada: EntradaOrquestradorAgronomico,
  ): Promise<ResultadoOrquestradorAgronomico> {
    const processamentoId =
      gerarIdProcessamento(
        entrada.entrada.tipo,
        entrada.contexto.farmId,
      );

    const chaveIdempotencia =
      gerarChaveIdempotencia(
        entrada,
      );

    let resultado =
      criarResultadoInicial({
        processamentoId,
        chaveIdempotencia,
      });

    let etapaAtual: NomeEtapaAgronomica =
      "recepcao";

    try {
      resultado = {
        ...resultado,

        status: "validando",

        etapas:
          atualizarEtapaProcessamento({
            etapas:
              resultado.etapas,

            etapa:
              "recepcao",

            status:
              "concluida",

            mensagem:
              "Entrada recebida pelo Orquestrador Agronômico.",
          }),
      };

      resultado =
        adicionarRegistroResultado(
          resultado,
          criarRegistroProcessamento({
            processamentoId,

            etapa:
              "recepcao",

            codigo:
              "ENTRADA_RECEBIDA",

            mensagem:
              "Evento recebido para processamento agronômico completo.",

            detalhes: {
              tipoEvento:
                entrada.entrada.tipo,

              farmId:
                entrada.contexto.farmId,

              origemSolicitacao:
                entrada.origemSolicitacao ??
                "sistema",
            },
          }),
        );

      etapaAtual = "validacao";

      resultado = {
        ...resultado,

        etapas:
          atualizarEtapaProcessamento({
            etapas:
              resultado.etapas,

            etapa:
              "validacao",

            status:
              "processando",

            mensagem:
              "Validando contrato de entrada.",
          }),
      };

      const validacao =
        validarEntradaOrquestrador(
          entrada,
        );

      resultado =
        adicionarAlertasResultado(
          resultado,
          validacao.alertas,
        );

      if (!validacao.valida) {
        throw new Error(
          validacao.erros.join(" "),
        );
      }

      resultado = {
        ...resultado,

        status: "processando",

        etapas:
          atualizarEtapaProcessamento({
            etapas:
              resultado.etapas,

            etapa:
              "validacao",

            status:
              validacao.alertas.length > 0
                ? "concluida_com_alertas"
                : "concluida",

            mensagem:
              "Contrato de entrada validado.",

            detalhes: {
              totalAlertas:
                validacao.alertas.length,
            },
          }),
      };

      etapaAtual = "idempotencia";

      resultado = {
        ...resultado,

        etapas:
          atualizarEtapaProcessamento({
            etapas:
              resultado.etapas,

            etapa:
              "idempotencia",

            status:
              "processando",

            mensagem:
              "Reservando chave de idempotência.",
          }),
      };

      const reserva =
        await reservarChaveIdempotencia({
          processamentoId,

          chaveIdempotencia,

          entrada,
        });

      if (!reserva.reservada) {
        return criarResultadoDeRegistroExistente(
          reserva.registro,
        );
      }

      resultado = {
        ...resultado,

        processamentoAnteriorId:
          reserva.registro
            .processamentoAnteriorId,

        tentativas:
          reserva.registro.tentativas,

        etapas:
          atualizarEtapaProcessamento({
            etapas:
              resultado.etapas,

            etapa:
              "idempotencia",

            status:
              "concluida",

            mensagem:
              reserva.motivo === "novo"
                ? "Nova chave de idempotência reservada."
                : "Reprocessamento ou recuperação de falha autorizado.",

            detalhes: {
              motivo:
                reserva.motivo,

              tentativas:
                reserva.registro.tentativas,

              processamentoAnteriorId:
                reserva.registro
                  .processamentoAnteriorId,
            },
          }),
      };

      await salvarAuditoriaSemInterromper(
        entrada,
        resultado,
      );

      etapaAtual =
        "contexto_agronomico";

      resultado = {
        ...resultado,

        etapas:
          atualizarEtapaProcessamento({
            etapas:
              resultado.etapas,

            etapa:
              "contexto_agronomico",

            status:
              "processando",

            mensagem:
              "Resolvendo contexto e registrando Evento Agronômico.",
          }),
      };

      const evento =
        await executarPipelineBaseEvento(
          entrada,
        );

      resultado = {
        ...resultado,

        evento,

        eventoAgronomicoId:
          evento.id,
      };

      resultado =
        concluirEtapasPipelineBase(
          resultado,
        );

      resultado =
        adicionarRegistroResultado(
          resultado,
          criarRegistroProcessamento({
            processamentoId,

            etapa:
              "registro_evento",

            codigo:
              "EVENTO_AGRONOMICO_REGISTRADO",

            mensagem:
              "Evento e Timeline registrados com sucesso.",

            detalhes: {
              eventoAgronomicoId:
                evento.id,

              talhaoId:
                evento.talhaoId,

              ueiIds:
                evento.ueiIds,

              gdaIds:
                evento.gdaIds,
            },
          }),
        );

      const contextoMotores =
        extrairContextoMotores(
          entrada,
          evento,
        );

      await salvarAuditoriaSemInterromper(
        entrada,
        resultado,
      );

      etapaAtual =
        "motor_cientifico";

      resultado = {
        ...resultado,

        etapas:
          atualizarEtapaProcessamento({
            etapas:
              resultado.etapas,

            etapa:
              "motor_cientifico",

            status:
              "processando",

            mensagem:
              "Processando Motor Científico.",
          }),
      };

      const cientifico =
        await executarMotorCientificoOrquestrado(
          evento,
        );

      resultado = {
        ...resultado,

        resultadoCientificoId:
          cientifico.resultadoId,

        etapas:
          atualizarEtapaProcessamento({
            etapas:
              resultado.etapas,

            etapa:
              "motor_cientifico",

            status:
              "concluida",

            mensagem:
              "Motor Científico concluído.",

            detalhes: {
              resultadoCientificoId:
                cientifico.resultadoId,

              totalEntidades:
                cientifico.resultado
                  .totalEntidades,

              totalEvidencias:
                cientifico.resultado
                  .totalEvidencias,

              totalHipoteses:
                cientifico.resultado
                  .totalHipoteses,

              totalDescobertas:
                cientifico.resultado
                  .totalDescobertas,
            },
          }),
      };

      let estatistico:
        Awaited<
          ReturnType<
            typeof executarMotorEstatisticoOrquestrado
          >
        > | undefined;

      etapaAtual =
        "motor_estatistico";

      if (
        deveProcessarMotor(
          entrada,
          "estatistica",
        )
      ) {
        resultado = {
          ...resultado,

          etapas:
            atualizarEtapaProcessamento({
              etapas:
                resultado.etapas,

              etapa:
                "motor_estatistico",

              status:
                "processando",

              mensagem:
                "Processando Motor Estatístico.",
            }),
        };

        estatistico =
          await executarMotorEstatisticoOrquestrado(
            evento,
            contextoMotores,
          );

        resultado = {
          ...resultado,

          resultadoEstatisticoId:
            estatistico.resultadoId,

          etapas:
            atualizarEtapaProcessamento({
              etapas:
                resultado.etapas,

              etapa:
                "motor_estatistico",

              status:
                "concluida",

              mensagem:
                "Motor Estatístico concluído.",

              detalhes: {
                resultadoEstatisticoId:
                  estatistico.resultadoId,

                totalEventos:
                  estatistico.resultado
                    .totalEventos,

                totalAmostras:
                  estatistico.resultado
                    .totalAmostras,

                totalAnalises:
                  estatistico.resultado
                    .resultados.length,
              },
            }),
        };
      } else {
        resultado =
          marcarEtapaIgnorada(
            resultado,
            "motor_estatistico",
            "Motor Estatístico desativado para este processamento.",
          );
      }

      etapaAtual =
        "motor_aprendizagem";

      let aprendizagem:
        Awaited<
          ReturnType<
            typeof executarMotorAprendizagemOrquestrado
          >
        > | undefined;

      if (
        deveProcessarMotor(
          entrada,
          "aprendizado",
        )
      ) {
        resultado = {
          ...resultado,

          etapas:
            atualizarEtapaProcessamento({
              etapas:
                resultado.etapas,

              etapa:
                "motor_aprendizagem",

              status:
                "processando",

              mensagem:
                "Processando Motor de Aprendizagem.",
            }),
        };

        aprendizagem =
          await executarMotorAprendizagemOrquestrado({
            resultadoCientifico:
              cientifico.resultado,

            resultadoEstatistico:
              estatistico?.resultado,

            contexto:
              contextoMotores,
          });

        resultado = {
          ...resultado,

          aprendizadoIds:
            aprendizagem.aprendizadoIds,

          etapas:
            atualizarEtapaProcessamento({
              etapas:
                resultado.etapas,

              etapa:
                "motor_aprendizagem",

              status:
                "concluida",

              mensagem:
                "Motor de Aprendizagem concluído.",

              detalhes: {
                totalAprendizados:
                  aprendizagem.resultado
                    .totalAprendizados,

                totalFortes:
                  aprendizagem.resultado
                    .totalFortes,

                totalContraditorios:
                  aprendizagem.resultado
                    .totalContraditorios,

                confiabilidadeMedia:
                  aprendizagem.resultado
                    .confiabilidadeMedia,
              },
            }),
        };
      } else {
        resultado =
          marcarEtapaIgnorada(
            resultado,
            "motor_aprendizagem",
            "Motor de Aprendizagem desativado para este processamento.",
          );
      }

      etapaAtual =
        "motor_conhecimento";

      let conhecimento:
        Awaited<
          ReturnType<
            typeof executarMotorConhecimentoOrquestrado
          >
        > | undefined;

      if (
        deveProcessarMotor(
          entrada,
          "conhecimento",
        ) &&
        aprendizagem
      ) {
        resultado = {
          ...resultado,

          etapas:
            atualizarEtapaProcessamento({
              etapas:
                resultado.etapas,

              etapa:
                "motor_conhecimento",

              status:
                "processando",

              mensagem:
                "Processando Motor de Conhecimento.",
            }),
        };

        conhecimento =
          await executarMotorConhecimentoOrquestrado(
            aprendizagem.resultado,
          );

        resultado = {
          ...resultado,

          conhecimentoIds:
            conhecimento.conhecimentoIds,

          etapas:
            atualizarEtapaProcessamento({
              etapas:
                resultado.etapas,

              etapa:
                "motor_conhecimento",

              status:
                "concluida",

              mensagem:
                "Motor de Conhecimento concluído.",

              detalhes: {
                totalRecebidos:
                  conhecimento.resultado
                    .totalRecebidos,

                totalConsolidados:
                  conhecimento.resultado
                    .totalConsolidados,

                totalMaduros:
                  conhecimento.resultado
                    .totalMaduros,

                totalContraditorios:
                  conhecimento.resultado
                    .totalContraditorios,
              },
            }),
        };
      } else {
        resultado =
          marcarEtapaIgnorada(
            resultado,
            "motor_conhecimento",
            aprendizagem
              ? "Motor de Conhecimento desativado para este processamento."
              : "Motor de Conhecimento ignorado porque não houve resultado de aprendizagem.",
          );
      }

      etapaAtual =
        "motor_recomendacao";

      if (
        deveProcessarMotor(
          entrada,
          "recomendacao",
        ) &&
        conhecimento
      ) {
        resultado = {
          ...resultado,

          etapas:
            atualizarEtapaProcessamento({
              etapas:
                resultado.etapas,

              etapa:
                "motor_recomendacao",

              status:
                "processando",

              mensagem:
                "Processando Motor de Recomendação.",
            }),
        };

        const recomendacao =
          await executarMotorRecomendacaoOrquestrado({
            conhecimentos:
              conhecimento.resultado
                .conhecimentos,

            contexto:
              contextoMotores,
          });

        resultado = {
          ...resultado,

          recomendacaoIds:
            recomendacao.recomendacaoIds,

          etapas:
            atualizarEtapaProcessamento({
              etapas:
                resultado.etapas,

              etapa:
                "motor_recomendacao",

              status:
                "concluida",

              mensagem:
                "Motor de Recomendação concluído.",

              detalhes: {
                totalAlternativas:
                  recomendacao.resultado
                    .totalAlternativas,

                totalRecomendacoes:
                  recomendacao.resultado
                    .totalRecomendacoes,

                totalImpedidas:
                  recomendacao.resultado
                    .totalImpedidas,

                recomendacaoPrincipalId:
                  recomendacao.resultado
                    .recomendacaoPrincipal
                    ?.id,
              },
            }),
        };
      } else {
        resultado =
          marcarEtapaIgnorada(
            resultado,
            "motor_recomendacao",
            conhecimento
              ? "Motor de Recomendação desativado para este processamento."
              : "Motor de Recomendação ignorado porque não houve conhecimento consolidado.",
          );
      }

      let etapasFinalizadas =
        atualizarEtapaProcessamento({
          etapas:
            resultado.etapas,

          etapa:
            "auditoria",

          status:
            "concluida",

          mensagem:
            "Auditoria persistente atualizada.",
        });

      etapasFinalizadas =
        atualizarEtapaProcessamento({
          etapas:
            etapasFinalizadas,

          etapa:
            "finalizacao",

          status:
            "concluida",

          mensagem:
            "OA4 finalizado com a cadeia completa de motores.",
        });

      resultado = {
        ...resultado,

        etapas:
          etapasFinalizadas,
      };

      resultado =
        adicionarRegistroResultado(
          resultado,
          criarRegistroProcessamento({
            processamentoId,

            etapa:
              "finalizacao",

            codigo:
              "CADEIA_INTELIGENTE_CONCLUIDA",

            mensagem:
              "Todos os motores habilitados foram processados.",

            detalhes: {
              eventoAgronomicoId:
                resultado.eventoAgronomicoId,

              resultadoCientificoId:
                resultado.resultadoCientificoId,

              resultadoEstatisticoId:
                resultado.resultadoEstatisticoId,

              totalAprendizados:
                resultado.aprendizadoIds.length,

              totalConhecimentos:
                resultado.conhecimentoIds.length,

              totalRecomendacoes:
                resultado.recomendacaoIds.length,
            },
          }),
        );

      resultado =
        finalizarResultadoProcessamento({
          resultado,
        });

      await salvarAuditoriaSemInterromper(
        entrada,
        resultado,
      );

      await finalizarRegistroIdempotencia(
        resultado,
      );

      return resultado;
    } catch (erro) {
      const erroNormalizado =
        normalizarErroProcessamento({
          erro,

          etapa:
            etapaAtual,

          codigo:
            "FALHA_ORQUESTRADOR_OA4",

          recuperavel:
            true,
        });

      resultado =
        adicionarErroResultado(
          resultado,
          erroNormalizado,
        );

      resultado = {
        ...resultado,

        status:
          resultado.evento
            ? "processado_com_alertas"
            : "falhou",

        etapas:
          atualizarEtapaProcessamento({
            etapas:
              resultado.etapas,

            etapa:
              etapaAtual,

            status:
              "falhou",

            mensagem:
              erroNormalizado.mensagem,
          }),
      };

      resultado =
        adicionarRegistroResultado(
          resultado,
          criarRegistroProcessamento({
            processamentoId,

            etapa:
              etapaAtual,

            severidade:
              resultado.evento
                ? "alerta"
                : "erro",

            codigo:
              erroNormalizado.codigo,

            mensagem:
              erroNormalizado.mensagem,
          }),
        );

      resultado =
        finalizarResultadoProcessamento({
          resultado,

          status:
            resultado.evento
              ? "processado_com_alertas"
              : "falhou",
        });

      await salvarAuditoriaSemInterromper(
        entrada,
        resultado,
      );

      try {
        await finalizarRegistroIdempotencia(
          resultado,
        );
      } catch (erroIdempotencia) {
        console.warn(
          "Falha ao finalizar registro de idempotência:",
          erroIdempotencia,
        );
      }

      return resultado;
    }
  }
}