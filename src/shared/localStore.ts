/**
 * IndexedDB storage for local libraries. Everything stays in the browser storage of this PC
 * (WebView2 profile of Office); nothing is uploaded. Office cache clearing removes it as well.
 */
import {
  localKey,
  normalizePath,
  planImport,
  registerLocalUrl,
  type LocalLibraryMeta,
} from "./local";

const DB_NAME = "slidelib-local";
const DB_VERSION = 1;
const LIBS = "libs";
const FILES = "files";

function req<T>(r: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

function done(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error ?? new Error("Transaktion abgebrochen"));
  });
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined")
    return Promise.reject(new Error("IndexedDB nicht verfügbar"));
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const r = indexedDB.open(DB_NAME, DB_VERSION);
      r.onupgradeneeded = () => {
        const db = r.result;
        if (!db.objectStoreNames.contains(LIBS)) db.createObjectStore(LIBS, { keyPath: "id" });
        if (!db.objectStoreNames.contains(FILES)) db.createObjectStore(FILES);
      };
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
    dbPromise.catch(() => (dbPromise = null));
  }
  return dbPromise;
}

/** Lists stored local libraries and registers object URLs for their thumbnails. Never throws. */
export async function loadLocalLibraries(): Promise<LocalLibraryMeta[]> {
  try {
    const db = await openDb();
    const metas = (await req(
      db.transaction(LIBS, "readonly").objectStore(LIBS).getAll()
    )) as LocalLibraryMeta[];
    // all thumbnail reads are issued synchronously in one fresh transaction
    const files = db.transaction(FILES, "readonly").objectStore(FILES);
    await Promise.all(
      metas.flatMap((m) =>
        m.items
          .filter((it) => it.thumb)
          .map(async (it) => {
            const key = localKey(m.id, it.thumb);
            const blob = (await req(files.get(key))) as Blob | undefined;
            if (blob) registerLocalUrl(key, URL.createObjectURL(blob));
          })
      )
    );
    return metas.sort((a, b) => a.label.localeCompare(b.label));
  } catch (e) {
    console.warn("[slidelib] local libraries unavailable", e);
    return [];
  }
}

/** Reads one stored file (key = "local:<libId>/<path>"). */
export async function getLocalFile(key: string): Promise<Blob | undefined> {
  const db = await openDb();
  return (await req(db.transaction(FILES, "readonly").objectStore(FILES).get(key))) as
    Blob | undefined;
}

export async function deleteLocalLibrary(id: string): Promise<void> {
  const db = await openDb();
  const tx = db.transaction([LIBS, FILES], "readwrite");
  tx.objectStore(LIBS).delete(id);
  tx.objectStore(FILES).delete(IDBKeyRange.bound(localKey(id, ""), localKey(id, "￿")));
  await done(tx);
}

export interface ImportResult {
  meta: LocalLibraryMeta;
  missing: number;
  replaced: boolean;
}

/**
 * Imports a folder picked with <input type="file" webkitdirectory>. Uses catalog.json when present.
 * A library with the same label is replaced. Files are written in small batches (progress callback).
 */
export async function importFolder(
  files: File[],
  onProgress?: (done: number, total: number) => void
): Promise<ImportResult> {
  if (!files.length) throw new Error("Der gewählte Ordner ist leer.");
  const rel = (f: File) => normalizePath(f.webkitRelativePath || f.name);
  const folder = rel(files[0]).split("/")[0] || "Lokaler Ordner";
  const byPath = new Map<string, File>();
  for (const f of files) {
    const p = rel(f);
    byPath.set(p.startsWith(folder + "/") ? p.slice(folder.length + 1) : p, f);
  }
  let catalog: unknown;
  const cat = byPath.get("catalog.json");
  if (cat) {
    try {
      catalog = JSON.parse((await cat.text()).replace(/^\uFEFF/, ""));
    } catch {
      catalog = undefined;
    }
  }
  const plan = planImport([...byPath.keys()], folder, catalog);
  if (!plan.items.length)
    throw new Error("Im gewählten Ordner wurden keine PowerPoint-Dateien gefunden.");

  const existing = (await loadLocalLibraries()).find((m) => m.label === plan.label);
  if (existing) await deleteLocalLibrary(existing.id);

  const id = `l${Date.now().toString(36)}`;
  const meta: LocalLibraryMeta = {
    id,
    label: plan.label,
    prefix: plan.prefix,
    folder,
    imported: new Date().toISOString(),
    items: plan.items,
  };
  const paths = plan.items.flatMap((it) => (it.thumb ? [it.file, it.thumb] : [it.file]));
  const db = await openDb();
  const BATCH = 20;
  for (let i = 0; i < paths.length; i += BATCH) {
    const tx = db.transaction(FILES, "readwrite");
    const store = tx.objectStore(FILES);
    for (const p of paths.slice(i, i + BATCH)) {
      const f = byPath.get(p);
      if (f) store.put(f, localKey(id, p));
    }
    await done(tx);
    onProgress?.(Math.min(i + BATCH, paths.length), paths.length);
  }
  const tx = db.transaction(LIBS, "readwrite");
  tx.objectStore(LIBS).put(meta);
  await done(tx);
  try {
    await navigator.storage?.persist?.();
  } catch {
    /* best effort: ask the browser not to evict the data */
  }
  return { meta, missing: plan.missing, replaced: !!existing };
}
