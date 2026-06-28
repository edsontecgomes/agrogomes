export type ConsentimentoBaseGlobal = {
  farmId: string;
  permitido: boolean;
  dataConsentimento?: string;
  revogadoEm?: string;
};

export function consentimentoAtivo(consentimento?: ConsentimentoBaseGlobal) {
  return Boolean(consentimento?.permitido && !consentimento.revogadoEm);
}