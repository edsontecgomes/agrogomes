export type ProfundidadeSolo = "0_10" | "10_20" | "20_30";

export type PontoColetaSolo = {
  id: string;
  codigo: string;
  producerId?: string;
  farmId: string;
  talhaoId: string;
  ueiId: string;
  ueiCodigo: string;
  ordem: 1 | 2 | 3 | 4 | 5;
  /** Posição contínua do waypoint dentro da rota completa do talhão. */
  ordemRotaTalhao?: number;
  principal: boolean;
  coordenadaPlanejada: { lat: number; lng: number };
  raioOperacionalMetros: number;
};

export type RegistroColetaSolo = {
  id: string;
  producerId: string;
  farmId: string;
  talhaoId: string;
  ueiId: string;
  pontoColetaId: string;
  pontoColetaCodigo: string;
  pontoPrincipal: boolean;
  coordenadaPlanejada: { lat: number; lng: number };
  coordenadaReal: { lat: number; lng: number };
  distanciaMetros: number;
  precisaoGPSMetros: number;
  usuarioId: string;
  usuarioNome?: string;
  coletadoEm: string;
  profundidade: ProfundidadeSolo;
  numeroAmostra: string;
  tipoAnalise: string;
  observacoes?: string;
  fotografiaUrl?: string;
  origem: "online" | "offline";
  status: "coletada" | "inconsistente";
};
