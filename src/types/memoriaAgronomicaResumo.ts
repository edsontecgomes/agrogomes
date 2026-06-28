export interface MemoriaAgronomicaResumo {

  memoriaAgronomicaId: string;

  producerId: string;

  farmId: string;

  talhaoId: string;

  quantidadeSafras: number;

  quantidadeDecisoes: number;

  quantidadeEventos: number;

  quantidadeResultados: number;

  culturasCultivadas: string[];

  variedadesUtilizadas: string[];

  produtividadeMedia?: number;

  maiorProdutividade?: number;

  menorProdutividade?: number;

  custoMedioHa?: number;

  receitaMediaHa?: number;

  margemMediaHa?: number;

  ultimaAtualizacao: string;

}