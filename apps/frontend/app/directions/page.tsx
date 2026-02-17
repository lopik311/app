"use client";

import { useEffect, useMemo, useState } from "react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiGet, apiSend } from "@/lib/api";

type Direction = { id: number; name: string; active: boolean };
type Slot = {
  id: number;
  direction_id: number | null;
  date: string;
  time_from?: string | null;
  time_to?: string | null;
  active: boolean;
};

export default function StaffDirectionsPage() {
  const [directions, setDirections] = useState<Direction[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const [slotDirectionId, setSlotDirectionId] = useState<string>("");
  const [slotDate, setSlotDate] = useState("");
  const [slotTimeFrom, setSlotTimeFrom] = useState("");
  const [slotTimeTo, setSlotTimeTo] = useState("");

  async function load() {
    try {
      setError("");
      const [dirData, slotData] = await Promise.all([
        apiGet("/api/admin/directions", { credentials: "include" }),
        apiGet("/api/admin/delivery-slots", { credentials: "include" }),
      ]);
      setDirections(dirData);
      setSlots(slotData);
    } catch (e) {
      setError(String(e));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createDirection() {
    try {
      await apiSend("/api/admin/directions", "POST", { name, active: true }, { credentials: "include" });
      setName("");
      await load();
    } catch (e) {
      setError(String(e));
    }
  }

  async function toggleDirection(row: Direction) {
    try {
      await apiSend(`/api/admin/directions/${row.id}`, "PATCH", { name: row.name, active: !row.active }, { credentials: "include" });
      await load();
    } catch (e) {
      setError(String(e));
    }
  }

  async function createSlot() {
    try {
      if (!slotDate) {
        setError("Выберите дату доставки.");
        return;
      }
      setError("");
      await apiSend(
        "/api/admin/delivery-slots",
        "POST",
        {
          direction_id: slotDirectionId ? Number(slotDirectionId) : null,
          date: slotDate,
          time_from: slotTimeFrom || null,
          time_to: slotTimeTo || null,
          active: true,
        },
        { credentials: "include" },
      );
      setSlotDate("");
      setSlotDirectionId("");
      setSlotTimeFrom("");
      setSlotTimeTo("");
      await load();
    } catch (e) {
      setError(String(e));
    }
  }

  async function toggleSlot(row: Slot) {
    try {
      await apiSend(
        `/api/admin/delivery-slots/${row.id}`,
        "PATCH",
        {
          direction_id: row.direction_id,
          date: row.date,
          time_from: row.time_from || null,
          time_to: row.time_to || null,
          active: !row.active,
        },
        { credentials: "include" },
      );
      await load();
    } catch (e) {
      setError(String(e));
    }
  }

  const directionMap = useMemo(() => {
    return new Map<number, string>(directions.map((d) => [d.id, d.name]));
  }, [directions]);

  return (
    <div className="grid">
      <h3 style={{ margin: 0 }}>Направления и слоты доставки</h3>
      {error ? <div className="card" style={{ color: "var(--danger)" }}>{error}</div> : null}

      <div className="card grid">
        <h4 style={{ margin: 0 }}>Добавить направление</h4>
        <div className="row">
          <input className="input" style={{ maxWidth: 360 }} placeholder="Новое направление" value={name} onChange={(e) => setName(e.target.value)} />
          <button className="btn" onClick={createDirection}>Добавить</button>
        </div>
      </div>

      <div className="card table-wrap">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Активно</TableHead>
              <TableHead>Действие</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {directions.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.name}</TableCell>
                <TableCell>{String(r.active)}</TableCell>
                <TableCell>
                  <button className="btn secondary" onClick={() => toggleDirection(r)}>Переключить</button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="card grid">
        <h4 style={{ margin: 0 }}>Добавить слот доставки</h4>
        <div className="grid grid-2">
          <div>
            <label>Направление</label>
            <select className="select" value={slotDirectionId} onChange={(e) => setSlotDirectionId(e.target.value)}>
              <option value="">Без привязки</option>
              {directions.filter((d) => d.active).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Дата доставки (слот)</label>
            <input className="input" type="date" value={slotDate} onChange={(e) => setSlotDate(e.target.value)} />
          </div>
          <div>
            <label>Время с</label>
            <input className="input" type="time" value={slotTimeFrom} onChange={(e) => setSlotTimeFrom(e.target.value)} />
          </div>
          <div>
            <label>Время по</label>
            <input className="input" type="time" value={slotTimeTo} onChange={(e) => setSlotTimeTo(e.target.value)} />
          </div>
        </div>
        <button className="btn" onClick={createSlot}>Добавить слот</button>
      </div>

      <div className="card table-wrap">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Направление</TableHead>
              <TableHead>Дата доставки (слот)</TableHead>
              <TableHead>Время</TableHead>
              <TableHead>Активно</TableHead>
              <TableHead>Действие</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slots.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.id}</TableCell>
                <TableCell>{s.direction_id ? directionMap.get(s.direction_id) || `ID ${s.direction_id}` : "Без привязки"}</TableCell>
                <TableCell>{s.date}</TableCell>
                <TableCell>{(s.time_from || "--:--") + " - " + (s.time_to || "--:--")}</TableCell>
                <TableCell>{String(s.active)}</TableCell>
                <TableCell>
                  <button className="btn secondary" onClick={() => toggleSlot(s)}>Переключить</button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
