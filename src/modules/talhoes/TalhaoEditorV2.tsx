import {
  useCallback,
  useMemo,
  useState,
} from "react";

import type {
  LatLng,
  Talhao,
} from "../../features/map/types/map.types";

import {
  executarFluxoCriarTalhao,
} from "./cadastro/fluxoCriarTalhao";

import {
  TalhaoDesenhoFullscreen,
} from "./editorV2/TalhaoDesenhoFullscreen";

import {
  TalhaoFormV2,
} from "./editorV2/TalhaoFormV2";

import {
  TalhaoMapCanvasV2,
} from "./editorV2/TalhaoMapCanvasV2";

import {
  TALHAO_DRAFT_INICIAL,
  talhaoDraftValido,
} from "./editorV2/types";

import type {
  BordaduraTalhaoEditor,
  TalhaoDraft,
  TalhaoEditorMensagem,
  TalhaoEditorMode,
} from "./editorV2/types";

export interface TalhaoEditorV2Props {
  farmId: string;

  producerId: string | null;

  userRole: string;

  talhoes: Talhao[];

  selectedTalhao: Talhao | null;

  onSelectTalhao(
    talhao: Talhao | null,
  ): void;
}

function copiarDraftInicial(): TalhaoDraft {
  return {
    ...TALHAO_DRAFT_INICIAL,
    coordenadas: [],
  };
}

function mensagemErro(
  error: unknown,
): string {
  if (
    error instanceof Error &&
    error.message.trim()
  ) {
    return error.message;
  }

  return "Não foi possível criar o talhão.";
}

