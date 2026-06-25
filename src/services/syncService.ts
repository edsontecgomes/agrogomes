import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  arrayUnion, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { OfflineEvent } from '../types';

const QUEUE_KEY = 'agri_offline_queue';

class SyncService {
  private queue: OfflineEvent[] = [];
  private processing = false;
  private onStatusChangeCallbacks: ((status: { online: boolean, pending: number }) => void)[] = [];

  constructor() {
    this.loadQueue();
    window.addEventListener('online', () => this.processQueue());
    window.addEventListener('offline', () => this.notifyStatus());
    
    // Initial check
    if (navigator.onLine) {
      this.processQueue();
    }
  }

  private loadQueue() {
    const saved = localStorage.getItem(QUEUE_KEY);
    if (saved) {
      try {
        this.queue = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load offline queue', e);
        this.queue = [];
      }
    }
  }

  private saveQueue() {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
    this.notifyStatus();
  }

  public enqueue(type: OfflineEvent['type'], payload: any) {
    const event: OfflineEvent = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      payload,
      createdAt: Date.now(),
      synced: false,
      retries: 0
    };

    // Optimization: If ADD_PATH_POINT and we already have a pending one for the same execution,
    // we could merge them, but for now simple queue is safer.
    
    this.queue.push(event);
    this.saveQueue();

    if (navigator.onLine) {
      this.processQueue();
    }
  }

  public async processQueue() {
    if (this.processing || !navigator.onLine || this.queue.length === 0) return;
    
    this.processing = true;
    const toSync = [...this.queue];
    
    for (const event of toSync) {
      try {
        await this.syncEvent(event);
        // Remove from queue on success
        this.queue = this.queue.filter(e => e.id !== event.id);
        this.saveQueue();
      } catch (e) {
        console.error(`Failed to sync event ${event.id} (${event.type})`, e);
        event.retries = (event.retries || 0) + 1;
        
        // If too many retries, we might want to discard or flag it
        if (event.retries > 10) {
           this.queue = this.queue.filter(e => e.id !== event.id);
           this.saveQueue();
        }
        
        // Stop processing loop on error to wait for next connection/retry
        break; 
      }
    }

    this.processing = false;
    this.notifyStatus();
  }

  private async syncEvent(event: OfflineEvent) {
    const { type, payload } = event;

    switch (type) {
      case 'CREATE_EXECUCAO':
        await addDoc(collection(db, 'execucoes_servico'), {
          ...payload,
          createdAt: serverTimestamp(),
          dataInicio: serverTimestamp() // If being synced now, might need adjustment but usually sync is fast
        });
        break;

      case 'UPDATE_EXECUCAO':
        const { id, ...data } = payload;
        await updateDoc(doc(db, 'execucoes_servico', id), {
          ...data,
          updatedAt: serverTimestamp()
        });
        break;

      case 'ADD_PATH_POINT':
        await updateDoc(doc(db, 'execucoes_servico', payload.execId), {
          path: arrayUnion(...payload.points)
        });
        break;

      case 'CREATE_SEGMENTO':
        await addDoc(collection(db, 'segmentos_execucao'), {
          ...payload,
          createdAt: serverTimestamp()
        });
        break;

      case 'CREATE_CHUVA':
        await addDoc(collection(db, 'registros_chuva'), {
          ...payload,
          createdAt: serverTimestamp()
        });
        break;

      case 'SUBMIT_CHECKLIST':
        await addDoc(collection(db, 'checklist_respostas'), {
          ...payload,
          createdAt: serverTimestamp()
        });
        break;
    }
  }

  public subscribe(callback: (status: { online: boolean, pending: number }) => void) {
    this.onStatusChangeCallbacks.push(callback);
    callback({ online: navigator.onLine, pending: this.queue.length });
    return () => {
      this.onStatusChangeCallbacks = this.onStatusChangeCallbacks.filter(c => c !== callback);
    };
  }

  private notifyStatus() {
    const status = { online: navigator.onLine, pending: this.queue.length };
    this.onStatusChangeCallbacks.forEach(c => c(status));
  }

  public getPendingCount() {
    return this.queue.length;
  }
}

export const syncService = new SyncService();
