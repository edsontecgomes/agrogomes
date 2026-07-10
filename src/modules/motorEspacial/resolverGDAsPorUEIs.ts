import { buscarGDAsDasUEIs } from "./buscarGDAsDasUEIs";
import { ResultadoResolucaoGDA } from "./typesGDA";

export async function resolverGDAsPorUEIs(
  ueiIds: string[],
): Promise<ResultadoResolucaoGDA> {
  const idsUnicos = Array.from(
    new Set(
      ueiIds
        .map((ueiId) => ueiId.trim())
        .filter(Boolean),
    ),
  );

  if (idsUnicos.length === 0) {
    return {
      gdaIds: [],
      gdas: [],
      ueiIdsSemGDA: [],
      metodo: "nenhuma_uei",
      confiabilidade: 0,
      observacoes: [
        "Nenhuma UEI foi informada para resolução dos GDAs.",
      ],
    };
  }

  const gdas = await buscarGDAsDasUEIs(idsUnicos);

  const ueiIdsComGDA = new Set(
    gdas.map((gda) => gda.ueiId),
  );

  const ueiIdsSemGDA = idsUnicos.filter(
    (ueiId) => !ueiIdsComGDA.has(ueiId),
  );

  if (gdas.length === 0) {
    return {
      gdaIds: [],
      gdas: [],
      ueiIdsSemGDA: idsUnicos,
      metodo: "nenhum_gda",
      confiabilidade: 0,
      observacoes: [
        "Nenhum GDA existente foi encontrado para as UEIs informadas.",
      ],
    };
  }

  const percentualEncontrado =
    gdas.length / idsUnicos.length;

  const observacoes: string[] = [];

  if (ueiIdsSemGDA.length > 0) {
    observacoes.push(
      `${ueiIdsSemGDA.length} UEI(s) ainda não possuem GDA no Firestore.`,
    );
  }

  return {
    gdaIds: gdas.map((gda) => gda.id),
    gdas,
    ueiIdsSemGDA,
    metodo: "id_deterministico",
    confiabilidade: Number(
      percentualEncontrado.toFixed(2),
    ),
    observacoes,
  };
}