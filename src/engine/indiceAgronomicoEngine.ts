import { criarIndiceAgronomico } from "../domain/indices/indiceAgronomicoDomain";
import { IndiceAgronomico } from "../types/indiceAgronomico";

export function gerarIndiceGeralAgronomico(params: {
  producerId: string;
  farmId: string;
  talhaoId?: string;
  memoriaAgronomicaId?: string;
  cicloAgronomicoId?: string;
  indiceSolo?: number;
  indiceChuva?: number;
  indiceOperacao?: number;
  indiceProdutividade?: number;
  indiceEconomia?: number;
  createdBy: string;
}): Omit<IndiceAgronomico, "id" | "createdAt" | "updatedAt"> {
  const componentes: Record<string, number> = {};

  if (params.indiceSolo !== undefined) componentes.solo = params.indiceSolo;
  if (params.indiceChuva !== undefined) componentes.chuva = params.indiceChuva;
  if (params.indiceOperacao !== undefined) componentes.operacao = params.indiceOperacao;
  if (params.indiceProdutividade !== undefined) {
    componentes.produtividade = params.indiceProdutividade;
  }
  if (params.indiceEconomia !== undefined) componentes.economia = params.indiceEconomia;

  const valores = Object.values(componentes);

  const media =
    valores.length > 0
      ? valores.reduce((total, valor) => total + valor, 0) / valores.length
      : 0;

  return criarIndiceAgronomico({
    producerId: params.producerId,
    farmId: params.farmId,
    talhaoId: params.talhaoId,
    memoriaAgronomicaId: params.memoriaAgronomicaId,
    cicloAgronomicoId: params.cicloAgronomicoId,
    tipo: "geral",
    nome: "Índice Geral Agronômico",
    descricao:
      "Índice consolidado da Memória Agronômica combinando solo, chuva, operação, produtividade e economia.",
    valor: media,
    componentes,
    createdBy: params.createdBy,
  });
}