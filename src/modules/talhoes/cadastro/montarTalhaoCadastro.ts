import {
  CoordenadaCadastroTalhao,
  TalhaoCadastro,
} from "./talhaoCadastro";
import { calcularCentroideTalhao } from "./centroideTalhao";
import {
  calcularAreaOperacionalTalhao,
  normalizarBordaduraTalhao,
} from "./bordaduraTalhao";
import { calcularPerimetroTalhao } from "./perimetroTalhao";

export function montarTalhaoCadastro(params: {
  farmId: string;
  nome: string;
  coordenadas: CoordenadaCadastroTalhao[];
  areaHa: number;
  bordaduraPercentual?: number;
}): TalhaoCadastro {
  const bordaduraPercentual = normalizarBordaduraTalhao(
    params.bordaduraPercentual,
  );

  return {
    farmId: params.farmId,
    nome: params.nome.trim(),
    coordenadas: params.coordenadas,
    areaHa: params.areaHa,
    perimetroMetros: calcularPerimetroTalhao(params.coordenadas),
    centroide: calcularCentroideTalhao(params.coordenadas),
    bordaduraPercentual,
    areaOperacionalHa: calcularAreaOperacionalTalhao(
      params.areaHa,
      bordaduraPercentual,
    ),
    status: "ativo",
  };
}