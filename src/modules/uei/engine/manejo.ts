export interface ManejoResumo {
  hectareId: string;

  variedade?: string;

  populacao?: number;

  fungicidas: string[];

  herbicidas: string[];

  inseticidas: string[];

  fertilizantes: string[];

  observacoes?: string;
}

export function criarManejo(
  hectareId: string
): ManejoResumo {
  return {
    hectareId,
    fungicidas: [],
    herbicidas: [],
    inseticidas: [],
    fertilizantes: [],
  };
}