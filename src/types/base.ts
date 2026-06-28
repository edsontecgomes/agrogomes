export interface Fazenda {
  id: string;
  producerId?: string;
  nome?: string;
  name?: string;
  municipio?: string;
  estado?: string;
  areaTotal?: number;
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
  role?: "produtor" | "gerente" | "operador" | "admin" | "system_admin" | string;
  tipo?: string;
  createdAt?: string;
  updatedAt?: string;
}