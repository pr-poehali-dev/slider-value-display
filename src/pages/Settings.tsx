import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useStore, Product } from "@/hooks/useStore";
import Icon from "@/components/ui/icon";

const empty = { name: "", calories: "", potassium: "", phosphorus: "" };

export default function Settings() {
  const navigate = useNavigate();
  const { products, syncing, addProduct, updateProduct, removeProduct, exportDb, importDb } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<Product | null>(null);

  const handleField = (field: string, val: string) => setForm((f) => ({ ...f, [field]: val }));

  const handleSave = () => {
    const data = {
      name: form.name.trim(),
      calories: Number(form.calories) || 0,
      potassium: Number(form.potassium) || 0,
      phosphorus: Number(form.phosphorus) || 0,
    };
    if (!data.name) return;
    if (editing) {
      updateProduct(editing.id, data);
      setEditing(null);
    } else {
      addProduct(data);
    }
    setForm(empty);
  };

  const startEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      calories: String(p.calories),
      potassium: String(p.potassium),
      phosphorus: String(p.phosphorus),
    });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(empty);
  };

  return (
    <div className="min-h-screen font-body" style={{ background: "hsl(0 0% 97%)" }}>
      <header className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 bg-white">
        <button onClick={() => navigate("/")} className="p-1.5 rounded hover:bg-gray-100 transition-colors">
          <Icon name="ArrowLeft" size={18} />
        </button>
        <h1 className="font-display text-lg tracking-widest uppercase" style={{ color: "hsl(0 0% 10%)", fontWeight: 300 }}>
          Продукты
        </h1>
      </header>

      <div className="px-4 py-4 bg-white border-b border-gray-200">
        <p className="text-xs text-gray-400 tracking-widest uppercase mb-3">База данных</p>
        <div className="flex gap-2">
          <button
            onClick={exportDb}
            disabled={syncing}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded text-sm font-body border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Icon name="Download" size={14} />
            Скачать базу
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={syncing}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded text-sm font-body border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Icon name="Upload" size={14} />
            Загрузить базу
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importDb(file);
              e.target.value = "";
            }}
          />
        </div>
        {syncing && <p className="text-xs text-gray-400 text-center mt-2">синхронизация...</p>}
      </div>

      <div className="px-4 py-4 bg-white border-b border-gray-200">
        <p className="text-xs text-gray-400 tracking-widest uppercase mb-3">
          {editing ? "Редактировать продукт" : "Новый продукт"} (на 100 г)
        </p>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Название продукта"
            value={form.name}
            onChange={(e) => handleField("name", e.target.value)}
            className="border border-gray-200 rounded px-3 py-2 text-sm font-body focus:outline-none focus:border-gray-400 w-full"
          />
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Ккал</label>
              <input
                type="number"
                placeholder="0"
                value={form.calories}
                onChange={(e) => handleField("calories", e.target.value)}
                className="border border-gray-200 rounded px-3 py-2 text-sm font-body focus:outline-none focus:border-gray-400 w-full"
                min={0}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Калий мг</label>
              <input
                type="number"
                placeholder="0"
                value={form.potassium}
                onChange={(e) => handleField("potassium", e.target.value)}
                className="border border-gray-200 rounded px-3 py-2 text-sm font-body focus:outline-none focus:border-gray-400 w-full"
                min={0}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Фосфор мг</label>
              <input
                type="number"
                placeholder="0"
                value={form.phosphorus}
                onChange={(e) => handleField("phosphorus", e.target.value)}
                className="border border-gray-200 rounded px-3 py-2 text-sm font-body focus:outline-none focus:border-gray-400 w-full"
                min={0}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-1">
            <button
              onClick={handleSave}
              disabled={!form.name.trim()}
              className="flex-1 py-2 rounded text-sm font-body transition-colors"
              style={{
                background: form.name.trim() ? "hsl(0 0% 10%)" : "hsl(0 0% 85%)",
                color: form.name.trim() ? "white" : "hsl(0 0% 50%)",
              }}
            >
              {editing ? "Сохранить" : "Добавить"}
            </button>
            {editing && (
              <button
                onClick={cancelEdit}
                className="px-4 py-2 rounded text-sm font-body border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-2">
        {products.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Список продуктов пуст</p>
        ) : (
          <div className="flex flex-col">
            {products.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-body" style={{ color: "hsl(0 0% 15%)" }}>{p.name}</span>
                  <div className="flex gap-3 mt-0.5">
                    <span className="text-xs text-gray-400">{p.calories} ккал</span>
                    <span className="text-xs text-gray-400">К: {p.potassium}</span>
                    <span className="text-xs text-gray-400">Ф: {p.phosphorus}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => startEdit(p)}
                    className="p-1.5 text-gray-300 hover:text-gray-500 transition-colors"
                  >
                    <Icon name="Pencil" size={13} />
                  </button>
                  <button
                    onClick={() => removeProduct(p.id)}
                    className="p-1.5 text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <Icon name="Trash2" size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}