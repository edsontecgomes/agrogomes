export type StatusGDA = "novo" | "aprendendo" | "consolidado";

export type GDA = {
  id: string;
  producerId: string;
  farmId: string;
  talhaoId: string;
  ueiId: string;
  nome: string;
  status: StatusGDA;
  versaoMotor: string;
  nivelConhecimento: number;
  criadoEm: Date;
  atualizadoEm: Date;
};

export function criarGDA(params: {
  producerId: string;
  farmId: string;
  talhaoId: string;
  ueiId: string;
  nome: string;
}): GDA {
  return {
    id: `GDA-${params.ueiId}`,
    producerId: params.producerId,
    farmId: params.farmId,
    talhaoId: params.talhaoId,
    ueiId: params.ueiId,
    nome: params.nome,
    status: "novo",
    versaoMotor: "0.1.0",
    nivelConhecimento: 0,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  };
}