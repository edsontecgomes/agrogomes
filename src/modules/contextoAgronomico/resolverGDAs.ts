import { resolverGDAsPorUEIs } from "../motorEspacial/resolverGDAsPorUEIs";

export async function resolverGDAs(
  ueiIds: string[],
): Promise<string[]> {
  if (!Array.isArray(ueiIds) || ueiIds.length === 0) {
    return [];
  }

  const resultado = await resolverGDAsPorUEIs(
    ueiIds,
  );

  return resultado.gdaIds;
}