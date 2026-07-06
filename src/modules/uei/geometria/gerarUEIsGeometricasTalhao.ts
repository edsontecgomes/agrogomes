import { criarUEIGeometrica } from "./criarUEIGeometrica";
import { gerarGridGeometricoSimples } from "./gerarGridGeometricoSimples";
import { PoligonoGeometrico } from "./tiposGeometriaUEI";

export function gerarUEIsGeometricasTalhao(params: {
  producerId: string;
  farmId: string;
  talhaoId: string;
  nomeTalhao: string;
  poligonoTalhao: PoligonoGeometrico;
}) {
  const celulas = gerarGridGeometricoSimples(params.poligonoTalhao);

  return celulas.map((geometria, index) =>
    criarUEIGeometrica({
      producerId: params.producerId,
      farmId: params.farmId,
      talhaoId: params.talhaoId,
      nomeTalhao: params.nomeTalhao,
      numero: index + 1,
      geometria,
    }),
  );
}