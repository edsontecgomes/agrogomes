import { CicloAgronomico } from "../../types/cicloAgronomico";
import { DecisaoAgronomica } from "../../types/decisaoAgronomica";
import { EventoAgronomico } from "../../types/eventoAgronomico";
import { ResultadoAgronomico } from "../../types/resultadoAgronomico";
import { MemoriaAgronomicaResumo } from "../../types/memoriaAgronomicaResumo";

export interface DadosResumoMemoriaAgronomica {
  memoriaAgronomicaId: string;
  ciclos: CicloAgronomico[];
  decisoes: DecisaoAgronomica[];
  eventos: EventoAgronomico[];
  resultados: ResultadoAgronomico[];
}

export function calcularResumoMemoriaAgronomica(
  dados: DadosResumoMemoriaAgronomica
): MemoriaAgronomicaResumo {
  const culturas = new Set<string>();
  const variedades = new Set<string>();

  dados.ciclos.forEach((ciclo) => {
    if (ciclo.cultura) culturas.add(ciclo.cultura);
    if (ciclo.variedadeOuHibrido) variedades.add(ciclo.variedadeOuHibrido);
  });

  const resultadosProdutividade = dados.resultados.filter(
    (resultado) =>
      resultado.tipo === "produtividade" &&
      typeof resultado.valor === "number"
  );

  const produtividades = resultadosProdutividade.map(
    (resultado) => resultado.valor as number
  );

  const produtividadeMedia =
    produtividades.length > 0
      ? produtividades.reduce((total, valor) => total + valor, 0) /
        produtividades.length
      : undefined;

  return {
    memoriaAgronomicaId: dados.memoriaAgronomicaId,
    producerId: dados.ciclos[0]?.producerId ?? "",
    farmId: dados.ciclos[0]?.farmId ?? "",
    talhaoId: dados.ciclos[0]?.talhaoId ?? "",
    quantidadeSafras: dados.ciclos.length,
    quantidadeDecisoes: dados.decisoes.length,
    quantidadeEventos: dados.eventos.length,
    quantidadeResultados: dados.resultados.length,
    culturasCultivadas: Array.from(culturas),
    variedadesUtilizadas: Array.from(variedades),
    produtividadeMedia,
    maiorProdutividade:
      produtividades.length > 0 ? Math.max(...produtividades) : undefined,
    menorProdutividade:
      produtividades.length > 0 ? Math.min(...produtividades) : undefined,
    ultimaAtualizacao: new Date().toISOString(),
  };
}