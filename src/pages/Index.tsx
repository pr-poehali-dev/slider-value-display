import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/hooks/useStore";
import Icon from "@/components/ui/icon";

export default function Index() {
  const navigate = useNavigate();
  const { products, entries, totals, syncing, addEntry, removeEntry } = useStore();
  const [selectedId, setSelectedId] = useState("");
  const [grams, setGrams] = useState("100");

  const handleAdd = () => {
    if (!selectedId) return;
    addEntry(selectedId, Number(grams) || 100);
    setGrams("100");
  };

  const fmt = (n: number) => Math.round(n * 10) / 10;

  return (
    <div className="min-h-screen font-body" style={{ background: "hsl(0 0% 97%)" }}>
      <header className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-white">
        <h1 className="font-display text-lg tracking-widest uppercase" style={{ color: "hsl(0 0% 10%)", fontWeight: 300 }}>
          Дневник питания
        </h1>
        <div className="flex items-center gap-3">
          {syncing && <span className="text-xs text-gray-400 tracking-wider">синхронизация...</span>}
          <button onClick={() => navigate("/settings")} className="p-1.5 rounded hover:bg-gray-100 transition-colors">
            <Icon name="Settings" size={18} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-3 border-b border-gray-200 bg-white">
        {[
          { label: "ККАЛ", value: fmt(totals.calories) },
          { label: "КАЛИЙ мг", value: fmt(totals.potassium) },
          { label: "ФОСФОР мг", value: fmt(totals.phosphorus) },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center py-4 border-r border-gray-100 last:border-r-0">
            <span className="font-display text-2xl" style={{ fontWeight: 300, color: "hsl(0 0% 10%)" }}>
              {value}
            </span>
            <span className="text-xs text-gray-400 tracking-widest mt-1">{label}</span>
          </div>
        ))}
      </div>

      <div className="px-4 py-4 border-b border-gray-200 bg-white">
        {products.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-2">
            Сначала добавьте продукты в{" "}
            <button onClick={() => navigate("/settings")} className="underline">настройках</button>
          </p>
        ) : (
          <div className="flex gap-2">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm bg-white font-body focus:outline-none focus:border-gray-400"
            >
              <option value="">— выберите продукт —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <input
              type="number"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
              className="w-20 border border-gray-200 rounded px-3 py-2 text-sm text-center font-body focus:outline-none focus:border-gray-400"
              placeholder="г"
              min={1}
            />
            <button
              onClick={handleAdd}
              disabled={!selectedId}
              className="px-4 py-2 rounded text-sm font-body transition-colors"
              style={{
                background: selectedId ? "hsl(0 0% 10%)" : "hsl(0 0% 85%)",
                color: selectedId ? "white" : "hsl(0 0% 50%)",
              }}
            >
              <Icon name="Plus" size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="px-4 py-2">
        {entries.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Записей пока нет</p>
        ) : (
          <div className="flex flex-col gap-0">
            {[...entries].reverse().map((entry, i) => (
              <div
                key={entry.id}
                className="flex items-center justify-between py-3 border-b border-gray-100"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-body" style={{ color: "hsl(0 0% 15%)" }}>
                      {entry.product_name}
                    </span>
                    <span className="text-xs text-gray-400">{entry.grams} г</span>
                  </div>
                  <div className="flex gap-3 mt-0.5">
                    <span className="text-xs text-gray-400">{fmt(entry.calories)} ккал</span>
                    <span className="text-xs text-gray-400">К: {fmt(entry.potassium)}</span>
                    <span className="text-xs text-gray-400">Ф: {fmt(entry.phosphorus)}</span>
                  </div>
                </div>
                <button
                  onClick={() => removeEntry(entry.id)}
                  className="ml-3 p-1 text-gray-300 hover:text-gray-500 transition-colors"
                >
                  <Icon name="X" size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
