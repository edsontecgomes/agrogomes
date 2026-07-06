import { calcularAreaAproximadaUEI } from "./areaUEI";
import { calcularCentroideUEI } from "./centroideUEI";
import { PoligonoGeometrico, UEIGeometrica } from "./tiposGeometriaUEI";

export function criarUEIGeometrica(params: {
  producerId: string;
  farmId: string;
  talhaoId: string;
  nomeTalhao: string;
  numero: number;
  geometria: PoligonoGeometrico;
}): UEIGeometrica {
  return {
    id: `${params.talhaoId}-UEI-${String(params.numero).padStart(5, "0")}`,
    producerId: params.producerId,
    farmId: params.farmId,
    talhaoId: params.talhaoId,
    numero: params.numero,
    nome: `${params.nomeTalhao} - UEI ${params.numero}`,
    areaHa: calcularAreaAproximadaUEI(params.geometria),
    geometria: params.geometria,
    centroide: calcularCentroideUEI(params.geometria),
    origem: "grid_geometrico",
    status: "ativa",
  };
}