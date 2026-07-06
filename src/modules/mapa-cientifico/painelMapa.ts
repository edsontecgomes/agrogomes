export type PainelMapa = {
  mostrarLegenda: boolean;
  mostrarCamadas: boolean;
  mostrarEscala: boolean;
  mostrarMiniMapa: boolean;
};

export const PAINEL_MAPA_PADRAO: PainelMapa = {
  mostrarLegenda: true,
  mostrarCamadas: true,
  mostrarEscala: true,
  mostrarMiniMapa: false,
};