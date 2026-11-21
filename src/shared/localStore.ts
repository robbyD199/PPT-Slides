/**
 * IndexedDB storage for local libraries. Everything stays in the browser storage of this PC
 * (WebView2 profile of Office); nothing is uploaded. Office cache clearing removes it as well.
 */
import {
  catalogHrefs,
  catalogPaths,
  encodeAssetPath,
  localKey,
  normalizeBaseUrl,
  normalizePath,
  planImport,
  registerLocalUrl,
  type ImportPlan,
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
  return storePlan(plan, folder, async (p) => byPath.get(p), undefined, onProgress);
}

/**
 * Stores a planned library: files in batches (fetched in parallel, written in one transaction each), then the
 * metadata. An older library with the same label is removed only after the new one is complete.
 */
async function storePlan(
  plan: ImportPlan,
  folder: string,
  getBlob: (path: string) => Promise<Blob | undefined>,
  remote: LocalLibraryMeta["remote"],
  onProgress?: (done: number, total: number) => void
): Promise<ImportResult> {
  const existing = (await loadLocalLibraries()).find((m) => m.label === plan.label);
  const id = `l${Date.now().toString(36)}`;
  const meta: LocalLibraryMeta = {
    id,
    label: plan.label,
    prefix: plan.prefix,
    folder,
    imported: new Date().toISOString(),
    items: plan.items,
    ...(remote ? { remote } : {}),
  };
  const paths = plan.items.flatMap((it) => (it.thumb ? [it.file, it.thumb] : [it.file]));
  const db = await openDb();
  const BATCH = 8;
  try {
    for (let i = 0; i < paths.length; i += BATCH) {
      const batch = paths.slice(i, i + BATCH);
      const blobs = await Promise.all(batch.map((p) => getBlob(p)));
      const tx = db.transaction(FILES, "readwrite");
      const store = tx.objectStore(FILES);
      batch.forEach((p, j) => {
        const b = blobs[j];
        if (b) store.put(b, localKey(id, p));
      });
      await done(tx);
      onProgress?.(Math.min(i + BATCH, paths.length), paths.length);
    }
    const tx = db.transaction(LIBS, "readwrite");
    tx.objectStore(LIBS).put(meta);
    await done(tx);
  } catch (e) {
    await deleteLocalLibrary(id).catch(() => undefined); // drop the incomplete copy, keep the old one
    throw e;
  }
  if (existing) await deleteLocalLibrary(existing.id);
  try {
    await navigator.storage?.persist?.();
  } catch {
    /* best effort: ask the browser not to evict the data */
  }
  return { meta, missing: plan.missing, replaced: !!existing };
}

/* ------------------------------------------------------------------ online library (key protected) */

export interface RemoteLibraryInfo {
  id: string;
  label: string;
  count: number;
  bytes: number;
  updated: string;
}

async function remoteFetch(url: string, key: string): Promise<Response> {
  let res: Response | undefined;
  // a library has ~1000 files: retry short network hiccups (connection reset, 5xx) instead of failing the import
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      res = await fetch(url, { headers: { "X-Library-Key": key }, cache: "no-store" });
      if (res.status < 500 || attempt === 4) break;
    } catch {
      if (attempt === 4)
        throw new Error("Server nicht erreichbar. Adresse und Internetverbindung prüfen.");
    }
    await new Promise((r) => setTimeout(r, 500 * attempt));
  }
  if (!res) throw new Error("Server nicht erreichbar. Adresse und Internetverbindung prüfen.");
  if (res.status === 401) throw new Error("Der Schlüssel ist ungültig oder wurde gesperrt.");
  if (res.status === 403)
    throw new Error("Dieser Schlüssel hat keinen Zugriff auf diese Bibliothek.");
  if (!res.ok) throw new Error(`Der Server meldet Fehler ${res.status}.`);
  return res;
}

/** Libraries the key may open (GET /libs). */
export async function listRemoteLibraries(
  baseUrl: string,
  key: string
): Promise<{ name: string; libs: RemoteLibraryInfo[] }> {
  const res = await remoteFetch(`${normalizeBaseUrl(baseUrl)}/libs`, key);
  return (await res.json()) as { name: string; libs: RemoteLibraryInfo[] };
}

/** Downloads one online library completely (catalog, slides, thumbnails) into the local storage of this PC. */
export async function importRemote(
  baseUrl: string,
  key: string,
  lib: Pick<RemoteLibraryInfo, "id" | "label">,
  onProgress?: (done: number, total: number) => void
): Promise<ImportResult> {
  const base = `${normalizeBaseUrl(baseUrl)}/${encodeURIComponent(lib.id)}`;
  const catalog = JSON.parse(
    (await (await remoteFetch(`${base}/catalog.json`, key)).text()).replace(/^\uFEFF/, "")
  ) as unknown;
  const plan = planImport(catalogPaths(catalog), lib.label, catalog);
  if (!plan.items.length) throw new Error("Die Online-Bibliothek enthält keine Folien.");
  plan.label = lib.label;
  const hrefs = catalogHrefs(catalog);
  return storePlan(
    plan,
    lib.id,
    async (p) => (await remoteFetch(`${base}/${encodeAssetPath(hrefs.get(p) ?? p)}`, key)).blob(),
    { url: normalizeBaseUrl(baseUrl), lib: lib.id, key },
    onProgress
  );
}
