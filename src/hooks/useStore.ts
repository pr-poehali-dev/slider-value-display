import { useState, useEffect, useCallback } from "react";

const SYNC_URL = "https://functions.poehali.dev/6474c237-77ce-4f79-a074-a4def99ae061";

export interface Product {
  id: string;
  name: string;
  calories: number;
  potassium: number;
  phosphorus: number;
}

export interface DailyEntry {
  id: string;
  product_id: string;
  product_name: string;
  grams: number;
  calories: number;
  potassium: number;
  phosphorus: number;
  eaten_at: string;
  created_at: string;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function loadLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveLocal(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function useStore() {
  const [products, setProductsState] = useState<Product[]>(() => loadLocal("products", []));
  const [entries, setEntriesState] = useState<DailyEntry[]>(() => loadLocal("entries_" + today(), []));
  const [syncing, setSyncing] = useState(false);

  const setProducts = (p: Product[]) => {
    setProductsState(p);
    saveLocal("products", p);
  };

  const setEntries = (e: DailyEntry[]) => {
    setEntriesState(e);
    saveLocal("entries_" + today(), e);
  };

  const syncFromServer = useCallback(async () => {
    try {
      setSyncing(true);
      const res = await fetch(`${SYNC_URL}?date=${today()}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.products?.length > 0 || products.length === 0) {
        setProducts(data.products || []);
      }
      setEntries(data.entries || []);
    } catch (e) {
      console.warn("sync error", e);
    } finally {
      setSyncing(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const syncToServer = useCallback(async (prods: Product[], ents: DailyEntry[]) => {
    try {
      await fetch(SYNC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: prods, entries: ents, deleted_products: [], deleted_entries: [] }),
      });
    } catch (e) {
      console.warn("sync to server error", e);
    }
  }, []);

  useEffect(() => {
    syncFromServer();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addProduct = (p: Omit<Product, "id">) => {
    const newProduct: Product = { ...p, id: crypto.randomUUID() };
    const updated = [...products, newProduct];
    setProducts(updated);
    syncToServer(updated, entries);
    return newProduct;
  };

  const updateProduct = (id: string, p: Omit<Product, "id">) => {
    const updated = products.map((x) => (x.id === id ? { ...x, ...p } : x));
    setProducts(updated);
    syncToServer(updated, entries);
  };

  const removeProduct = (id: string) => {
    const updated = products.filter((x) => x.id !== id);
    setProducts(updated);
    syncToServer(updated, entries);
  };

  const addEntry = (productId: string, grams: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const factor = grams / 100;
    const entry: DailyEntry = {
      id: crypto.randomUUID(),
      product_id: prod.id,
      product_name: prod.name,
      grams,
      calories: Math.round(prod.calories * factor * 10) / 10,
      potassium: Math.round(prod.potassium * factor * 10) / 10,
      phosphorus: Math.round(prod.phosphorus * factor * 10) / 10,
      eaten_at: today(),
      created_at: new Date().toISOString(),
    };
    const updated = [...entries, entry];
    setEntries(updated);
    syncToServer(products, updated);
  };

  const removeEntry = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
  };

  const totals = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      potassium: acc.potassium + e.potassium,
      phosphorus: acc.phosphorus + e.phosphorus,
    }),
    { calories: 0, potassium: 0, phosphorus: 0 }
  );

  const exportDb = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`${SYNC_URL}?date=all`);
      const data = res.ok ? await res.json() : { products, entries };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nutrition-db-${today()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn("export error", e);
    } finally {
      setSyncing(false);
    }
  };

  const importDb = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const prods: Product[] = data.products || [];
      const ents: DailyEntry[] = data.entries || [];
      setProducts(prods);
      setEntries(ents);
      await syncToServer(prods, ents);
    } catch (e) {
      console.warn("import error", e);
      alert("Ошибка при загрузке файла. Проверьте формат.");
    }
  };

  return {
    products,
    entries,
    totals,
    syncing,
    addProduct,
    updateProduct,
    removeProduct,
    addEntry,
    removeEntry,
    syncFromServer,
    exportDb,
    importDb,
  };
}