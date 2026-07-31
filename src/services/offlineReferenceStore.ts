import type {
  Equipamento,
  Fazenda,
  ProdutoEstoque,
  Talhao,
  Usuario,
} from "../types";
import type { UEIEspacial } from "../modules/motorEspacial/types";

const STORAGE_KEY = "eqtara_offline_reference_store_v1";

export const OFFLINE_REFERENCE_STORE_EVENT =
  "eqtara:offline-reference-store-changed";

type FarmReferenceMap<T> = Record<string, T[]>;

interface OfflineReferenceState {
  usuarios: Record<string, Usuario>;
  fazendasPorUsuario: FarmReferenceMap<Fazenda>;
  talhoesPorFazenda: FarmReferenceMap<Talhao>;
  equipamentosPorFazenda: FarmReferenceMap<Equipamento>;
  produtosPorFazenda: FarmReferenceMap<ProdutoEstoque>;
  ueisPorFazenda: FarmReferenceMap<UEIEspacial>;
  atualizadoEmPorFazenda: Record<string, string>;
}

export interface OfflineReferenceSummary {
  farmId: string;
  talhoes: number;
  equipamentos: number;
  produtos: number;
  ueis: number;
  atualizadoEm?: Date;
  prontoParaOperacao: boolean;
}

function emptyState(): OfflineReferenceState {
  return {
    usuarios: {},
    fazendasPorUsuario: {},
    talhoesPorFazenda: {},
    equipamentosPorFazenda: {},
    produtosPorFazenda: {},
    ueisPorFazenda: {},
    atualizadoEmPorFazenda: {},
  };
}

function parseDate(value: unknown): Date | undefined {
  if (value instanceof Date) {
    return value;
  }

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    const parsed = new Date(value);

    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return undefined;
}

function hydrateUsuario(usuario: Usuario): Usuario {
  return {
    ...usuario,
    createdAt:
      parseDate(usuario.createdAt)?.toISOString() ||
      usuario.createdAt,
    updatedAt:
      parseDate(usuario.updatedAt)?.toISOString() ||
      usuario.updatedAt,
  };
}

function hydrateFazenda(fazenda: Fazenda): Fazenda {
  return {
    ...fazenda,
    createdAt:
      parseDate(fazenda.createdAt)?.toISOString() ||
      fazenda.createdAt,
    updatedAt:
      parseDate(fazenda.updatedAt)?.toISOString() ||
      fazenda.updatedAt,
  };
}

function hydrateTalhao(talhao: Talhao): Talhao {
  return {
    ...talhao,
    coordenadas: Array.isArray(talhao.coordenadas)
      ? talhao.coordenadas
      : [],
    createdAt:
      parseDate(talhao.createdAt) ||
      talhao.createdAt,
    updatedAt:
      parseDate(talhao.updatedAt) ||
      talhao.updatedAt,
  };
}

function hydrateEquipamento(
  equipamento: Equipamento,
): Equipamento {
  return {
    ...equipamento,
    createdAt:
      parseDate(equipamento.createdAt) ||
      equipamento.createdAt,
  };
}

function hydrateProduto(
  produto: ProdutoEstoque,
): ProdutoEstoque {
  return {
    ...produto,
    createdAt:
      parseDate(produto.createdAt) ||
      produto.createdAt,
    updatedAt:
      parseDate(produto.updatedAt) ||
      produto.updatedAt,
  };
}

function readState(): OfflineReferenceState {
  if (typeof localStorage === "undefined") {
    return emptyState();
  }

  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return emptyState();
  }

  try {
    const parsed = JSON.parse(
      raw,
    ) as Partial<OfflineReferenceState>;

    return {
      usuarios: Object.fromEntries(
        Object.entries(parsed.usuarios || {}).map(
          ([id, usuario]) => [
            id,
            hydrateUsuario(usuario),
          ],
        ),
      ),
      fazendasPorUsuario: Object.fromEntries(
        Object.entries(
          parsed.fazendasPorUsuario || {},
        ).map(([userId, fazendas]) => [
          userId,
          (fazendas || []).map(hydrateFazenda),
        ]),
      ),
      talhoesPorFazenda: Object.fromEntries(
        Object.entries(
          parsed.talhoesPorFazenda || {},
        ).map(([farmId, talhoes]) => [
          farmId,
          (talhoes || []).map(hydrateTalhao),
        ]),
      ),
      equipamentosPorFazenda:
        Object.fromEntries(
          Object.entries(
            parsed.equipamentosPorFazenda || {},
          ).map(([farmId, equipamentos]) => [
            farmId,
            (equipamentos || []).map(
              hydrateEquipamento,
            ),
          ]),
        ),
      produtosPorFazenda: Object.fromEntries(
        Object.entries(
          parsed.produtosPorFazenda || {},
        ).map(([farmId, produtos]) => [
          farmId,
          (produtos || []).map(hydrateProduto),
        ]),
      ),
      ueisPorFazenda: {
        ...(parsed.ueisPorFazenda || {}),
      },
      atualizadoEmPorFazenda: {
        ...(parsed.atualizadoEmPorFazenda || {}),
      },
    };
  } catch (error) {
    console.error(
      "Não foi possível ler as referências offline.",
      error,
    );

    return emptyState();
  }
}

