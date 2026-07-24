import type {
  LatLng,
  Talhao,
} from "../../../features/map/types/map.types";

export type TalhaoEditorMode =
  | "visualizacao"
  | "desenho"
  | "salvando";

export type BordaduraTalhaoEditor = 4;

export type TalhaoDraft = {
  nome: string;

  coordenadas: LatLng[];

  areaHa: number;

  bordaduraPercentual:
    BordaduraTalhaoEditor;
};

export type TalhaoEditorMensagem = {
  tipo:
    | "sucesso"
    | "erro"
    | "aviso"
    | "informacao";

  texto: string;
};

export type ResultadoCriacaoTalhaoEditor = {
  sucesso: boolean;

  talhaoId?: string;

  totalUEIs?: number;

  totalGDAs?: number;

  mensagens: string[];
};

export type TalhaoMapCanvasV2Props = {
  mode: TalhaoEditorMode;

  talhoes: Talhao[];

  selectedTalhao: Talhao | null;

  coordenadasDesenho: LatLng[];

  corDesenho?: string;

  onSelectTalhao(
    talhao: Talhao | null,
  ): void;

  onChangeCoordenadas(
    coordenadas: LatLng[],
  ): void;

  onAreaCalculada(
    areaHa: number,
  ): void;
};

export type TalhaoFormV2Props = {
  draft: TalhaoDraft;

  loading: boolean;

  podeSalvar: boolean;

  mensagem: TalhaoEditorMensagem | null;

  onChangeNome(
    nome: string,
  ): void;

  onIniciarDesenho(): void;

  onDesfazerPonto(): void;

  onLimparDesenho(): void;

  onCancelar(): void;

  onSalvar(): void;
};

export const TALHAO_DRAFT_INICIAL:
  TalhaoDraft = {
    nome: "",

    coordenadas: [],

    areaHa: 0,

    bordaduraPercentual: 4,
  };

export function coordenadasTalhaoValidas(
  coordenadas: LatLng[],
): boolean {
  return (
    Array.isArray(coordenadas) &&
    coordenadas.length >= 3 &&
    coordenadas.every(
      (coordenada) =>
        Number.isFinite(
          coordenada.lat,
        ) &&
        Number.isFinite(
          coordenada.lng,
        ),
    )
  );
}

export function talhaoDraftValido(
  draft: TalhaoDraft,
): boolean {
  return Boolean(
    draft.nome.trim() &&
      coordenadasTalhaoValidas(
        draft.coordenadas,
      ) &&
      Number.isFinite(
        draft.areaHa,
      ) &&
      draft.areaHa > 0,
  );
}
