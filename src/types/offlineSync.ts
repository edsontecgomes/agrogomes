export type OfflineSyncStatus =
  | "pendente"
  | "sincronizando"
  | "sincronizado"
  | "erro";

export type OfflineSyncOperation =
  | "create"
  | "update"
  | "delete";

export interface OfflineSyncItem {
  id: string;

  collectionName: string;
  documentId?: string;

  operation: OfflineSyncOperation;

  payload: Record<string, unknown>;

  status: OfflineSyncStatus;

  tentativas: number;
  erro?: string;

  createdAt: string;
  updatedAt: string;
}