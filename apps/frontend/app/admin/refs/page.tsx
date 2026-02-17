"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiGet, apiSend } from "@/lib/api";

type Direction = { id: number; name: string };
type Slot = { id: number; direction_id: number | null; date: string };

export default function AdminRefsPage() {
  const [directions, setDirections] = useState<Direction[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [directionName, setDirectionName] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      const [d, s] = await Promise.all([
        apiGet("/api/admin/directions", { credentials: "include" }),
        apiGet("/api/admin/delivery-slots", { credentials: "include" }),
      ]);
      setDirections(d);
      setSlots(s);
    } catch (e) {
      setError(String(e));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createDirection() {
    try {
      await apiSend("/api/admin/directions", "POST", { name: directionName }, { credentials: "include" });
      setDirectionName("");
      await load();
    } catch (e) {
      setError(String(e));
    }
  }

  return (
    <div className="grid">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h3 style={{ margin: 0 }}>Справочники</h3>
        <Link href="/admin/requests">Назад к заявкам</Link>
      </div>

      {error ? <div className="card" style={{ color: "var(--danger)" }}>{error}</div> : null}

      <div className="card grid">
        <h4 style={{ margin: 0 }}>Направления</h4>
        <div className="row">
          <input className="input" style={{ maxWidth: 360 }} value={directionName} onChange={(e) => setDirectionName(e.target.value)} placeholder="Новое направление" />
          <button className="btn" onClick={createDirection}>Добавить</button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Название</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {directions.map((d) => (
              <TableRow key={d.id}>
                <TableCell>{d.id}</TableCell>
                <TableCell>{d.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="card">
        <h4 style={{ marginTop: 0 }}>Слоты доставки</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Direction ID</TableHead>
              <TableHead>Дата</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slots.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.id}</TableCell>
                <TableCell>{s.direction_id ?? "-"}</TableCell>
                <TableCell>{s.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
