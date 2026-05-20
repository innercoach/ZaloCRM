import { ref, computed, watch } from 'vue';

export interface PendingMessage {
  id: string;
  conversationId: string;
  content: string;
  createdAt: string;
  status: 'pending' | 'sending' | 'failed';
}

const STORAGE_KEY = 'zalocrm-offline-queue';

function isValidMessage(item: unknown): item is PendingMessage {
  if (!item || typeof item !== 'object') return false;
  const obj = item as Record<string, unknown>;
  return typeof obj.id === 'string'
    && typeof obj.conversationId === 'string'
    && typeof obj.content === 'string'
    && typeof obj.createdAt === 'string'
    && (obj.status === 'pending' || obj.status === 'sending' || obj.status === 'failed');
}

function normalizeMessage(item: unknown): PendingMessage | null {
  if (!item || typeof item !== 'object') return null;
  const obj = item as Record<string, unknown>;
  if (
    typeof obj.id !== 'string'
    || typeof obj.conversationId !== 'string'
    || typeof obj.content !== 'string'
    || typeof obj.createdAt !== 'string'
  ) {
    return null;
  }
  const status = obj.status === 'failed' ? 'failed' : 'pending';
  return {
    id: obj.id,
    conversationId: obj.conversationId,
    content: obj.content,
    createdAt: obj.createdAt,
    status,
  };
}

function loadQueue(): PendingMessage[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeMessage).filter(isValidMessage);
  } catch {
    return [];
  }
}

function saveQueue(queue: PendingMessage[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

const pendingMessages = ref<PendingMessage[]>(loadQueue());
let flushing = false;

watch(pendingMessages, (val) => saveQueue(val), { deep: true });

export function useOfflineQueue() {
  function enqueue(conversationId: string, content: string) {
    const trimmed = content.trim();
    if (!trimmed) return;
    pendingMessages.value.push({
      id: `offline-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      conversationId,
      content: trimmed,
      createdAt: new Date().toISOString(),
      status: 'pending',
    });
  }

  async function flush(sendFn: (conversationId: string, content: string) => Promise<void>) {
    if (flushing || !navigator.onLine) return;
    flushing = true;
    try {
      const queue = [...pendingMessages.value].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
      for (const msg of queue) {
        pendingMessages.value = pendingMessages.value.map(item => (
          item.id === msg.id ? { ...item, status: 'sending' } : item
        ));
        try {
          await sendFn(msg.conversationId, msg.content);
          pendingMessages.value = pendingMessages.value.filter(item => item.id !== msg.id);
        } catch {
          pendingMessages.value = pendingMessages.value.map(item => (
            item.id === msg.id ? { ...item, status: 'failed' } : item
          ));
          break;
        }
      }
    } finally {
      flushing = false;
    }
  }

  const pendingCount = computed(() => pendingMessages.value.length);
  const failedCount = computed(() => pendingMessages.value.filter(msg => msg.status === 'failed').length);

  return { pendingMessages, pendingCount, failedCount, enqueue, flush };
}
