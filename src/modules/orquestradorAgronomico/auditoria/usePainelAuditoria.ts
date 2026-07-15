import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { buscarAuditoriaDetalhada } from "./buscarAuditoriaDetalhada";
import { buscarProcessamentosAuditoria } from "./buscarProcessamentosAuditoria";
import { resumirPainelAuditoria } from "./resumirPainelAuditoria";

import type {
  AuditoriaProcessamentoDetalhada,
  FiltroPainelAuditoria,
  ProcessamentoAuditoriaResumo,
} from "./typesPainelAuditoria";

export function usePainelAuditoria(
  filtro: FiltroPainelAuditoria,
) {
  const [
    processamentos,
    setProcessamentos,
  ] = useState<
    ProcessamentoAuditoriaResumo[]
  >([]);

  const [
    auditoriaSelecionada,
    setAuditoriaSelecionada,
  ] = useState<
    AuditoriaProcessamentoDetalhada | null
  >(null);

  const [
    carregando,
    setCarregando,
  ] = useState(false);

  const [
    carregandoDetalhes,
    setCarregandoDetalhes,
  ] = useState(false);

  const [
    erro,
    setErro,
  ] = useState<string | null>(
    null,
  );

  const carregar = useCallback(
    async () => {
      if (!filtro.farmId) {
        setProcessamentos([]);
        return;
      }

      setCarregando(true);
      setErro(null);

      try {
        const dados =
          await buscarProcessamentosAuditoria(
            filtro,
          );

        setProcessamentos(
          dados,
        );
      } catch (falha) {
        const mensagem =
          falha instanceof Error
            ? falha.message
            : "Não foi possível carregar os processamentos.";

        setErro(mensagem);
      } finally {
        setCarregando(false);
      }
    },
    [
      filtro.farmId,
      filtro.status,
      filtro.tipoEvento,
      filtro.talhaoId,
      filtro.limite,
    ],
  );

  const selecionarProcessamento =
    useCallback(
      async (
        processamentoId: string,
      ) => {
        setCarregandoDetalhes(
          true,
        );

        setErro(null);

        try {
          const auditoria =
            await buscarAuditoriaDetalhada(
              processamentoId,
            );

          setAuditoriaSelecionada(
            auditoria,
          );
        } catch (falha) {
          const mensagem =
            falha instanceof Error
              ? falha.message
              : "Não foi possível carregar a auditoria detalhada.";

          setErro(mensagem);
        } finally {
          setCarregandoDetalhes(
            false,
          );
        }
      },
      [],
    );

  const limparSelecao =
    useCallback(() => {
      setAuditoriaSelecionada(
        null,
      );
    }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const resumo = useMemo(
    () =>
      resumirPainelAuditoria(
        processamentos,
      ),
    [processamentos],
  );

  return {
    processamentos,

    resumo,

    auditoriaSelecionada,

    carregando,

    carregandoDetalhes,

    erro,

    carregar,

    selecionarProcessamento,

    limparSelecao,
  };
}