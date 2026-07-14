import { adicionarAlertasResultado } from "./adicionarAlertaResultado";
import { adicionarRegistroResultado } from "./adicionarRegistroResultado";
import { atualizarEtapaProcessamento } from "./atualizarEtapaProcessamento";
import { concluirEtapasPipelineBase } from "./concluirEtapasPipelineBase";
import { criarRegistroProcessamento } from "./criarRegistroProcessamento";
import { criarResultadoDeRegistroExistente } from "./criarResultadoDeRegistroExistente";
import { criarResultadoInicial } from "./criarResultadoInicial";
import { deveProcessarMotor } from "./deveProcessarMotor";
import { executarEtapaProtegida } from "./executarEtapaProtegida";
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
import { marcarEtapaPorDependencia } from "./marcarEtapaPorDependencia";
import { reservarChaveIdempotencia } from "./reservarChaveIdempotencia";
import { salvarAuditoriaSemInterromper } from "./salvarAuditoriaProcessamento";
import { salvarCheckpointSemInterromper } from "./salvarCheckpointProcessamento";
import { validarEntradaOrquestrador } from "./validarEntradaOrquestrador";

import type {
  EntradaOrquestradorAgronomico,
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

    resultado = {
      ...resultado,

      status:
        "validando",

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

      ultimaEtapaConcluida:
        "recepcao",
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
            "Evento recebido para processamento agronômico resiliente.",
        }),
      );

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
      resultado = {
        ...resultado,

        status:
          "falhou",

        etapaComFalha:
          "validacao",

        etapas:
          atualizarEtapaProcessamento({
            etapas:
              resultado.etapas,

            etapa:
              "validacao",

            status:
              "falhou",

            mensagem:
              validacao.erros.join(
                " ",
              ),
          }),
      };

      resultado =
        finalizarResultadoProcessamento({
          resultado,

          status:
            "falhou",
        });

      await salvarAuditoriaSemInterromper(
        entrada,
        resultado,
      );

      return resultado;
    }

    resultado = {
      ...resultado,

      status:
        "processando",

      ultimaEtapaConcluida:
        "validacao",

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
        }),
    };

    await salvarCheckpointSemInterromper(
      entrada,
      resultado,
    );

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

      ultimaEtapaConcluida:
        "idempotencia",

      etapas:
        atualizarEtapaProcessamento({
          etapas:
            resultado.etapas,

          etapa:
            "idempotencia",

          status:
            "concluida",

          mensagem:
            "Chave de idempotência reservada.",

          detalhes: {
            motivo:
              reserva.motivo,

            tentativas:
              reserva.registro.tentativas,
          },
        }),
    };

    await salvarCheckpointSemInterromper(
      entrada,
      resultado,
    );

    const etapaBase =
      await executarEtapaProtegida({
        resultado,

        etapa:
          "contexto_agronomico",

        obrigatoriedade:
          "obrigatoria",

        mensagemInicio:
          "Resolvendo contexto e registrando Evento Agronômico.",

        mensagemSucesso:
          "Contexto, Evento Agronômico e Timeline processados.",

        codigoSucesso:
          "PIPELINE_BASE_CONCLUIDO",

        codigoErro:
          "FALHA_PIPELINE_BASE",

        operacao: () =>
          executarPipelineBaseEvento(
            entrada,
          ),

        aplicarResultado: (
          resultadoAtual,
          evento,
        ) => ({
          ...resultadoAtual,

          evento,

          eventoAgronomicoId:
            evento.id,
        }),

        detalhesSucesso: (
          evento,
        ) => ({
          eventoAgronomicoId:
            evento.id,

          talhaoId:
            evento.talhaoId,

          ueiIds:
            evento.ueiIds,

          gdaIds:
            evento.gdaIds,
        }),
      });

    resultado =
      etapaBase.resultado;

    if (
      etapaBase.interromper ||
      !etapaBase.valor
    ) {
      resultado =
        finalizarResultadoProcessamento({
          resultado,

          status:
            "falhou",
        });

      await salvarAuditoriaSemInterromper(
        entrada,
        resultado,
      );

      await finalizarRegistroIdempotencia(
        resultado,
      );

      return resultado;
    }

    const evento =
      etapaBase.valor;

    resultado =
      concluirEtapasPipelineBase(
        resultado,
      );

    resultado = {
      ...resultado,

      ultimaEtapaConcluida:
        "timeline",
    };

    await salvarCheckpointSemInterromper(
      entrada,
      resultado,
    );

    const contextoMotores =
      extrairContextoMotores(
        entrada,
        evento,
      );

    const etapaCientifica =
      await executarEtapaProtegida({
        resultado,

        etapa:
          "motor_cientifico",

        obrigatoriedade:
          "opcional",

        mensagemInicio:
          "Processando Motor Científico.",

        mensagemSucesso:
          "Motor Científico concluído.",

        codigoSucesso:
          "MOTOR_CIENTIFICO_CONCLUIDO",

        codigoErro:
          "FALHA_MOTOR_CIENTIFICO",

        operacao: () =>
          executarMotorCientificoOrquestrado(
            evento,
          ),

        aplicarResultado: (
          resultadoAtual,
          cientifico,
        ) => ({
          ...resultadoAtual,

          resultadoCientificoId:
            cientifico.resultadoId,
        }),

        detalhesSucesso: (
          cientifico,
        ) => ({
          resultadoCientificoId:
            cientifico.resultadoId,

          totalEvidencias:
            cientifico.resultado
              .totalEvidencias,

          totalHipoteses:
            cientifico.resultado
              .totalHipoteses,
        }),
      });

    resultado =
      etapaCientifica.resultado;

    await salvarCheckpointSemInterromper(
      entrada,
      resultado,
    );

    let estatistico:
      Awaited<
        ReturnType<
          typeof executarMotorEstatisticoOrquestrado
        >
      > | undefined;

    if (
      deveProcessarMotor(
        entrada,
        "estatistica",
      )
    ) {
      const etapaEstatistica =
        await executarEtapaProtegida({
          resultado,

          etapa:
            "motor_estatistico",

          obrigatoriedade:
            "opcional",

          mensagemInicio:
            "Processando Motor Estatístico.",

          mensagemSucesso:
            "Motor Estatístico concluído.",

          codigoSucesso:
            "MOTOR_ESTATISTICO_CONCLUIDO",

          codigoErro:
            "FALHA_MOTOR_ESTATISTICO",

          operacao: () =>
            executarMotorEstatisticoOrquestrado(
              evento,
              contextoMotores,
            ),

          aplicarResultado: (
            resultadoAtual,
            valor,
          ) => ({
            ...resultadoAtual,

            resultadoEstatisticoId:
              valor.resultadoId,
          }),

          detalhesSucesso: (
            valor,
          ) => ({
            resultadoEstatisticoId:
              valor.resultadoId,

            totalAmostras:
              valor.resultado
                .totalAmostras,
          }),
        });

      resultado =
        etapaEstatistica.resultado;

      estatistico =
        etapaEstatistica.valor;
    } else {
      resultado =
        marcarEtapaIgnorada(
          resultado,
          "motor_estatistico",
          "Motor Estatístico desativado.",
        );
    }

    await salvarCheckpointSemInterromper(
      entrada,
      resultado,
    );

    let aprendizagem:
      Awaited<
        ReturnType<
          typeof executarMotorAprendizagemOrquestrado
        >
      > | undefined;

    if (!etapaCientifica.valor) {
      resultado =
        marcarEtapaPorDependencia(
          resultado,
          "motor_aprendizagem",
          "motor_cientifico",
        );
    } else if (
      deveProcessarMotor(
        entrada,
        "aprendizado",
      )
    ) {
      const etapaAprendizagem =
        await executarEtapaProtegida({
          resultado,

          etapa:
            "motor_aprendizagem",

          obrigatoriedade:
            "opcional",

          mensagemInicio:
            "Processando Motor de Aprendizagem.",

          mensagemSucesso:
            "Motor de Aprendizagem concluído.",

          codigoSucesso:
            "MOTOR_APRENDIZAGEM_CONCLUIDO",

          codigoErro:
            "FALHA_MOTOR_APRENDIZAGEM",

          operacao: () =>
            executarMotorAprendizagemOrquestrado({
              resultadoCientifico:
                etapaCientifica.valor!
                  .resultado,

              resultadoEstatistico:
                estatistico?.resultado,

              contexto:
                contextoMotores,
            }),

          aplicarResultado: (
            resultadoAtual,
            valor,
          ) => ({
            ...resultadoAtual,

            aprendizadoIds:
              valor.aprendizadoIds,
          }),

          detalhesSucesso: (
            valor,
          ) => ({
            totalAprendizados:
              valor.resultado
                .totalAprendizados,

            totalFortes:
              valor.resultado
                .totalFortes,
          }),
        });

      resultado =
        etapaAprendizagem.resultado;

      aprendizagem =
        etapaAprendizagem.valor;
    } else {
      resultado =
        marcarEtapaIgnorada(
          resultado,
          "motor_aprendizagem",
          "Motor de Aprendizagem desativado.",
        );
    }

    await salvarCheckpointSemInterromper(
      entrada,
      resultado,
    );

    let conhecimento:
      Awaited<
        ReturnType<
          typeof executarMotorConhecimentoOrquestrado
        >
      > | undefined;

    if (!aprendizagem) {
      resultado =
        marcarEtapaPorDependencia(
          resultado,
          "motor_conhecimento",
          "motor_aprendizagem",
        );
    } else if (
      deveProcessarMotor(
        entrada,
        "conhecimento",
      )
    ) {
      const etapaConhecimento =
        await executarEtapaProtegida({
          resultado,

          etapa:
            "motor_conhecimento",

          obrigatoriedade:
            "opcional",

          mensagemInicio:
            "Processando Motor de Conhecimento.",

          mensagemSucesso:
            "Motor de Conhecimento concluído.",

          codigoSucesso:
            "MOTOR_CONHECIMENTO_CONCLUIDO",

          codigoErro:
            "FALHA_MOTOR_CONHECIMENTO",

          operacao: () =>
            executarMotorConhecimentoOrquestrado(
              aprendizagem!.resultado,
            ),

          aplicarResultado: (
            resultadoAtual,
            valor,
          ) => ({
            ...resultadoAtual,

            conhecimentoIds:
              valor.conhecimentoIds,
          }),

          detalhesSucesso: (
            valor,
          ) => ({
            totalConsolidados:
              valor.resultado
                .totalConsolidados,

            totalMaduros:
              valor.resultado
                .totalMaduros,
          }),
        });

      resultado =
        etapaConhecimento.resultado;

      conhecimento =
        etapaConhecimento.valor;
    } else {
      resultado =
        marcarEtapaIgnorada(
          resultado,
          "motor_conhecimento",
          "Motor de Conhecimento desativado.",
        );
    }

    await salvarCheckpointSemInterromper(
      entrada,
      resultado,
    );

    if (!conhecimento) {
      resultado =
        marcarEtapaPorDependencia(
          resultado,
          "motor_recomendacao",
          "motor_conhecimento",
        );
    } else if (
      deveProcessarMotor(
        entrada,
        "recomendacao",
      )
    ) {
      const etapaRecomendacao =
        await executarEtapaProtegida({
          resultado,

          etapa:
            "motor_recomendacao",

          obrigatoriedade:
            "opcional",

          mensagemInicio:
            "Processando Motor de Recomendação.",

          mensagemSucesso:
            "Motor de Recomendação concluído.",

          codigoSucesso:
            "MOTOR_RECOMENDACAO_CONCLUIDO",

          codigoErro:
            "FALHA_MOTOR_RECOMENDACAO",

          operacao: () =>
            executarMotorRecomendacaoOrquestrado({
              conhecimentos:
                conhecimento!.resultado
                  .conhecimentos,

              contexto:
                contextoMotores,
            }),

          aplicarResultado: (
            resultadoAtual,
            valor,
          ) => ({
            ...resultadoAtual,

            recomendacaoIds:
              valor.recomendacaoIds,
          }),

          detalhesSucesso: (
            valor,
          ) => ({
            totalRecomendacoes:
              valor.resultado
                .totalRecomendacoes,

            totalImpedidas:
              valor.resultado
                .totalImpedidas,
          }),
        });

      resultado =
        etapaRecomendacao.resultado;
    } else {
      resultado =
        marcarEtapaIgnorada(
          resultado,
          "motor_recomendacao",
          "Motor de Recomendação desativado.",
        );
    }

    resultado = {
      ...resultado,

      etapas:
        atualizarEtapaProcessamento({
          etapas:
            resultado.etapas,

          etapa:
            "auditoria",

          status:
            "concluida",

          mensagem:
            "Auditoria e checkpoints atualizados.",
        }),
    };

    resultado = {
      ...resultado,

      etapas:
        atualizarEtapaProcessamento({
          etapas:
            resultado.etapas,

          etapa:
            "finalizacao",

          status:
            "concluida",

          mensagem:
            "OA5 finalizado com resiliência por etapa.",
        }),

      ultimaEtapaConcluida:
        "finalizacao",
    };

    resultado =
      finalizarResultadoProcessamento({
        resultado,
      });

    await salvarCheckpointSemInterromper(
      entrada,
      resultado,
    );

    await salvarAuditoriaSemInterromper(
      entrada,
      resultado,
    );

    await finalizarRegistroIdempotencia(
      resultado,
    );

    return resultado;
  }
}