const STORAGE_KEY = "orderly_my_orders";
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

interface StoredOrder {
  id: string;
  createdAt: number;
}

function readStoredOrders(): StoredOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const entries: StoredOrder[] = JSON.parse(raw);
    const now = Date.now();
    const valid = entries.filter((e) => now - e.createdAt < TWO_HOURS_MS);
    if (valid.length !== entries.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
    }
    return valid;
  } catch {
    return [];
  }
}

export function getMyOrderIds(): string[] {
  return readStoredOrders().map((e) => e.id);
}

export function saveMyOrderId(id: string) {
  const entries = readStoredOrders();
  entries.push({ id, createdAt: Date.now() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}
