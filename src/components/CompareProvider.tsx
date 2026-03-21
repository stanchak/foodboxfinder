"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";

const MAX_COMPARE = 4;
const STORAGE_KEY = "fbf-compare";

interface CompareEntry {
  slug: string;
  name: string;
}

interface CompareContextValue {
  selected: CompareEntry[];
  addProvider: (slug: string, name: string) => void;
  removeProvider: (slug: string) => void;
  clearAll: () => void;
  isSelected: (slug: string) => boolean;
  isFull: boolean;
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function useCompare(): CompareContextValue {
  const ctx = useContext(CompareContext);
  if (!ctx) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return ctx;
}

function parseEntries(raw: string | null): CompareEntry[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CompareEntry =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as Record<string, unknown>).slug === "string" &&
        typeof (item as Record<string, unknown>).name === "string",
    );
  } catch {
    return [];
  }
}

// Empty array used as the server snapshot -- stable reference
const EMPTY: CompareEntry[] = [];

export default function CompareProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Listeners for useSyncExternalStore
  const listenersRef = useRef(new Set<() => void>());
  // Cache the snapshot so useSyncExternalStore gets a stable reference
  const cachedSnapshotRef = useRef<CompareEntry[]>(EMPTY);
  const cachedRawRef = useRef<string | null>(null);

  const subscribe = useCallback((listener: () => void) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const getSnapshot = useCallback((): CompareEntry[] => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw !== cachedRawRef.current) {
      cachedRawRef.current = raw;
      cachedSnapshotRef.current = parseEntries(raw);
    }
    return cachedSnapshotRef.current;
  }, []);

  const getServerSnapshot = useCallback((): CompareEntry[] => {
    return EMPTY;
  }, []);

  const selected = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Notify all listeners to re-read from sessionStorage
  const notify = useCallback(() => {
    listenersRef.current.forEach((listener) => listener());
  }, []);

  const writeAndNotify = useCallback(
    (entries: CompareEntry[]) => {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      } catch {
        // Storage full or unavailable
      }
      notify();
    },
    [notify],
  );

  const addProvider = useCallback(
    (slug: string, name: string) => {
      const current = parseEntries(sessionStorage.getItem(STORAGE_KEY));
      if (current.length >= MAX_COMPARE) return;
      if (current.some((entry) => entry.slug === slug)) return;
      writeAndNotify([...current, { slug, name }]);
    },
    [writeAndNotify],
  );

  const removeProvider = useCallback(
    (slug: string) => {
      const current = parseEntries(sessionStorage.getItem(STORAGE_KEY));
      writeAndNotify(current.filter((entry) => entry.slug !== slug));
    },
    [writeAndNotify],
  );

  const clearAll = useCallback(() => {
    writeAndNotify([]);
  }, [writeAndNotify]);

  const isSelected = useCallback(
    (slug: string) => selected.some((entry) => entry.slug === slug),
    [selected],
  );

  const isFull = selected.length >= MAX_COMPARE;

  const value = useMemo<CompareContextValue>(
    () => ({ selected, addProvider, removeProvider, clearAll, isSelected, isFull }),
    [selected, addProvider, removeProvider, clearAll, isSelected, isFull],
  );

  return (
    <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
  );
}
