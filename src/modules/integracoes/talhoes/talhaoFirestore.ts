import { CoordenadaTalhao } from "../../onboarding/geometriaTalhao/tiposGeometria";

export type TalhaoFirestore = {
  id: string;

  producerId?: string | null;

  farmId: string;

  nome: string;

  areaHa?: number;

  areaOperacionalHa?: number;

  bordaduraPercentual?: number;

  /**
   * Contrato oficial da plataforma.
   */
  coordenadas?: CoordenadaTalhao[];

  /**
   * Compatibilidade com documentos antigos.
   */
  pontos?: CoordenadaTalhao[];

  centroide?: CoordenadaTalhao | null;

  perimetroMetros?: number;

  status?: "ativo" | "inativo";

  configuracaoGeometria?: {
    bordaduraPercentual?: number;
    areaOperacionalHa?: number;
    perimetroMetros?: number;
    centroide?: CoordenadaTalhao | null;
  };

  createdAt?: unknown;

  updatedAt?: unknown;
};