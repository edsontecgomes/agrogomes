import {
  collection,
  updateDoc,
  doc,
  arrayUnion,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore';

import { db } from './firebase';
import { OfflineEvent } from '../types';
import {
  removeLocalChecklistResponse,
  removeLocalExecucao,
  updateCachedOrdemServico,
} from './offlineOperationalStore';

const QUEUE_KEY = 'agri_offline_queue';

function withoutUndefined(
  value: unknown,
): unknown {
  if (Array.isArray(value)) {
    return value.map(withoutUndefined);
  }

  if (
    value &&
    typeof value === 'object' &&
    !(value instanceof Date)
  ) {
    return Object.fromEntries(
      Object.entries(
        value as Record<string, unknown>,
      )
        .filter(
          ([, currentValue]) =>
            currentValue !== undefined,
        )
        .map(([key, currentValue]) => [
          key,
          withoutUndefined(
            currentValue,
          ),
        ]),
    );
  }

  return value;
}

class SyncService {
  private queue: OfflineEvent[] = [];
  private processing = false;

  private onStatusChangeCallbacks: Array<
    (status: {
      online: boolean;
      pending: number;
    }) => void
  > = [];

  constructor() {
    this.loadQueue();

    window.addEventListener(
      'online',
      () => this.processQueue(),
    );

    window.addEventListener(
      'offline',
      () => this.notifyStatus(),
    );

    if (navigator.onLine) {
      void this.processQueue();
    }
  }

  private loadQueue() {
    const saved = localStorage.getItem(
      QUEUE_KEY,
    );

    if (!saved) return;

    try {
      this.queue = JSON.parse(
        saved,
      ) as OfflineEvent[];
    } catch (error) {
      console.error(
        'Failed to load offline queue',
        error,
      );

      this.queue = [];
    }
  }

  private saveQueue() {
    localStorage.setItem(
      QUEUE_KEY,
      JSON.stringify(this.queue),
    );

    this.notifyStatus();
  }

  public enqueue(
    type: OfflineEvent['type'],
    payload: unknown,
  ) {
    const event: OfflineEvent = {
      id: crypto.randomUUID(),
      type,
      payload,
      createdAt: Date.now(),
      synced: false,
      retries: 0,
    };

    this.queue.push(event);
    this.saveQueue();

    if (navigator.onLine) {
      void this.processQueue();
    }

    return event.id;
  }

  public async processQueue() {
    if (
      this.processing ||
      !navigator.onLine ||
      this.queue.length === 0
    ) {
      return;
    }

    this.processing = true;

    const toSync = [...this.queue];

    try {
      for (const event of toSync) {
        try {
          await this.syncEvent(event);

          this.queue = this.queue.filter(
            (queuedEvent) =>
              queuedEvent.id !== event.id,
          );

          this.saveQueue();
          this.reconcileLocalState(
            event,
          );
        } catch (error) {
          console.error(
            `Failed to sync event ${event.id} (${event.type})`,
            error,
          );

          event.retries =
            (event.retries || 0) + 1;

          // O registro permanece na fila. Dados de campo não
          // podem ser descartados após um número arbitrário
          // de tentativas.
          this.saveQueue();

          break;
        }
      }
    } finally {
      this.processing = false;
      this.notifyStatus();
    }
  }

  private async syncEvent(
    event: OfflineEvent,
  ) {
    const { type } = event;

    const payload = event.payload as Record<
      string,
      any
    >;

    switch (type) {
      case 'CREATE_EXECUCAO': {
        const {
          id,
          dataInicioMs,
          dataFimMs,
          createdAtMs,
          ...data
        } = payload;

        if (!id) {
          throw new Error(
            'ID definitivo ausente na execução offline.',
          );
        }

        await setDoc(
          doc(
            db,
            'execucoes_servico',
            id,
          ),
          {
            ...(withoutUndefined(
              data,
            ) as Record<string, unknown>),
            dataInicio: new Date(
              dataInicioMs ||
                event.createdAt,
            ),
            ...(dataFimMs
              ? {
                  dataFim:
                    new Date(dataFimMs),
                }
              : {}),
            createdAt: new Date(
              createdAtMs ||
                event.createdAt,
            ),
            syncedAt:
              serverTimestamp(),
            sincronizado: true,
          },
        );

        break;
      }

      case 'UPDATE_EXECUCAO': {
        const {
          id,
          dataFimMs,
          updatedAtMs: _updatedAtMs,
          dataFim: _dataFim,
          ...data
        } = payload;

        await updateDoc(
          doc(
            db,
            'execucoes_servico',
            id,
          ),
          {
            ...(withoutUndefined(
              data,
            ) as Record<string, unknown>),
            ...(dataFimMs
              ? {
                  dataFim:
                    new Date(dataFimMs),
                }
              : {}),
            updatedAt: serverTimestamp(),
            syncedAt: serverTimestamp(),
            sincronizado: true,
          },
        );

        break;
      }

      case 'ADD_PATH_POINT': {
        await updateDoc(
          doc(
            db,
            'execucoes_servico',
            payload.execId,
          ),
          {
            path: arrayUnion(
              ...payload.points,
            ),
          },
        );

        break;
      }

      case 'CREATE_SEGMENTO': {
        const {
          id,
          createdAtMs,
          ...segmentData
        } = payload;
        const segmentId =
          id ||
          doc(
            collection(
              db,
              'segmentos_execucao',
            ),
          ).id;

        await setDoc(
          doc(
            db,
            'segmentos_execucao',
            segmentId,
          ),
          {
            ...(withoutUndefined(
              segmentData,
            ) as Record<string, unknown>),
            createdAt: new Date(
              createdAtMs ||
                event.createdAt,
            ),
            syncedAt:
              serverTimestamp(),
          },
        );

        break;
      }

      case 'UPDATE_ORDEM_SERVICO': {
        const {
          id,
          farmId: _farmId,
          updatedAtMs: _updatedAtMs,
          ...data
        } = payload;

        await updateDoc(
          doc(
            db,
            'ordens_servico',
            id,
          ),
          {
            ...(withoutUndefined(
              data,
            ) as Record<string, unknown>),
            updatedAt: serverTimestamp(),
          },
        );

        break;
      }

      case 'CREATE_HORIMETRO': {
        const {
          id,
          dataRegistroMs,
          ...horimeterData
        } = payload;

        await setDoc(
          doc(
            db,
            'horimetros',
            id,
          ),
          {
            ...(withoutUndefined(
              horimeterData,
            ) as Record<string, unknown>),
            dataRegistro: new Date(
              dataRegistroMs ||
                event.createdAt,
            ),
            createdAt: new Date(
              event.createdAt,
            ),
            syncedAt:
              serverTimestamp(),
          },
        );

        if (
          payload.maquinaId &&
          Number.isFinite(
            payload.horimetroAtual,
          )
        ) {
          await updateDoc(
            doc(
              db,
              'equipamentos',
              payload.maquinaId,
            ),
            {
              horimetroAtual:
                payload.horimetroAtual,
              ultimaAtualizacaoHorimetro:
                serverTimestamp(),
            },
          );
        }

        break;
      }

      case 'CREATE_CHUVA': {
        const timestampMs =
          typeof payload.timestamp ===
            'number' &&
          Number.isFinite(
            payload.timestamp,
          )
            ? payload.timestamp
            : event.createdAt;

        const dataRegistro = new Date(
          timestampMs,
        );

        const month =
          dataRegistro.getMonth() + 1;

        const year =
          dataRegistro.getFullYear();

        const batch = writeBatch(db);

        const chuvaComunitariaRef =
          doc(
            collection(
              db,
              'chuvas_comunitarias',
            ),
          );

        const registroPessoalRef =
          doc(
            collection(
              db,
              'registros_pessoais',
            ),
          );

        const coreData = {
          ...(withoutUndefined(
            payload,
          ) as Record<string, unknown>),
          timestamp: dataRegistro,
          createdAt: serverTimestamp(),
          syncedAt: serverTimestamp(),
          offlineCreatedAt:
            event.createdAt,
        };

        batch.set(
          chuvaComunitariaRef,
          coreData,
        );

        batch.set(
          registroPessoalRef,
          {
            ...coreData,
            month,
            year,
          },
        );

        await batch.commit();

        break;
      }

      case 'SUBMIT_CHECKLIST': {
        const {
          id,
          createdAtMs,
          ...responseData
        } = payload;
        const responseId =
          id ||
          doc(
            collection(
              db,
              'checklist_respostas',
            ),
          ).id;

        await setDoc(
          doc(
            db,
            'checklist_respostas',
            responseId,
          ),
          {
            ...(withoutUndefined(
              responseData,
            ) as Record<string, unknown>),
            createdAt: new Date(
              createdAtMs ||
                event.createdAt,
            ),
            syncedAt:
              serverTimestamp(),
          },
        );

        break;
      }
    }
  }

  private reconcileLocalState(
    event: OfflineEvent,
  ) {
    const payload = event.payload as Record<
      string,
      any
    >;

    if (
      event.type ===
        'UPDATE_ORDEM_SERVICO' &&
      payload.farmId &&
      payload.id &&
      payload.status
    ) {
      updateCachedOrdemServico(
        payload.farmId,
        payload.id,
        { status: payload.status },
      );
    }

    if (
      event.type ===
        'SUBMIT_CHECKLIST' &&
      payload.id
    ) {
      removeLocalChecklistResponse(
        payload.id,
      );
    }

    const executionId =
      event.type ===
      'ADD_PATH_POINT'
        ? payload.execId
        : event.type ===
              'CREATE_EXECUCAO' ||
            event.type ===
              'UPDATE_EXECUCAO'
          ? payload.id
          : event.type ===
              'CREATE_SEGMENTO'
            ? payload.execucaoId
            : null;

    if (!executionId) {
      return;
    }

    const hasPendingExecutionEvents =
      this.queue.some(
        (queuedEvent) => {
          const queuedPayload =
            queuedEvent.payload as Record<
              string,
              any
            >;

          return (
            queuedPayload.id ===
              executionId ||
            queuedPayload.execId ===
              executionId ||
            queuedPayload.execucaoId ===
              executionId
          );
        },
      );

    if (!hasPendingExecutionEvents) {
      removeLocalExecucao(
        executionId,
      );
    }
  }

  public subscribe(
    callback: (
      status: {
        online: boolean;
        pending: number;
      },
    ) => void,
  ) {
    this.onStatusChangeCallbacks.push(
      callback,
    );

    callback({
      online: navigator.onLine,
      pending: this.queue.length,
    });

    return () => {
      this.onStatusChangeCallbacks =
        this.onStatusChangeCallbacks.filter(
          (currentCallback) =>
            currentCallback !== callback,
        );
    };
  }

  private notifyStatus() {
    const status = {
      online: navigator.onLine,
      pending: this.queue.length,
    };

    this.onStatusChangeCallbacks.forEach(
      (callback) => callback(status),
    );
  }

  public getPendingCount() {
    return this.queue.length;
  }
}

export const syncService =
  new SyncService();
