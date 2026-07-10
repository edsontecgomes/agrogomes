export type AuditoriaEventoAgronomico = {
  versaoPipeline: string;
  criadoPorPipeline: boolean;
  dataProcessamento: string;
};

export function criarAuditoriaEvento(): AuditoriaEventoAgronomico {
  return {
    versaoPipeline: "pipeline-cientifico-v1",
    criadoPorPipeline: true,
    dataProcessamento: new Date().toISOString(),
  };
}