export interface Location {
  lat: number;
  lng: number;
  accuracy?: number;
  altitude?: number;
}

export interface Pluviometro {
  id: string;
  nome: string;
  location: Location;
  farmId: string;
}

export interface ChuvaComunitaria {
  id: string;
  mm: number;
  location: Location;
  timestamp: Date;
  createdAt: Date;
  userId: string;
  farmId: string;
  pluviometroId: string;
  source?: "manual" | "sensor";
  month?: number;
  year?: number;
}

export interface NotificacaoOperacional {
  id: string;
  farmId: string;
  userId?: string;
  tipo:
    | "OS_INICIADA"
    | "OS_FINALIZADA"
    | "EXECUCAO_PAUSADA"
    | "GPS_FRACO"
    | "OFFLINE"
    | "SINCRONIZADO"
    | "CHUVA_REGISTRADA"
    | "CHECKLIST_PENDENTE"
    | "EXECUCAO_PARADA";
  titulo: string;
  mensagem: string;
  severidade: "info" | "warning" | "critical";
  visualizada: boolean;
  createdAt: Date;
}

export interface HealthStatus {
  gps: "ok" | "weak" | "offline";
  internet: "online" | "offline";
  sync: "idle" | "syncing" | "pending" | "error";
  tracking: "active" | "paused" | "inactive" | "error";
  battery?: "normal" | "low" | "critical";
  queueSize: number;
  lastSyncAt?: Date;
  lastGpsAt?: Date;
  lastTrackingAt?: Date;
  memoryWarnings?: number;
  errors?: string[];
}

export interface RainFABProps {
  farmId: string | null;
  pluviometros?: Pluviometro[];
  onSuccess?: () => void;
  activeModule?: string;
}

