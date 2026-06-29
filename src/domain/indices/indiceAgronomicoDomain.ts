import {
  ClassificacaoIndiceAgronomico,
  IndiceAgronomico,
  TipoIndiceAgronomico,
} from "../../types/indiceAgronomico";

export function limitarIndice(valor: number): number {
  if (valor < 0) return 0;
  if (valor > 100) return 100;

  return Math.round(valor);
}

export function classificarIndice(
  valor: number
): ClassificacaoIndiceAgronomico {
  if (valor < 20) return "critico";
  if (valor < 40) return "baixo";
  if (valor < 65) return "medio";
  if (valor < 85) return "alto";

  return "excelente";
}

export function criarIndiceAgronomico(params: {
  producerId: string;
  farmId: string;
  talhaoId?: string;
  memoriaAgronomicaId?: string;
  cicloAgronomicoId?: string;
  tipo: TipoIndiceAgronomico;
  nome: string;
  descricao?: string;
  valor: number;
  componentes?: Record<string, number>;
  createdBy: string;
}): Omit<IndiceAgronomico, "id" | "createdAt" | "updatedAt"> {
  const valorLimitado = limitarIndice(params.valor);

  return {
    producerId: params.producerId,
    farmId: params.farmId,
    talhaoId: params.talhaoId,
    memoriaAgronomicaId: params.memoriaAgronomicaId,
    cicloAgronomicoId: params.cicloAgronomicoId,
    tipo: params.tipo,
    nome: params.nome,
    descricao: params.descricao,
    valor: valorLimitado,
    classificacao: classificarIndice(valorLimitado),
    componentes: params.componentes,
    dataCalculo: new Date().toISOString(),
    createdBy: params.createdBy,
  };
}