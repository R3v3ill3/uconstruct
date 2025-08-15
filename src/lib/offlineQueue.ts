export type QueueOperation = {
	id: string; // idempotency key, e.g., client_generated_id
	endpoint: string; // table name or RPC identifier
	payload: any;
	method?: "insert" | "upsert" | "update";
	uniqueKeys?: string[]; // used for upsert or dedupe in UI
	createdAt: number;
};

const QUEUE_KEY = "sv:queue";

function getQueue(): QueueOperation[] {
	try {
		const raw = localStorage.getItem(QUEUE_KEY);
		return raw ? (JSON.parse(raw) as QueueOperation[]) : [];
	} catch {
		return [];
	}
}

function setQueue(ops: QueueOperation[]) {
	localStorage.setItem(QUEUE_KEY, JSON.stringify(ops));
}

export function enqueueOperation(op: QueueOperation) {
	const existing = getQueue();
	// de-dupe by idempotency key
	if (!existing.find((o) => o.id === op.id)) {
		existing.push(op);
		setQueue(existing);
	}
}

export async function processQueue(postFn: (op: QueueOperation) => Promise<void>) {
	if (!navigator.onLine) return;
	let ops = getQueue();
	let changed = false;
	for (const op of ops) {
		try {
			await postFn(op);
			ops = ops.filter((o) => o.id !== op.id);
			changed = true;
		} catch (e) {
			// Leave it in the queue for future retry
		}
	}
	if (changed) setQueue(ops);
}

export function saveDraft(key: string, data: any) {
	localStorage.setItem(key, JSON.stringify({ data, savedAt: Date.now() }));
}

export function loadDraft<T = any>(key: string): { data: T | null; savedAt?: number } {
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return { data: null };
		const parsed = JSON.parse(raw);
		return { data: parsed.data as T, savedAt: parsed.savedAt };
	} catch {
		return { data: null };
	}
}

export function clearDraft(key: string) {
	localStorage.removeItem(key);
}