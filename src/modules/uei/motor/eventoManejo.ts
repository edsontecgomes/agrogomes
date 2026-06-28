export type EventoManejoUei = {
  ueiId: string;
  data: string;
  ordemServicoId?: string;
  tipoOperacao: string;
  produtosUtilizados: string[];
  implemento?: string;
  observacoes?: string;
};

export function criarEventoManejoUei(params: Omit<EventoManejoUei, "data"> & { data?: string }) {
  return {
    ...params,
    data: params.data || new Date().toISOString(),
  };
}