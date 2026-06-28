import { CoordenadaTalhao } from "../../onboarding/geometriaTalhao/tiposGeometria";

export type TalhaoFirestore = {
  id: string;
  farmId: string;
  nome: string;
  areaHa?: number;
  pontos: CoordenadaTalhao[];
  createdAt?: unknown;
  updatedAt?: unknown;
};