export interface ChuvaFormProps {
  farmId: string | null;
  pluviometros: Pluviometro[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export interface OrdemServico {
  id: string;
  farmId: string;
  titulo: string;
  descricao?: string;
  tipoOperacao:
    | "Plantio"
    | "Pulverizacao"
    | "Adubacao"
    | "Colheita"
    | "Outros";
  talhaoId: string;
  status: "pendente" | "parcial" | "em_execucao" | "finalizada";
  janelaInicio?: Date;
  janelaFim?: Date;
  produtos?: Array<{
    produtoId: string;
    nome: string;
    dose?: number;
    unidade?: string;
    categoria?: string;
    lote?: string;
    origemEstoque?: "produtos" | "estoque";
  }>;
  configuracoes?: {
    autoStartPorGeofence?: boolean;
    exigirConfirmacaoManual?: boolean;
  };
  larguraOperacional?: number;
  createdBy: string;
  createdAt: Date;
  maquinaId?: string;
  maquinaNome?: string;
  implementoId?: string;
  implementoNome?: string;
}

export interface ConfigOperacaoProduto {
  id: string;
  tipoOperacao: string;
  produtosPadrao: Array<{
    produtoId: string;
    nome: string;
    dose: number;
    unidade: string;
  }>;
  farmId: string;
}

export interface PathPoint {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp: number;
}

export interface MaterialAplicadoUEI {
  produtoId: string;
  nome: string;
  categoria?: string;
  lote?: string;
  dose: number;
  unidade?: string;
  quantidadeEstimada: number;
}

export interface CoberturaExecucaoUEI {
  ueiId: string;
  codigo?: string;
  nome?: string;
  zonaTalhao?: string;
  areaTotalUEIHa: number;
  areaTrabalhadaHa: number;
  percentualCobertura: number;
  materiais: MaterialAplicadoUEI[];
}

export interface ExecucaoServico {
  id: string;
  ordemId: string;
  farmId: string;
  talhaoId: string;
  operadorId: string;
  status: "aguardando" | "em_execucao" | "pausada" | "finalizada";
  dataInicio?: Date;
  dataFim?: Date;
  horimetroInicial?: number;
  horimetroFinal?: number;
  origemStart?: "manual" | "automatic_geofence";
  locationStart?: Location;
  locationEnd?: Location;
  path?: Array<Location & { timestamp: number }>;
  operadorNome?: string;
  produtoUsado?: string;
  semente?: string;
  lote?: string;
  produtos?: Array<{
    produtoId: string;
    nome: string;
    dose?: number;
    unidade?: string;
    categoria?: string;
    lote?: string;
    origemEstoque?: "produtos" | "estoque";
  }>;
  maquinaId?: string;
  maquinaNome?: string;
  implementoId?: string;
  implementoNome?: string;
  ueiIds?: string[];
  coberturaUEIs?: CoberturaExecucaoUEI[];
  areaExecutadaHa?: number;
  confiabilidadeEspacial?: number;
  metodoEspacial?: string;
  observacoesRastreabilidade?: string[];
  rastreabilidadeStatus?:
    | "processando"
    | "concluida"
    | "sem_cobertura"
    | "erro";
  consumoEstoqueStatus?: "baixado" | "pendente_cobertura";
  sincronizado?: boolean;
  createdAt: Date;
}

export interface SegmentoExecucao {
  id: string;
  farmId: string;
  execucaoId: string;
  ordemId: string;
  operadorId: string;
  talhaoId: string;
  inicioTimestamp: number;
  fimTimestamp: number;
  larguraOperacional?: number;
  pontos: Array<Location & { timestamp: number }>;
  metadata?: {
    velocidadeMedia?: number;
    distanciaPercorrida?: number;
  };
  createdAt: Date;
}

export interface ChecklistItem {
  id: string;
  pergunta: string;
  obrigatorio: boolean;
  tipo: "boolean" | "texto" | "numero";
}

export interface ChecklistTemplate {
  id: string;
  farmId: string;
  tipoOperacao:
    | "Plantio"
    | "Pulverizacao"
    | "Adubacao"
    | "Colheita"
    | "Outros";
  nome: string;
  itens: ChecklistItem[];
  ativo: boolean;
  createdAt: Date;
}

export interface ChecklistResposta {
  id: string;
  ordemId: string;
  execucaoId?: string;
  operadorId: string;
  checklistId: string;
  respostas: Array<{
    itemId: string;
    valor: any;
  }>;
  createdAt: Date;
}

export interface OfflineEvent {
  id: string;
  type:
    | "CREATE_EXECUCAO"
    | "UPDATE_EXECUCAO"
    | "ADD_PATH_POINT"
    | "CREATE_SEGMENTO"
    | "CREATE_CHUVA"
    | "SUBMIT_CHECKLIST";
  payload: any;
  createdAt: number;
  synced: boolean;
  retries?: number;
}

export interface Estoque {
  id: string;
  nome: string;
  tipo: string;
  quantidadeAtual: number;
  unidade: string;
  lote?: string;
  validade?: Date;
  farmId: string;
  updatedAt: Date;
  origemEstoque?: "produtos" | "estoque";
}

export interface Talhao {
  id: string;
  nome: string;
  farmId: string;
  geometria?: any;
  area?: number;
  areaHa?: number;
  coordenadas: Array<{ lat: number; lng: number }>;
  limiteOperacional?: Array<{ lat: number; lng: number }>;
  limiteAtivacaoOperacional?: Array<{
    lat: number;
    lng: number;
  }>;
  limiteNucleoProdutivo?: Array<{
    lat: number;
    lng: number;
  }>;
  distanciaSegurancaOperacionalMetros?: 20;
  bordaduraAgronomicaPercentual?: 4;
  cor?: string;
  producerId: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface ProdutoEstoque {
  id: string;
  farmId: string;
  producerId: string;
  nome: string;
  categoria: string;
  unidade: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  lote?: string | null;
  ativo: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface Equipamento {
  id: string;
  farmId: string;
  nome: string;
  tipo: "maquina" | "implemento";
  ativo: boolean;
  marca?: string;
  modelo?: string;
  potencia?: string;
  largura?: string;
  horimetroAtual?: number;
  ultimaAtualizacaoHorimetro?: any;
  createdAt?: any;
}

export interface HorimetroRegistro {
  id: string;
  farmId: string;
  producerId: string;
  maquinaId: string;
  maquinaNome: string;
  horimetroAnterior: number;
  horimetroAtual: number;
  dataRegistro: any;
  operadorId: string;
  operadorNome: string;
  observacao?: string;
  createdAt?: any;
}

export interface Abastecimento {
  id: string;
  farmId: string;
  producerId: string;
  maquinaId: string;
  maquinaNome: string;
  operadorId: string;
  operadorNome: string;
  dataAbastecimento: any;
  horimetroAtual: number;
  litros: number;
  valorLitro: number;
  valorTotal: number;
  postoCombustivel?: string;
  observacoes?: string;
  localizacao?: { lat: number; lng: number };
  createdAt?: any;
}

export interface IndicadorConsumo {
  id: string;
  farmId: string;
  maquinaId: string;
  litrosHora?: number;
  litrosHectare?: number;
  custoHora?: number;
  custoHectare?: number;
  ultimaAtualizacao?: any;
}

export interface PlanoManutencao {
  id: string;
  farmId: string;
  producerId: string;
  equipamentoId: string;
  equipamentoNome: string;
  tipoManutencao:
    | "Troca de Óleo"
    | "Troca de Filtro"
    | "Lubrificação"
    | "Revisão"
    | "Pneus"
    | "Correias"
    | "Sistema Hidráulico"
    | "Outros";
  intervaloHoras: number;
  ultimaExecucaoHorimetro: number;
  proximaExecucaoHorimetro: number;
  ativo: boolean;
  createdAt?: any;
}

export interface ManutencaoExecutada {
  id: string;
  farmId: string;
  producerId: string;
  equipamentoId: string;
  planoId?: string;
  tipoManutencao: string;
  dataExecucao: any;
  horimetroExecucao: number;
  descricao: string;
  custo: number;
  responsavel: string;
  observacao?: string;
  pecasId?: string[];
  createdAt?: any;
}

export interface PecaManutencao {
  id: string;
  farmId: string;
  nome: string;
  codigo?: string;
  marca?: string;
  quantidadeMinima?: number;
  produtoEstoqueId?: string;
  equipamentosCompativeis?: string[];
  manutencoesAssociadas?: string[];
  ativo: boolean;
  createdAt: any;
  updatedAt?: any;
}
