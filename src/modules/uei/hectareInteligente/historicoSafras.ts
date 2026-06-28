export type SafraHectareInteligente = {
  hectareId: string;
  safra: string;
  cultura: "milho" | "soja" | "algodao";
  produtividadeScHa?: number;
  cultivar?: string;
};

export function ordenarSafrasPorAno(safras: SafraHectareInteligente[]) {
  return [...safras].sort((a, b) => a.safra.localeCompare(b.safra));
}