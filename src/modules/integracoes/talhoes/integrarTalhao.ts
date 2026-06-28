import { TalhaoFirestore } from "./talhaoFirestore";
import { TalhaoGeometria } from "../../onboarding/geometriaTalhao/tiposGeometria";

export function integrarTalhaoFirestore(talhao: TalhaoFirestore): TalhaoGeometria {
  return {
    talhaoId: talhao.id,
    nome: talhao.nome,
    limiteReal: {
      pontos: talhao.pontos,
    },
    areaTotalHa: talhao.areaHa,
  };
}