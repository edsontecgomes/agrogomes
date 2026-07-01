import { gerarUEIsTalhao } from "./gerarUEIsTalhao";
import { salvarUEIs } from "./salvarUEIs";

export async function pipelineCriacaoUEIs(params: {

  producerId: string;

  farmId: string;

  talhaoId: string;

  nomeTalhao: string;

  areaOperacionalHa: number;

}) {

  const lista = gerarUEIsTalhao(params);

  await salvarUEIs(lista);

  return lista;

}