/**
 * Offline POS Queue Manager for Fidely Cashier Terminal.
 * 
 * Provides robust IndexedDB persistence for transactions made while network is
 * offline or unreachable, with client-side idempotency keys and automatic background sync.
 */

export interface QueuedTransaction {
  id: string; // Idempotency UUID
  qrToken: string;
  amountTnd: number;
  storeId: string;
  storeName: string;
  pointsToIssue: number;
  customerName?: string;
  timestamp: number;
  status: 'pending' | 'syncing' | 'failed';
  error?: string;
}

const DB_NAME = 'fidely_pos_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'offline_transactions';
const OFFLINE_ENABLED_KEY = 'fidely_pos_offline_mode_enabled';

type QueueListener = (count: number) => void;
const listeners: Set<QueueListener> = new Set();

export function subscribeToQueueChanges(listener: QueueListener): () => void {
  listeners.add(listener);
  getPendingCount().then(listener).catch(() => {});
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners() {
  getPendingCount().then((count) => {
    listeners.forEach((l) => l(count));
  }).catch(() => {});
}

/** Check if offline mode is enabled in POS settings (defaults to true). */
export function isOfflineModeEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(OFFLINE_ENABLED_KEY);
  return stored !== null ? stored === 'true' : true;
}

/** Toggle offline mode in POS settings. */
export function setOfflineModeEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(OFFLINE_ENABLED_KEY, String(enabled));
  notifyListeners();
}

/** Open or initialize the IndexedDB instance. */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('status', 'status', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Add a transaction to the offline queue with a generated idempotency key. */
export async function queueOfflineTransaction(
  data: Omit<QueuedTransaction, 'id' | 'timestamp' | 'status'>
): Promise<QueuedTransaction> {
  const db = await openDB();
  const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `offline-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const item: QueuedTransaction = {
    ...data,
    id,
    timestamp: Date.now(),
    status: 'pending',
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.add(item);

    req.onsuccess = () => {
      notifyListeners();
      resolve(item);
    };
    req.onerror = () => reject(req.error);
  });
}

/** Retrieve all pending queued transactions. */
export async function getPendingTransactions(): Promise<QueuedTransaction[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();

    req.onsuccess = () => {
      const all: QueuedTransaction[] = req.result || [];
      // Sort oldest first (FIFO)
      all.sort((a, b) => a.timestamp - b.timestamp);
      resolve(all);
    };
    req.onerror = () => reject(req.error);
  });
}

/** Count how many transactions are currently waiting in the offline queue. */
export async function getPendingCount(): Promise<number> {
  try {
    const pending = await getPendingTransactions();
    return pending.length;
  } catch {
    return 0;
  }
}

/** Remove a successfully synced transaction from IndexedDB. */
export async function removeTransaction(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);

    req.onsuccess = () => {
      notifyListeners();
      resolve();
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Synchronize all pending offline transactions with the Fidely API using idempotency keys.
 */
export async function syncOfflineQueue(
  apiClient: any,
  onProgress?: (synced: number, total: number) => void
): Promise<{ success: number; failed: number; total: number }> {
  const pending = await getPendingTransactions();
  if (pending.length === 0) {
    return { success: 0, failed: 0, total: 0 };
  }

  let successCount = 0;
  let failedCount = 0;

  for (let i = 0; i < pending.length; i++) {
    const item = pending[i];
    if (!item) continue;

    try {
      await apiClient.post('/api/v1/transactions/issue', {
        qrToken: item.qrToken,
        amountTnd: item.amountTnd,
        storeId: item.storeId,
        idempotencyKey: item.id,
      });

      // Remove from IndexedDB on confirmed sync
      await removeTransaction(item.id);
      successCount++;
    } catch (err: any) {
      console.warn(`[Offline POS Sync] Failed to sync transaction ${item.id}:`, err?.message);
      failedCount++;
    }

    if (onProgress) {
      onProgress(i + 1, pending.length);
    }
  }

  notifyListeners();
  return { success: successCount, failed: failedCount, total: pending.length };
}
