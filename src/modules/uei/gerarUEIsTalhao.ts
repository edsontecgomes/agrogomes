import { UEI } from "./UEI";

export function gerarUEIsTalhao(params: {
  producerId: string;
  farmId: string;
  talhaoId: string;
  nomeTalhao: string;
  areaOperacionalHa: number;
}) {

  const quantidade = Math.floor(params.areaOperacionalHa);

  return Array.from({ length: quantidade }).map((_, index) => ({

    id: crypto.randomUUID(),

    producerId: params.producerId,

    farmId: params.farmId,

    talhaoId: params.talhaoId,

    numero: index + 1,

    nome: `${params.nomeTalhao} - UEI ${index + 1}`,

    areaHa: 1,

    geometria: [],

    centroide: { lat: 0, lng: 0 },

    origem: "grid",

    status: "ativa",

    criadoEm: new Date(),

    atualizadoEm: new Date(),

  })) as UEI[];
}