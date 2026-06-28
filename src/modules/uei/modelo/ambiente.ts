export type AmbienteUei = {
  chuvaMm?: number;
  distribuicaoChuva?: string;
  argilaPercentual?: number;
  compactacaoMpa?: number;
  altitudeM?: number;
  luzSolarIndice?: number;
  fertilidadeNivel?: "baixa" | "media" | "alta";
};

export function ambienteTemBaseMinima(ambiente: AmbienteUei) {
  return Boolean(
    ambiente.chuvaMm !== undefined ||
      ambiente.compactacaoMpa !== undefined ||
      ambiente.fertilidadeNivel,
  );
}