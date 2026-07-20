export type UserRole =
  | "admin"
  | "produtor"
  | "gerente"
  | "colaborador"
  | "operador"
  | "system_admin";

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

  conviteId?: string;

  nome?: string;

  name?: string;

  email?: string;

  role?: UserRole | string;

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

  token: string;

  role: UserRole;

  createdBy: string;

  used: boolean;

  status?:
    | "pendente"
    | "aceito"
    | "expirado"
    | "cancelado"
    | string;

  codigo?: string;

  criadoPor?: string;

  expiresAt: Date;

  createdAt: Date;

  updatedAt?: Date | string;
}