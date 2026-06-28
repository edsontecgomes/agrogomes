import { criarRegistroCadernoTecnico } from "../../operacoes/estoqueOperacional/cadernoTecnico";
import { EventoChuvaFirestore } from "./eventoChuvaFirestore";

export function gerarRegistroCadernoTecnicoChuva(
  evento: EventoChuvaFirestore,
  talhaoId: string,
  safra: string,
) {
  return criarRegistroCadernoTecnico({
    id: `CADERNO-CHUVA-${evento.id}`,
    farmId: evento.farmId,
    talhaoId,
    safra,
    tipoEvento: "chuva",
    descricao: `Chuva registrada: ${evento.volumeMm} mm`,
    origemId: evento.id,
    data: evento.data,
  });
}