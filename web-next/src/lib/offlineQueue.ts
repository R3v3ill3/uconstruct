export type QueueOperation = {
  id: string;
  endpoint: string;
  payload: any;
  method?: "insert" | "upsert" | "update";
  uniqueKeys?: string[];
  createdAt: number;
};

const QUEUE_KEY = "sv:queue";

function getQueue(): QueueOperation[] {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(QUEUE_KEY) : null;
    return raw ? (JSON.parse(raw) as QueueOperation[]) : [];
  } catch {
    return [];
  }
}

function setQueue(ops: QueueOperation[]) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(QUEUE_KEY, JSON.stringify(ops));
}

export function enqueueOperation(op: QueueOperation) {
  const existing = getQueue();
  if (!existing.find((o) => o.id === op.id)) {
    existing.push(op);
    setQueue(existing);
  }
}

export async function processQueue(postFn: (op: QueueOperation) => Promise<void>) {
  if (typeof navigator !== "undefined" && !navigator.onLine) return;
  let ops = getQueue();
  let changed = false;
  for (const op of ops) {
    try {
      await postFn(op);
      ops = ops.filter((o) => o.id !== op.id);
      changed = true;
    } catch {}
  }
  if (changed) setQueue(ops);
}

export function saveDraft(key: string, data: any) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(key, JSON.stringify({ data, savedAt: Date.now() }));
}

export function loadDraft<T = any>(key: string): { data: T | null; savedAt?: number } {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
    if (!raw) return { data: null };
    const parsed = JSON.parse(raw);
    return { data: parsed.data as T, savedAt: parsed.savedAt };
  } catch {
    return { data: null };
  }
}

export function clearDraft(key: string) {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(key);
}

