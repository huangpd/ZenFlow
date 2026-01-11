
import { Task, DiaryEntry } from '../types';

const DB_NAME = 'ZenPathDB';
const DB_VERSION = 1;

export class LocalDBService {
  private static db: IDBDatabase | null = null;

  static async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('tasks')) {
          db.createObjectStore('tasks', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('logs')) {
          db.createObjectStore('logs', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('meditation')) {
          db.createObjectStore('meditation', { keyPath: 'date' });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = () => reject('Database initialization failed');
    });
  }

  static async saveTask(task: Task): Promise<void> {
    return this.perform('tasks', 'readwrite', (store) => store.put(task));
  }

  static async getAllTasks(): Promise<Task[]> {
    return this.perform('tasks', 'readonly', (store) => store.getAll());
  }

  static async saveLog(log: DiaryEntry): Promise<void> {
    return this.perform('logs', 'readwrite', (store) => store.put(log));
  }

  static async getAllLogs(): Promise<DiaryEntry[]> {
    return this.perform('logs', 'readonly', (store) => store.getAll());
  }

  static async saveMeditation(date: string, minutes: number): Promise<void> {
    return this.perform('meditation', 'readwrite', async (store) => {
      const existing = await new Promise<any>((res) => {
        const req = store.get(date);
        req.onsuccess = () => res(req.result);
      });
      const newVal = existing ? { date, minutes: existing.minutes + minutes } : { date, minutes };
      store.put(newVal);
    });
  }

  static async getAllMeditation(): Promise<{date: string, minutes: number}[]> {
    return this.perform('meditation', 'readonly', (store) => store.getAll());
  }

  private static perform(storeName: string, mode: IDBTransactionMode, action: (store: IDBObjectStore) => any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('DB not initialized');
      const transaction = this.db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      const request = action(store);
      
      if (request instanceof IDBRequest) {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } else {
        transaction.oncomplete = () => resolve(null);
        transaction.onerror = () => reject(transaction.error);
      }
    });
  }
}
