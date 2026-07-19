export interface Fazenda {
  id: string;

  producerId?: string;

  nome?: string;

  name?: string;

  municipio?: string;

  estado?: string;

  areaTotal?: number;

  configurada?: boolean;

  ativa?: boolean;

  createdAt?: string;

  updatedAt?: string;
}

export interface Usuario {
  id: string;

  uid?: string;

  producerId?: string;

  farmId?: string;

  primaryFarmId?: string;

  nome?: string;

  name?: string;

  email?: string;

  role?:
    | "produtor"
    | "gerente"
    | "operador"
    | "admin"
    | "system_admin"
    | string;

  tipo?: string;

  createdAt?: string;

  updatedAt?: string;
}

export interface Convite {
  id: string;

  farmId: string;

  producerId?: string;

  email?: string;

  nome?: string;

  role?:
    | "gerente"
    | "operador"
    | "colaborador"
    | "admin"
    | string;

  status?:
    | "pendente"
    | "aceito"
    | "expirado"
    | "cancelado"
    | string;

  codigo?: string;

  criadoPor?: string;

  expiresAt?: Date | string;

  createdAt?: Date | string;

  updatedAt?: Date | string;
}