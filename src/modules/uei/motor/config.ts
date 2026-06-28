export const MOTOR_CIENTIFICO_CONFIG = {
  raioConfiabilidadeChuvaMetros: 500,
  fatoresPrioritarios: [
    "chuva_volume",
    "chuva_distribuicao",
    "ordem_servico",
    "produto_utilizado",
    "implemento",
    "compactacao",
    "populacao_plantas",
  ],
  fatoresBaixaPrioridade: ["operador"],
};