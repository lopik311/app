"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { apiGet, apiSend } from "@/lib/api";

type Direction = { id: number; name: string };
type Slot = { id: number; label: string; direction_id: number | null };

export default function NewRequestPage() {
  const router = useRouter();
  const [directions, setDirections] = useState<Direction[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [directionId, setDirectionId] = useState<number | "">("");
  const [slotId, setSlotId] = useState<number | "">("");
  const [boxes, setBoxes] = useState("1");
  const [weight, setWeight] = useState("1");
  const [volume, setVolume] = useState("1");
  const [error, setError] = useState("");

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    tg?.ready?.();
    tg?.expand?.();
    const headers = { "X-Telegram-Init-Data": tg?.initData || "" };
    apiGet("/api/webapp/directions", { headers }).then(setDirections).catch((e) => setError(String(e)));
    apiGet("/api/webapp/delivery-slots", { headers }).then(setSlots).catch((e) => setError(String(e)));
  }, []);

  const visibleSlots = useMemo(() => {
    if (!directionId) return slots;
    return slots.filter((s) => s.direction_id === directionId || s.direction_id === null);
  }, [slots, directionId]);

  async function submit() {
    try {
      setError("");
      const tg = (window as any).Telegram?.WebApp;
      const headers = { "X-Telegram-Init-Data": tg?.initData || "" };
      await apiSend(
        "/api/webapp/requests",
        "POST",
        {
          direction_id: Number(directionId),
          delivery_slot_id: Number(slotId),
          boxes_count: Number(boxes),
          weight_kg: Number(weight),
          volume_m3: Number(volume),
        },
        { headers },
      );
      router.push("/webapp");
    } catch (e) {
      setError(String(e));
    }
  }

  return (
    <div className="card grid">
      <h3 style={{ margin: 0 }}>Новая заявка</h3>
      {error ? <div style={{ color: "var(--danger)" }}>{error}</div> : null}
      <div>
        <label>Направление перевозки</label>
        <select className="select" value={directionId} onChange={(e) => setDirectionId(Number(e.target.value))}>
          <option value="">Выберите</option>
          {directions.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Дата/слот доставки</label>
        <select className="select" value={slotId} onChange={(e) => setSlotId(Number(e.target.value))}>
          <option value="">Выберите</option>
          {visibleSlots.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-2">
        <div>
          <label>Количество коробов</label>
          <input className="input" value={boxes} onChange={(e) => setBoxes(e.target.value)} />
        </div>
        <div>
          <label>Вес (кг)</label>
          <input className="input" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </div>
        <div>
          <label>Объем (м3)</label>
          <input className="input" value={volume} onChange={(e) => setVolume(e.target.value)} />
        </div>
      </div>
      <button className="btn" onClick={submit}>
        Создать заявку
      </button>
    </div>
  );
}
