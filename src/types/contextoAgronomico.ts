export type EstagioFenologico =
  | "pre_plantio"
  | "plantio"
  | "emergencia"
  | "vegetativo"
  | "reprodutivo"
  | "enchimento_graos"
  | "maturacao"
  | "colheita";

export interface ContextoAgronomico {

  memoriaAgronomicaId: string;

  cicloAgronomicoId: string;

  cultura: string;

  variedade?: string;

  estadio: EstagioFenologico;

  chuvaAcumuladaMm: number;

  diasSemChuva: number;

  temperaturaMedia?: number;

  umidadeSolo?: number;

  produtividadeEsperada?: number;

  produtividadeAtual?: number;

  alertas: string[];

  criadoEm: string;

}