import { adicionarAlertaResultado } from "./adicionarAlertaResultado";
import { adicionarErroResultado } from "./adicionarErroResultado";
import { adicionarRegistroResultado } from "./adicionarRegistroResultado";
import { atualizarEtapaProcessamento } from "./atualizarEtapaProcessamento";
import { criarRegistroProcessamento } from "./criarRegistroProcessamento";
import { normalizarErroProcessamento } from "./normalizarErroProcessamento";

import type {
  NomeEtapaAgronomica,
  ObrigatoriedadeEtapa,
  ResultadoOrquestradorAgronomico,
} from "./types";

export type ResultadoEtapaProtegida<T> = {
  resultado:
    ResultadoOrquestradorAgronomico;

  sucesso: boolean;

  interromper: boolean;

  valor?: T;
};

type ExecutarEtapaProtegidaParams<T> = {
  resultado:
    ResultadoOrquestradorAgronomico;

  etapa:
    NomeEtapaAgronomica;

  obrigatoriedade:
    ObrigatoriedadeEtapa;

  mensagemInicio: string;

  mensagemSucesso: string;

  codigoSucesso: string;

  codigoErro: string;

  operacao: () => Promise<T>;

  detalhesSucesso?: (
    valor: T,
  ) => Record<string, unknown>;

  aplicarResultado?: (
    resultado:
      ResultadoOrquestradorAgronomico,
    valor: T,
  ) => ResultadoOrquestradorAgronomico;
};

function incrementarTentativaEtapa(
  resultado:
    ResultadoOrquestradorAgronomico,
  etapa:
    NomeEtapaAgronomica,
): ResultadoOrquestradorAgronomico {
  return {
    ...resultado,

    etapas:
      resultado.etapas.map(
        (registro) =>
          registro.etapa === etapa
            ? {
                ...registro,

                tentativas:
                  (
                    registro.tentativas ??
                    0
                  ) + 1,
              }
            : registro,
      ),
  };
}

export async function executarEtapaProtegida<T>({
  resultado: resultadoInicial,
  etapa,
  obrigatoriedade,
  mensagemInicio,
  mensagemSucesso,
  codigoSucesso,
  codigoErro,
  operacao,
  detalhesSucesso,
  aplicarResultado,
}: ExecutarEtapaProtegidaParams<T>): Promise<
  ResultadoEtapaProtegida<T>
> {
  let resultado =
    incrementarTentativaEtapa(
      resultadoInicial,
      etapa,
    );

  resultado = {
    ...resultado,

    etapas:
      atualizarEtapaProcessamento({
        etapas:
          resultado.etapas,

        etapa,

        status:
          "processando",

        mensagem:
          mensagemInicio,
      }),
  };

  try {
    const valor =
      await operacao();

    if (aplicarResultado) {
      resultado =
        aplicarResultado(
          resultado,
          valor,
        );
    }

    resultado = {
      ...resultado,

      ultimaEtapaConcluida:
        etapa,

      etapaComFalha:
        resultado.etapaComFalha ===
        etapa
          ? undefined
          : resultado.etapaComFalha,

      etapas:
        atualizarEtapaProcessamento({
          etapas:
            resultado.etapas,

          etapa,

          status:
            "concluida",

          mensagem:
            mensagemSucesso,

          detalhes:
            detalhesSucesso?.(
              valor,
            ),
        }),
    };

    resultado =
      adicionarRegistroResultado(
        resultado,
        criarRegistroProcessamento({
          processamentoId:
            resultado.processamentoId,

          etapa,

          codigo:
            codigoSucesso,

          mensagem:
            mensagemSucesso,

          detalhes:
            detalhesSucesso?.(
              valor,
            ),
        }),
      );

    return {
      resultado,

      sucesso:
        true,

      interromper:
        false,

      valor,
    };
  } catch (erro) {
    const erroNormalizado =
      normalizarErroProcessamento({
        erro,

        etapa,

        codigo:
          codigoErro,

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

      etapaComFalha:
        etapa,

      status:
        obrigatoriedade ===
        "obrigatoria"
          ? "falhou"
          : "processado_com_alertas",

      etapas:
        atualizarEtapaProcessamento({
          etapas:
            resultado.etapas,

          etapa,

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
          processamentoId:
            resultado.processamentoId,

          etapa,

          severidade:
            obrigatoriedade ===
            "obrigatoria"
              ? "erro"
              : "alerta",

          codigo:
            erroNormalizado.codigo,

          mensagem:
            erroNormalizado.mensagem,
        }),
      );

    if (
      obrigatoriedade ===
      "opcional"
    ) {
      resultado =
        adicionarAlertaResultado(
          resultado,
          `A etapa ${etapa} falhou, mas o dado agronômico já registrado foi preservado.`,
        );
    }

    return {
      resultado,

      sucesso:
        false,

      interromper:
        obrigatoriedade ===
        "obrigatoria",
    };
  }
}