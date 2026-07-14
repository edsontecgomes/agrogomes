import { adicionarAlertasResultado } from "./adicionarAlertaResultado";
import { adicionarErroResultado } from "./adicionarErroResultado";
import { adicionarRegistroResultado } from "./adicionarRegistroResultado";
import { atualizarEtapaProcessamento } from "./atualizarEtapaProcessamento";
import { concluirEtapasPipelineBase } from "./concluirEtapasPipelineBase";
import { criarRegistroProcessamento } from "./criarRegistroProcessamento";
import { criarResultadoDeRegistroExistente } from "./criarResultadoDeRegistroExistente";
import { criarResultadoInicial } from "./criarResultadoInicial";
import { executarMotorCientificoOrquestrado } from "./executarMotorCientificoOrquestrado";
import { executarPipelineBaseEvento } from "./executarPipelineBaseEvento";
import { finalizarRegistroIdempotencia } from "./finalizarRegistroIdempotencia";
import { finalizarResultadoProcessamento } from "./finalizarResultadoProcessamento";
import { gerarChaveIdempotencia } from "./gerarChaveIdempotencia";
import { gerarIdProcessamento } from "./gerarIdProcessamento";
import { marcarMotoresPosterioresIgnorados } from "./marcarMotoresPosterioresIgnorados";
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
      gerarChaveIdempotencia(entrada);

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
            etapas: resultado.etapas,

            etapa: "recepcao",

            status: "concluida",

            mensagem:
              "Entrada recebida pelo Orquestrador Agronômico.",
          }),
      };

      resultado =
        adicionarRegistroResultado(
          resultado,
          criarRegistroProcessamento({
            processamentoId,

            etapa: "recepcao",

            codigo: "ENTRADA_RECEBIDA",

            mensagem:
              "Evento recebido para processamento agronômico.",

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
            etapas: resultado.etapas,

            etapa: "validacao",

            status: "processando",

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

        etapas:
          atualizarEtapaProcessamento({
            etapas: resultado.etapas,

            etapa: "validacao",

            status:
              validacao.alertas.length > 0
                ? "concluida_com_alertas"
                : "concluida",

            mensagem:
              "Contrato de entrada validado.",
          }),

        status: "processando",
      };

      etapaAtual = "idempotencia";

      resultado = {
        ...resultado,

        etapas:
          atualizarEtapaProcessamento({
            etapas: resultado.etapas,

            etapa: "idempotencia",

            status: "processando",

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
            etapas: resultado.etapas,

            etapa: "idempotencia",

            status: "concluida",

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
            etapas: resultado.etapas,

            etapa:
              "contexto_agronomico",

            status: "processando",

            mensagem:
              "Executando contexto e pipeline-base.",
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
            etapas: resultado.etapas,

            etapa:
              "motor_cientifico",

            status: "processando",

            mensagem:
              "Processando Motor Científico.",
          }),
      };

      const resultadoCientifico =
        await executarMotorCientificoOrquestrado(
          evento,
        );

      resultado = {
        ...resultado,

        resultadoCientificoId:
          resultadoCientifico.resultadoId,

        etapas:
          atualizarEtapaProcessamento({
            etapas: resultado.etapas,

            etapa:
              "motor_cientifico",

            status: "concluida",

            mensagem:
              "Motor Científico concluído.",

            detalhes: {
              resultadoCientificoId:
                resultadoCientifico.resultadoId,

              totalEntidades:
                resultadoCientifico.resultado
                  .totalEntidades,

              totalEvidencias:
                resultadoCientifico.resultado
                  .totalEvidencias,

              totalHipoteses:
                resultadoCientifico.resultado
                  .totalHipoteses,

              totalDescobertas:
                resultadoCientifico.resultado
                  .totalDescobertas,
            },
          }),
      };

      resultado =
        marcarMotoresPosterioresIgnorados(
          resultado,
        );

      let etapasFinalizadas =
        atualizarEtapaProcessamento({
          etapas: resultado.etapas,

          etapa: "auditoria",

          status: "concluida",

          mensagem:
            "Auditoria persistente atualizada.",
        });

      etapasFinalizadas =
        atualizarEtapaProcessamento({
          etapas: etapasFinalizadas,

          etapa: "finalizacao",

          status: "concluida",

          mensagem:
            "OA3 finalizado.",
        });

      resultado = {
        ...resultado,

        etapas:
          etapasFinalizadas,
      };

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

          etapa: etapaAtual,

          codigo:
            "FALHA_ORQUESTRADOR_OA3",

          recuperavel: true,
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
            etapas: resultado.etapas,

            etapa: etapaAtual,

            status: "falhou",

            mensagem:
              erroNormalizado.mensagem,
          }),
      };

      resultado =
        adicionarRegistroResultado(
          resultado,
          criarRegistroProcessamento({
            processamentoId,

            etapa: etapaAtual,

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