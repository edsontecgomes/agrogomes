export type SafraGDA = {
  id: string;
  gdaId: string;
  ueiId: string;
  safra: string;
  cultura: "milho" | "soja" | "algodao" | "outra";
  status: "planejada" | "em_andamento" | "finalizada";
  inicio?: Date;
  fim?: Date;
};

export function criarSafraGDA(params: {
  gdaId: string;
  ueiId: string;
  safra: string;
  cultura: SafraGDA["cultura"];
}): SafraGDA {
  return {
    id: `${params.gdaId}-${params.safra}`,
    gdaId: params.gdaId,
    ueiId: params.ueiId,
    safra: params.safra,
    cultura: params.cultura,
    status: "planejada",
  };
}