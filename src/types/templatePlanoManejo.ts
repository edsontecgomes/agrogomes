import { EtapaPlanoManejo, TipoEtapaManejo } from "./planoManejo";

export type StatusTemplatePlanoManejo = "ativo" | "inativo";

export interface EtapaTemplatePlanoManejo {
  id: string;
  tipo: TipoEtapaManejo;
  nome: string;
  descricao?: string;
  diasAposInicioCiclo?: number;
  prioridade: "baixa" | "media" | "alta" | "critica";
  objetivoAgronomico?: string;
  observacoesTecnicas?: string;
}

export interface TemplatePlanoManejo {
  id: string;

  producerId: string;
  farmId?: string;

  nome: string;
  descricao?: string;

  cultura?: string;
  tipoOcupacao?: string;

  etapas: EtapaTemplatePlanoManejo[];

  status: StatusTemplatePlanoManejo;

  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export function converterTemplateEmEtapas(
  etapasTemplate: EtapaTemplatePlanoManejo[]
): EtapaPlanoManejo[] {
  return etapasTemplate.map((etapa) => ({
    id: etapa.id,
    tipo: etapa.tipo,
    nome: etapa.nome,
    descricao: etapa.descricao,
    prioridade: etapa.prioridade,
    objetivoAgronomico: etapa.objetivoAgronomico,
    observacoesTecnicas: etapa.observacoesTecnicas,
    status: "pendente",
  }));
}