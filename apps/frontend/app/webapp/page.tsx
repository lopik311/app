"use client";

import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiGet, apiSend } from "@/lib/api";

type Me = {
  telegram_id: number;
  username?: string;
};

type Direction = { id: number; name: string };
type Slot = { id: number; label: string; direction_id: number | null };

type RequestRow = {
  id: number;
  request_number: number;
  direction: string;
  delivery_date: string;
  boxes_count: number;
  weight_kg: number;
  volume_m3: number;
  status: string;
  created_at: string;
  telegram_id: number;
  username?: string;
  comment?: string;
};

export default function WebAppPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [directions, setDirections] = useState<Direction[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [directionId, setDirectionId] = useState<number | "">("");
  const [slotId, setSlotId] = useState<number | "">("");
  const [boxes, setBoxes] = useState("1");
  const [weight, setWeight] = useState("1");
  const [volume, setVolume] = useState("1");
  const [comment, setComment] = useState("");

  function getHeaders() {
    if (typeof window === "undefined") {
      return { "X-Telegram-Init-Data": "" };
    }
    const initData = (window as any).Telegram?.WebApp?.initData || "";
    return { "X-Telegram-Init-Data": initData };
  }

  const visibleSlots = useMemo(() => {
    if (!directionId) return slots;
    return slots.filter((s) => s.direction_id === directionId || s.direction_id === null);
  }, [slots, directionId]);

  async function loadData() {
    try {
      setError("");
      const tg = (window as any).Telegram?.WebApp;
      tg?.ready?.();
      tg?.expand?.();
      const [meData, reqData, dirData, slotData] = await Promise.all([
        apiGet("/api/webapp/me", { headers: getHeaders() }),
        apiGet("/api/webapp/requests", { headers: getHeaders() }),
        apiGet("/api/webapp/directions", { headers: getHeaders() }),
        apiGet("/api/webapp/delivery-slots", { headers: getHeaders() }),
      ]);
      setMe(meData);
      setRows(reqData);
      setDirections(dirData);
      setSlots(slotData);
    } catch (e) {
      setError(String(e));
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function createRequest() {
    try {
      setError("");
      await apiSend(
        "/api/webapp/requests",
        "POST",
        {
          direction_id: Number(directionId),
          delivery_slot_id: Number(slotId),
          boxes_count: Number(boxes),
          weight_kg: Number(weight),
          volume_m3: Number(volume),
          comment: comment.trim() || null,
        },
        { headers: getHeaders() },
      );
      setOpen(false);
      setDirectionId("");
      setSlotId("");
      setBoxes("1");
      setWeight("1");
      setVolume("1");
      setComment("");
      await loadData();
    } catch (e) {
      setError(String(e));
    }
  }

  return (
    <div className="grid">
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h3 style={{ margin: 0 }}>Мои заявки</h3>
          <button className="btn" onClick={() => setOpen(true)}>
            Создать новую
          </button>
        </div>
        {me ? (
          <div style={{ marginTop: 8, color: "var(--muted)", fontSize: 13 }}>
            tg_id: {me.telegram_id} {me.username ? `| @${me.username}` : ""}
          </div>
        ) : null}
      </div>

      {error ? <div className="card" style={{ color: "var(--danger)" }}>{error}</div> : null}

      <div className="card desktop-table table-wrap">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Направление</TableHead>
              <TableHead>Дата доставки</TableHead>
              <TableHead>Короба/Вес/Объем</TableHead>
              <TableHead>Комментарий</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Создано</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.request_number}</TableCell>
                <TableCell>{r.direction}</TableCell>
                <TableCell>{r.delivery_date}</TableCell>
                <TableCell>{r.boxes_count} / {r.weight_kg} / {r.volume_m3}</TableCell>
                <TableCell>{r.comment || "-"}</TableCell>
                <TableCell><Badge>{r.status}</Badge></TableCell>
                <TableCell>{new Date(r.created_at).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mobile-cards">
        {rows.map((r) => (
          <div className="card" key={r.id}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <b>#{r.request_number}</b>
              <Badge>{r.status}</Badge>
            </div>
            <div>Направление: {r.direction}</div>
            <div>Доставка: {r.delivery_date}</div>
            <div>Короба/Вес/Объем: {r.boxes_count} / {r.weight_kg} / {r.volume_m3}</div>
            <div>Комментарий: {r.comment || "-"}</div>
            <div>Создано: {new Date(r.created_at).toLocaleString()}</div>
          </div>
        ))}
      </div>

      <Dialog open={open}>
        <div className="grid">
          <h3 style={{ margin: 0 }}>Новая заявка</h3>
          <div>
            <label>Направление</label>
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
            <label>Дата доставки</label>
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
              <label>Кол-во коробов</label>
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
          <div>
            <label>Комментарий</label>
            <textarea className="input" value={comment} onChange={(e) => setComment(e.target.value)} rows={3} />
          </div>
          <div className="row">
            <button className="btn" onClick={createRequest}>Создать</button>
            <button className="btn secondary" onClick={() => setOpen(false)}>Отмена</button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
