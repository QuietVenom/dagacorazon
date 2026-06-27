"use client";

const DATABASE_NAME = "dagacorazon";
const DATABASE_VERSION = 1;
const IMAGE_STORE = "canvas-images";

let databasePromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(IMAGE_STORE)) {
          database.createObjectStore(IMAGE_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        databasePromise = null;
        reject(request.error ?? new Error("Could not open image storage."));
      };
    });
  }

  return databasePromise;
}

function transactionComplete(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("Image storage transaction failed."));
    transaction.onabort = () =>
      reject(transaction.error ?? new Error("Image storage transaction was aborted."));
  });
}

export async function saveCanvasImage(id: string, image: Blob): Promise<void> {
  const database = await openDatabase();
  const transaction = database.transaction(IMAGE_STORE, "readwrite");
  transaction.objectStore(IMAGE_STORE).put(image, id);
  await transactionComplete(transaction);
}

export async function readCanvasImage(id: string): Promise<Blob | undefined> {
  const database = await openDatabase();
  const transaction = database.transaction(IMAGE_STORE, "readonly");
  const request = transaction.objectStore(IMAGE_STORE).get(id);
  const image = await new Promise<Blob | undefined>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as Blob | undefined);
    request.onerror = () => reject(request.error ?? new Error("Could not read image."));
  });
  await transactionComplete(transaction);
  return image;
}

export async function deleteCanvasImage(id: string): Promise<void> {
  const database = await openDatabase();
  const transaction = database.transaction(IMAGE_STORE, "readwrite");
  transaction.objectStore(IMAGE_STORE).delete(id);
  await transactionComplete(transaction);
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  if (!response.ok) throw new Error("Could not migrate the stored image.");
  return response.blob();
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () =>
      reject(reader.error ?? new Error("Could not serialize the stored image."));
    reader.readAsDataURL(blob);
  });
}

export function requestPersistentCanvasStorage(): void {
  if ("storage" in navigator && "persist" in navigator.storage) {
    void navigator.storage.persist().catch(() => undefined);
  }
}