function notifyChanged() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(OFFLINE_REFERENCE_STORE_EVENT),
  );
}

function writeState(state: OfflineReferenceState) {
  if (typeof localStorage === "undefined") {
    return;
  }

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state),
    );
    notifyChanged();
  } catch (error) {
    console.error(
      "Espaço insuficiente para atualizar as referências offline.",
      error,
    );
  }
}

function markFarmUpdated(
  state: OfflineReferenceState,
  farmId: string,
) {
  state.atualizadoEmPorFazenda[farmId] =
    new Date().toISOString();
}

export function cacheUsuarioProfile(usuario: Usuario) {
  const state = readState();
  state.usuarios[usuario.id] =
    hydrateUsuario(usuario);
  writeState(state);
}

export function getCachedUsuarioProfile(
  userId: string,
): Usuario | null {
  const usuario = readState().usuarios[userId];
  return usuario ? hydrateUsuario(usuario) : null;
}

export function cacheFazendas(
  userId: string,
  fazendas: Fazenda[],
) {
  const state = readState();
  state.fazendasPorUsuario[userId] =
    fazendas.map(hydrateFazenda);
  writeState(state);
}

export function getCachedFazendas(
  userId: string,
): Fazenda[] {
  return (
    readState().fazendasPorUsuario[userId] || []
  ).map(hydrateFazenda);
}

export function cacheTalhoes(
  farmId: string,
  talhoes: Talhao[],
) {
  const state = readState();
  state.talhoesPorFazenda[farmId] =
    talhoes.map(hydrateTalhao);
  markFarmUpdated(state, farmId);
  writeState(state);
}

export function getCachedTalhoes(
  farmId: string,
): Talhao[] {
  return (
    readState().talhoesPorFazenda[farmId] || []
  ).map(hydrateTalhao);
}

export function cacheEquipamentos(
  farmId: string,
  equipamentos: Equipamento[],
) {
  const state = readState();
  state.equipamentosPorFazenda[farmId] =
    equipamentos.map(hydrateEquipamento);
  markFarmUpdated(state, farmId);
  writeState(state);
}

export function getCachedEquipamentos(
  farmId: string,
): Equipamento[] {
  return (
    readState().equipamentosPorFazenda[farmId] ||
    []
  ).map(hydrateEquipamento);
}

export function cacheProdutos(
  farmId: string,
  produtos: ProdutoEstoque[],
) {
  const state = readState();
  state.produtosPorFazenda[farmId] =
    produtos.map(hydrateProduto);
  markFarmUpdated(state, farmId);
  writeState(state);
}

export function getCachedProdutos(
  farmId: string,
): ProdutoEstoque[] {
  return (
    readState().produtosPorFazenda[farmId] || []
  ).map(hydrateProduto);
}

export function cacheUEIs(
  farmId: string,
  ueis: UEIEspacial[],
) {
  const state = readState();
  state.ueisPorFazenda[farmId] = ueis;
  markFarmUpdated(state, farmId);
  writeState(state);
}

export function getCachedUEIs(
  farmId: string,
  talhaoId?: string,
): UEIEspacial[] {
  return (
    readState().ueisPorFazenda[farmId] || []
  ).filter(
    (uei) =>
      !talhaoId || uei.talhaoId === talhaoId,
  );
}

export function getOfflineReferenceSummary(
  farmId: string,
): OfflineReferenceSummary {
  const state = readState();
  const atualizadoEm = parseDate(
    state.atualizadoEmPorFazenda[farmId],
  );
  const talhoes =
    state.talhoesPorFazenda[farmId]?.length || 0;
  const equipamentos =
    state.equipamentosPorFazenda[farmId]?.length ||
    0;
  const produtos =
    state.produtosPorFazenda[farmId]?.length || 0;
  const ueis =
    state.ueisPorFazenda[farmId]?.length || 0;

  return {
    farmId,
    talhoes,
    equipamentos,
    produtos,
    ueis,
    atualizadoEm,
    prontoParaOperacao:
      talhoes > 0 && equipamentos > 0,
  };
}
