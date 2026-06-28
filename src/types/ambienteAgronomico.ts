export interface AmbienteAgronomico {

  id: string;

  memoriaAgronomicaId: string;

  producerId: string;

  farmId: string;

  talhaoId: string;

  altitude?: number;

  declividade?: number;

  exposicaoSolar?: string;

  tipoSolo?: string;

  texturaSolo?: string;

  materiaOrganica?: number;

  ph?: number;

  ctc?: number;

  saturacaoBases?: number;

  aluminio?: number;

  compactacao?: number;

  drenagem?: string;

  ambienteProdutivo?: string;

  createdAt: string;

  updatedAt: string;

}