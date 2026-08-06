import { useCallback, useEffect, useState } from "react";

export const PRICE_PER_BUNDLE = 10;
export const CURRENCY = "NLE";

export type DayEntry = {
  id: string;
  date: string; // yyyy-mm-dd
  produced: number; // bundles produced
  setOut: number; // bundles set out for sales
  issues: number; // bundles with issues (leakage etc.)
  notes: string;
};

const KEY = "water-factory-entries-v2";

function read(): DayEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DayEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Sellable bundles = set out minus those with issues. */
export function goodBundles(entry: DayEntry): number {
  return Math.max(entry.setOut - entry.issues, 0);
}

export function revenueOf(entry: DayEntry): number {
  return goodBundles(entry) * PRICE_PER_BUNDLE;
}

export function useEntries() {
  const [entries, setEntries] = useState<DayEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setEntries(read());
    setLoaded(true);
  }, []);

  const persist = useCallback((next: DayEntry[]) => {
    const sorted = [...next].sort((a, b) => (a.date < b.date ? 1 : -1));
    setEntries(sorted);
    localStorage.setItem(KEY, JSON.stringify(sorted));
  }, []);

  const saveEntry = useCallback(
    (entry: Omit<DayEntry, "id">) => {
      const current = read();
      const existing = current.find((e) => e.date === entry.date);
      const next = existing
        ? current.map((e) => (e.date === entry.date ? { ...entry, id: e.id } : e))
        : [...current, { ...entry, id: crypto.randomUUID() }];
      persist(next);
      return Boolean(existing);
    },
    [persist],
  );

  const removeEntry = useCallback(
    (id: string) => persist(read().filter((e) => e.id !== id)),
    [persist],
  );

  return { entries, loaded, saveEntry, removeEntry };
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

export function formatPercent(value: number | null): string {
  if (value === null) return "New";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function formatMoney(value: number): string {
  return `${CURRENCY} ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export function formatDate(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function today(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
