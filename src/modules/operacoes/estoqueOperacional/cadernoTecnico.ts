export type RegistroCadernoTecnico = {
  id: string;
  farmId: string;
  talhaoId: string;
  safra: string;
  tipoEvento:
    | "plantio"
    | "adubacao"
    | "pulverizacao"
    | "colheita"
    | "chuva"
    | "compactacao"
    | "populacao"
    | "outro";
  data: string;
  descricao: string;
  origemId?: string;
  produtos?: string[];
};

export function criarRegistroCadernoTecnico(
  params: Omit<RegistroCadernoTecnico, "data"> & { data?: string },
): RegistroCadernoTecnico {
  return {
    ...params,
    data: params.data || new Date().toISOString(),
  };
}