import {
  collection,
  addDoc,
  updateDoc,
  doc,
  arrayUnion,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';

import { db } from './firebase';
import { OfflineEvent } from '../types';

const QUEUE_KEY = 'agri_offline_queue';

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
        } catch (error) {
          console.error(
            `Failed to sync event ${event.id} (${event.type})`,
            error,
          );

          event.retries =
            (event.retries || 0) + 1;

          if (event.retries > 10) {
            this.queue =
              this.queue.filter(
                (queuedEvent) =>
                  queuedEvent.id !== event.id,
              );

            this.saveQueue();
          } else {
            this.saveQueue();
          }

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
        await addDoc(
          collection(
            db,
            'execucoes_servico',
          ),
          {
            ...payload,
            createdAt: serverTimestamp(),
            dataInicio: serverTimestamp(),
          },
        );

        break;
      }

      case 'UPDATE_EXECUCAO': {
        const { id, ...data } = payload;

        await updateDoc(
          doc(
            db,
            'execucoes_servico',
            id,
          ),
          {
            ...data,
            updatedAt: serverTimestamp(),
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
        await addDoc(
          collection(
            db,
            'segmentos_execucao',
          ),
          {
            ...payload,
            createdAt: serverTimestamp(),
          },
        );

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
          ...payload,
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
        await addDoc(
          collection(
            db,
            'checklist_respostas',
          ),
          {
            ...payload,
            createdAt: serverTimestamp(),
          },
        );

        break;
      }
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