export type EventoHistoricoUei = {
  ueiId: string;
  safra: string;
  tipo: "chuva" | "ordem_servico" | "solo" | "produtividade" | "observacao";
  data: string;
  descricao: string;
  origem?: string;
};

export function criarEventoHistoricoUei(
  ueiId: string,
  safra: string,
  tipo: EventoHistoricoUei["tipo"],
  descricao: string,
  origem?: string,
): EventoHistoricoUei {
  return {
    ueiId,
    safra,
    tipo,
    data: new Date().toISOString(),
    descricao,
    origem,
  };
}