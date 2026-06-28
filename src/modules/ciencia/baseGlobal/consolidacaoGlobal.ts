import { DescobertaGlobal } from "./descobertaGlobal";

export function ordenarDescobertasGlobaisPorConfiabilidade(
  descobertas: DescobertaGlobal[],
) {
  return [...descobertas].sort((a, b) => b.confiabilidade - a.confiabilidade);
}

export function filtrarDescobertasGlobaisFortes(
  descobertas: DescobertaGlobal[],
) {
  return descobertas.filter(
    (descoberta) =>
      descoberta.numeroHectares >= 100 &&
      descoberta.numeroFazendas >= 3 &&
      descoberta.confiabilidade >= 70,
  );
}