export function TalhaoEditorV2({
  farmId,
  producerId,
  userRole,
  talhoes,
  selectedTalhao,
  onSelectTalhao,
}: TalhaoEditorV2Props) {
  const [mode, setMode] =
    useState<TalhaoEditorMode>(
      "visualizacao",
    );

  const [draft, setDraft] =
    useState<TalhaoDraft>(
      copiarDraftInicial,
    );

  const [mensagem, setMensagem] =
    useState<TalhaoEditorMensagem | null>(
      null,
    );

  const [
    desenhoTelaCheia,
    setDesenhoTelaCheia,
  ] = useState(false);

  const podeGerenciar =
    userRole === "produtor" ||
    userRole === "admin" ||
    userRole === "gerente" ||
    userRole === "system_admin";

  const producerIdNormalizado =
    producerId?.trim() ?? "";

  const loading =
    mode === "salvando";

  const podeSalvar =
    podeGerenciar &&
    Boolean(producerIdNormalizado) &&
    talhaoDraftValido(draft);

  const atualizarNome =
    useCallback((nome: string) => {
      setDraft((atual) => ({
        ...atual,
        nome,
      }));

      setMensagem(null);
    }, []);

  const atualizarBordadura =
    useCallback(
      (
        bordaduraPercentual:
          BordaduraTalhaoEditor,
      ) => {
        setDraft((atual) => ({
          ...atual,
          bordaduraPercentual,
        }));

        setMensagem(null);
      },
      [],
    );

  const atualizarCoordenadas =
    useCallback(
      (
        coordenadas: LatLng[],
      ) => {
        setDraft((atual) => ({
          ...atual,
          coordenadas,
        }));

        setMensagem(null);
      },
      [],
    );

  const atualizarArea =
    useCallback((areaHa: number) => {
      setDraft((atual) => {
        if (
          atual.areaHa === areaHa
        ) {
          return atual;
        }

        return {
          ...atual,
          areaHa,
        };
      });
    }, []);

  const iniciarDesenho =
    useCallback(() => {
      if (!podeGerenciar) {
        setMensagem({
          tipo: "erro",
          texto:
            "Seu perfil não possui permissão para criar talhões.",
        });

        return;
      }

      if (!producerIdNormalizado) {
        setMensagem({
          tipo: "erro",
          texto:
            "Não foi possível identificar o produtor responsável pela fazenda.",
        });

        return;
      }

      setMode("desenho");
      setDesenhoTelaCheia(true);

      setMensagem({
        tipo: "informacao",
        texto:
          "Clique no mapa para adicionar os vértices do talhão.",
      });

      onSelectTalhao(null);
    }, [
      onSelectTalhao,
      podeGerenciar,
      producerIdNormalizado,
    ]);

  const desfazerPonto =
    useCallback(() => {
      setDraft((atual) => ({
        ...atual,

        coordenadas:
          atual.coordenadas.slice(
            0,
            -1,
          ),
      }));

      setMensagem(null);
    }, []);

  const limparDesenho =
    useCallback(() => {
      setDraft((atual) => ({
        ...atual,
        coordenadas: [],
        areaHa: 0,
      }));

      setMensagem(null);
    }, []);

  const cancelar =
    useCallback(() => {
      setDesenhoTelaCheia(false);

      setDraft(
        copiarDraftInicial(),
      );

      setMode("visualizacao");
      setMensagem(null);
    }, []);

  const avancarParaDados =
    useCallback(() => {
      if (
        draft.coordenadas.length < 3 ||
        draft.areaHa <= 0
      ) {
        setMensagem({
          tipo: "aviso",
          texto:
            "Marque pelo menos três pontos para formar um limite válido.",
        });

        return;
      }

      setDesenhoTelaCheia(false);
      setMode("visualizacao");

      setMensagem({
        tipo: "informacao",
        texto:
          "Limite definido. Agora informe o nome e a bordadura do talhão.",
      });
    }, [
      draft.areaHa,
      draft.coordenadas.length,
    ]);

  const salvar =
    useCallback(async () => {
      if (!podeGerenciar) {
        setMensagem({
          tipo: "erro",
          texto:
            "Seu perfil não possui permissão para criar talhões.",
        });

        return;
      }

      const producerIdValido: string =
        producerId?.trim() ?? "";

      if (!producerIdValido) {
        setMensagem({
          tipo: "erro",
          texto:
            "O producerId da fazenda não foi localizado.",
        });

        return;
      }

      if (!talhaoDraftValido(draft)) {
        setMensagem({
          tipo: "aviso",
          texto:
            "Informe o nome e desenhe um polígono válido com pelo menos três pontos.",
        });

        return;
      }

      setMode("salvando");

      setMensagem({
        tipo: "informacao",
        texto:
          "Criando o talhão e sua estrutura agronômica...",
      });

      try {
        const resultado =
          await executarFluxoCriarTalhao({
            farmId,

            producerId:
              producerIdValido,

            nome:
              draft.nome.trim(),

            coordenadas:
              draft.coordenadas,

            areaHa:
              draft.areaHa,

            bordaduraPercentual:
              draft.bordaduraPercentual,
          });

        if (
          !resultado.sucesso ||
          !resultado.talhao
        ) {
          setMode("visualizacao");

          setMensagem({
            tipo: "erro",

            texto:
              resultado.mensagens.join(
                " ",
              ) ||
              "Não foi possível criar o talhão.",
          });

          return;
        }

        const totalUEIs =
          resultado.ueis?.totalUEIs ??
          0;

        const totalGDAs =
          resultado.ueis?.totalGDAs ??
          0;

        setDraft(
          copiarDraftInicial(),
        );

        setMode("visualizacao");

        onSelectTalhao(
          resultado.talhao,
        );

        setMensagem({
          tipo: "sucesso",

          texto:
            `Talhão criado e selecionado com sucesso. ` +
            `${totalUEIs} UEIs e ${totalGDAs} GDAs foram gerados.`,
        });
      } catch (error) {
        console.error(
          "Erro ao criar talhão no Editor V2:",
          error,
        );

        setMode("visualizacao");

        setMensagem({
          tipo: "erro",
          texto:
            mensagemErro(error),
        });
      }
    }, [
      draft,
      farmId,
      onSelectTalhao,
      podeGerenciar,
      producerId,
    ]);

  const descricaoPermissao =
    useMemo(() => {
      if (podeGerenciar) {
        return null;
      }

      return {
        tipo: "aviso" as const,

        texto:
          "Seu perfil possui acesso de visualização, mas não pode cadastrar novos talhões.",
      };
    }, [podeGerenciar]);

  const mensagemExibida =
    mensagem ??
    descricaoPermissao;

  return (
    <>
      <section className="space-y-5">
        <div className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-slate-900">
                Editor de Talhões V2
              </h2>

              <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                Pipeline científico
              </span>
            </div>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
              O limite original gera automaticamente a área operacional, as UEIs georreferenciadas e seus GDAs.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="font-black uppercase tracking-widest text-slate-400">
                Talhões
              </p>

              <p className="mt-1 text-lg font-black text-slate-800">
                {talhoes.length}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="font-black uppercase tracking-widest text-slate-400">
                Bordadura
              </p>

              <p className="mt-1 text-lg font-black text-slate-800">
                {draft.bordaduraPercentual}%
              </p>
            </div>

            <div className="col-span-2 rounded-xl bg-emerald-50 px-4 py-3 sm:col-span-1">
              <p className="font-black uppercase tracking-widest text-emerald-600">
                Área
              </p>

              <p className="mt-1 text-lg font-black text-emerald-800">
                {draft.areaHa.toFixed(2)} ha
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <TalhaoFormV2
              draft={draft}
              loading={loading}
              podeSalvar={podeSalvar}
              mensagem={
                mensagemExibida
              }
              onChangeNome={
                atualizarNome
              }
              onChangeBordadura={
                atualizarBordadura
              }
              onIniciarDesenho={
                iniciarDesenho
              }
              onDesfazerPonto={
                desfazerPonto
              }
              onLimparDesenho={
                limparDesenho
              }
              onCancelar={cancelar}
              onSalvar={salvar}
            />
          </div>

          <div className="lg:col-span-8">
            <TalhaoMapCanvasV2
              mode={mode}
              talhoes={talhoes}
              selectedTalhao={
                selectedTalhao
              }
              coordenadasDesenho={
                draft.coordenadas
              }
              onSelectTalhao={
                onSelectTalhao
              }
              onChangeCoordenadas={
                atualizarCoordenadas
              }
              onAreaCalculada={
                atualizarArea
              }
            />
          </div>
        </div>
      </section>

      {desenhoTelaCheia && (
        <TalhaoDesenhoFullscreen
          talhoes={talhoes}
          coordenadas={
            draft.coordenadas
          }
          areaHa={draft.areaHa}
          onChangeCoordenadas={
            atualizarCoordenadas
          }
          onAreaCalculada={
            atualizarArea
          }
          onDesfazer={
            desfazerPonto
          }
          onLimpar={
            limparDesenho
          }
          onCancelar={cancelar}
          onAvancar={
            avancarParaDados
          }
        />
      )}
    </>
  );
}