import type { Trip } from "../types";

const DATABASE_NAME = "fahrtenbuch-local";
const STORE_NAME = "trips";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB konnte nicht geöffnet werden."));
  });
}

async function runTransaction<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore, resolve: (value: T) => void, reject: (reason?: unknown) => void) => void): Promise<T> {
  const database = await openDatabase();
  return new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => reject(transaction.error);
    action(store, resolve, reject);
  });
}

export function getAllTrips(): Promise<Trip[]> {
  return runTransaction("readonly", (store, resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as Trip[]);
    request.onerror = () => reject(request.error);
  });
}

export function putTrip(trip: Trip): Promise<void> {
  return runTransaction("readwrite", (store, resolve, reject) => {
    const request = store.put(trip);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export function removeTrip(id: string): Promise<void> {
  return runTransaction("readwrite", (store, resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function replaceAllTrips(trips: Trip[]): Promise<void> {
  const database = await openDatabase();
  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    store.clear();
    for (const trip of trips) store.put(trip);
    transaction.oncomplete = () => { database.close(); resolve(); };
    transaction.onerror = () => { database.close(); reject(transaction.error ?? new Error("Lokale Daten konnten nicht gespeichert werden.")); };
    transaction.onabort = () => { database.close(); reject(transaction.error ?? new Error("Lokale Speicherung wurde abgebrochen.")); };
  });
}

export async function mergeTrips(current: Trip[], incoming: Trip[]): Promise<{ merged: Trip[]; imported: number; duplicates: number }> {
  const ids = new Set(current.map((trip) => trip.id));
  const additions = incoming.filter((trip) => !ids.has(trip.id));
  const merged = [...current, ...additions];
  await replaceAllTrips(merged);
  return { merged, imported: additions.length, duplicates: incoming.length - additions.length };
}

export function clearTrips(): Promise<void> {
  return replaceAllTrips([]);
}
